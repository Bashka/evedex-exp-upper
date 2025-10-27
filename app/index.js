const evedexSdk = require("@evedex/exchange-bot-sdk");
const { WebSocket } = require("ws");

const evedexContainer = new evedexSdk.DemoContainer({
  centrifugeWebSocket: WebSocket,
  wallets: {
    bot: {
      privateKey: "0x...", // your bot private key
    },
  },
  apiKeys: {
    bot: {
      apiKey: 'v2:...', // your bot api key
    },
  },
});

async function main() {
  const apiKeyAccount = await evedexContainer.apiKeyAccount("bot");
  const botWallet = new evedexSdk.WalletAccount({
    gateway: apiKeyAccount.gateway,
    wallet: evedexContainer.wallet("bot"),
    exchangeAccount: await apiKeyAccount.fetchMe(),
  });

  await botWallet.updatePosition({
    instrument: "BTCUSD:DEMO",
    leverage: 50,
  });

  let side = evedexSdk.Side.Buy;
  setInterval(async () => {
    try {
      const order = await botWallet.createMarketOrderV2({
        instrument: "BTCUSD:DEMO",
        leverage: 50,
        side,
        timeInForce: evedexSdk.TimeInForce.IOC,
        cashQuantity: 5000,
      });
      console.info(`Create order ${order.id}`);
      side =
        side === evedexSdk.Side.Buy ? evedexSdk.Side.Sell : evedexSdk.Side.Buy;
    } catch (e) {
      const errorString = e instanceof Error ? e.stack : String(e);
      console.error(errorString);
    }
  }, 5000);
}

main().catch((e) => console.error(e));
