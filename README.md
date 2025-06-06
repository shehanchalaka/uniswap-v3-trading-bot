# 🦄 Uniswap V3 Trading Bot

A simple yet extensible trading bot that fetches real-time prices from a Uniswap V3 liquidity pool, evaluates trading opportunities based on configurable thresholds, and executes trades using the Uniswap V3 SwapRouter. The bot is built with TypeScript, Ethers.js, and TypeChain for type safety and developer ergonomics.

## ✨ Features

- ⛽ Fetch token prices directly from Uniswap V3 pool contracts (slot0).
- 📈 Simple buy/sell strategy based on basis point thresholds.
- ✅ Executes swaps through Uniswap V3 SwapRouter.
- 🧠 Position-aware logic — avoids overtrading by maintaining state.
- 🧪 Full unit test coverage with Mocha + Chai.
- 📦 Type-safe smart contract interactions via TypeChain.

---

## 📁 Project Structure

```text
src/
├── bot.ts              # Main execution logic
├── strategy.ts         # Position-aware buy/sell strategy
├── tradeExecutor.ts    # Handles token swap execution
├── contracts/          # TypeChain-generated contract bindings
├── abis/               # ABI definitions (e.g. UniswapV3Pool, SwapRouter)

test/
├── strategy.test.ts    # Unit tests for strategy logic

.env                    # Environment configuration
```

---

## ⚙️ Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/shehanchalaka/uniswap-v3-trading-bot.git
cd uniswap-v3-trading-bot
npm install
```

## 🔧 Environment Setup

Create a `.env` file with the following variables (refer to `.env.example`);

```bash
CHAIN_ID=11155111
WS_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

UNISWAP_V3_POOL_ADDRESS=0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8     # WETH/USDC 0.3% Pool

THRESHOLD_PRICE=3000
BUY_BPS_BELOW=2       # Buy if price is 2 bps below threshold
SELL_BPS_ABOVE=2      # Sell if price is 2 bps above threshold

PRIVATE_KEY=YOUR_PRIVATE_KEY
```

## 🔨 Generate TypeScript Bindings with TypeChain

Generate contract bindings after adding ABI files under src/abis/:

```bash
npx typechain --target ethers-v6 --out-dir src/contracts src/abis/*.json
```

## 🚀 Start the Bot

```bash
npm run start
```

## 🧪 Run Tests

```bash
npm test
```

---

## 📌 Notes

- This bot is designed for educational or testnet use. Avoid using it with real funds until thoroughly audited and tested.

- You can simulate transactions using a local fork (e.g., Anvil or Hardhat) or run against testnets like Sepolia.

- Consider integrating persistent storage (e.g., Redis or file-based state) for production use.