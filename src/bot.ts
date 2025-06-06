import { ethers } from "ethers";
import {
  UniswapV3Pool__factory,
  UniswapV3Pool,
  Erc20__factory,
} from "./contracts";
import Decimal from "decimal.js";
import { env } from "./config";
import { Strategy } from "./strategy";
import { Executor } from "./tradeExecutor";
import { Signer } from "./signer";

export interface Token {
  address: string;
  decimals: number;
  symbol: string;
}

const provider = new ethers.WebSocketProvider(env.WS_RPC_URL, env.CHAIN_ID, {
  staticNetwork: ethers.Network.from(env.CHAIN_ID),
});

/**
 * Bot class encapsulates the trading bot's main logic:
 * - Listens to Uniswap V3 Swap events
 * - Fetches on-chain pool state and prices
 * - Executes buy/sell trades based on a configurable strategy
 */
class Bot {
  private readonly poolContract: UniswapV3Pool;
  private readonly strategy: Strategy;
  private readonly executor: Executor;
  private readonly signer: Signer;

  private poolFee: bigint = BigInt(0);
  private token0: Token | null = null;
  private token1: Token | null = null;

  constructor() {
    this.poolContract = UniswapV3Pool__factory.connect(
      env.UNISWAP_V3_POOL_ADDRESS,
      provider
    );
    this.strategy = new Strategy(
      env.THRESHOLD_PRICE,
      env.BUY_BPS_BELOW,
      env.SELL_BPS_ABOVE
    );
    this.executor = new Executor(
      env.CHAIN_ID,
      env.UNISWAP_V3_POOL_ADDRESS,
      provider
    );
    this.signer = Signer.instance;
  }

  async onSwap(log: any) {
    console.log("New Swap Event");
    const parsedLog = this.poolContract.interface.parseLog(log);
    if (!parsedLog) return;

    const sqrtPriceX96 = parsedLog.args[4] as bigint;
    console.log("sqrtPriceX96:", sqrtPriceX96);

    const spX96 = new Decimal(sqrtPriceX96.toString());
    const e12 = new Decimal(10).pow(12);
    const e96 = new Decimal(2).pow(96);
    const currentPrice = e12.mul(spX96.div(e96).pow(2)).toNumber();

    console.log(
      "Price:",
      currentPrice,
      "| Position:",
      this.strategy.hasOpenPosition() ? "OPEN" : "NONE"
    );

    // If token metadata hasn't been loaded, exit early
    if (!this.token0 || !this.token1) return;

    if (this.strategy.shouldBuy(currentPrice)) {
      console.log("🟢 Buying...");

      const buySize = ethers.parseUnits("1", this.token0.decimals);
      console.log("buy size:", buySize);

      const confirmed = await this.executor.executeSwap(
        this.token0.address,
        this.token1.address,
        this.poolFee,
        buySize
      );
      if (confirmed) this.strategy.setOpenPosition(true);
    } else if (this.strategy.shouldSell(currentPrice)) {
      console.log("🔴 Selling...");

      const sellSize = await this.fetchTokenBalance(this.token1.address);
      console.log("sell size:", sellSize);

      const confirmed = await this.executor.executeSwap(
        this.token1.address,
        this.token0.address,
        this.poolFee,
        sellSize
      );
      if (confirmed) this.strategy.setOpenPosition(false);
    } else {
      console.log("No action needed.");
    }
  }

  async fetchTokenBalance(address: string): Promise<bigint> {
    const token = Erc20__factory.connect(address, provider);

    const balance = await token.balanceOf(this.signer.wallet.address);

    return balance;
  }

  async fetchTokenMetadata(address: string): Promise<Token> {
    const token = Erc20__factory.connect(address, provider);

    const [decimals, symbol] = await Promise.all([
      token.decimals(),
      token.symbol(),
    ]);

    return { address, decimals: Number(decimals), symbol };
  }

  async run() {
    console.log("Starting bot...");
    console.log(`Uniswap V3 Pool Address: ${env.UNISWAP_V3_POOL_ADDRESS}`);
    console.log(`Price Threshold: ${env.THRESHOLD_PRICE}`);
    console.log(`Buy Bps Below: ${env.BUY_BPS_BELOW}`);
    console.log(`Sell Bps Above: ${env.SELL_BPS_ABOVE}`);

    const [poolFee, token0, token1] = await Promise.all([
      this.poolContract.fee(),
      this.poolContract.token0(),
      this.poolContract.token1(),
    ]);

    [this.token0, this.token1] = await Promise.all([
      this.fetchTokenMetadata(token0),
      this.fetchTokenMetadata(token1),
    ]);

    this.poolFee = poolFee;

    console.log("Pool Fee:", this.poolFee);
    console.log("Token 0:", this.token0);
    console.log("Token 1:", this.token1);

    // Swap event topic0 (hashed signature)
    const topic =
      "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67";

    // Subscribe to on-chain Uniswap V3 Swap events
    const filter = { address: env.UNISWAP_V3_POOL_ADDRESS, topics: [topic] };
    provider.on(filter, (log) => this.onSwap(log));
  }
}

async function main() {
  const bot = new Bot();
  await bot.run();
}

main();
