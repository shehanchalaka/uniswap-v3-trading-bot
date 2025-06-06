import { ethers } from "ethers";
import { Erc20__factory } from "../src/contracts";
import dotenv from "dotenv";
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY as string;
const wallet = new ethers.Wallet(PRIVATE_KEY);

const spender = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E";
const tokenAddress = "0xfff9976782d46cc05630d1f6ebab18b2324d6b14"; // WETH

const chainId = 11155111;
const url = "https://ethereum-sepolia-rpc.publicnode.com";
const provider = new ethers.JsonRpcProvider(url);

async function main() {
  const token = Erc20__factory.connect(tokenAddress, provider);
  const iface = Erc20__factory.createInterface();

  const data = iface.encodeFunctionData("approve", [
    ethers.getAddress(spender),
    ethers.MaxUint256,
  ]);

  const [nonce, feeData] = await Promise.all([
    provider.getTransactionCount(wallet.address),
    provider.getFeeData(),
  ]);

  const tx: ethers.TransactionRequest = {
    chainId,
    to: tokenAddress,
    from: wallet.address,
    data,
    nonce,
    gasLimit: 100000,
    maxFeePerGas: feeData.maxFeePerGas,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    type: 2,
  };

  const signedTx = await wallet.signTransaction(tx);
  console.log("signed tx: ", signedTx);

  const txHash = await provider.send("eth_sendRawTransaction", [signedTx]);
  console.log("✅ Sent tx:", txHash);

  const receipt = await provider.waitForTransaction(txHash, 1, 120000);
  console.log(receipt);

  if (!receipt) {
    console.log("⚠️ Transaction not found or timed out.");
  } else if (receipt.status === 1) {
    console.log("✅ Transaction succeeded.");
  } else if (receipt.status === 0) {
    console.log("❌ Transaction reverted.");
  }
}

main();
