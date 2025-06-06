import { ethers } from "ethers";
import { UniswapV2Router__factory } from "./contracts";
import { Signer } from "./signer";

export class Executor {
  private readonly chainId: number;
  private readonly poolAddress: string;
  private readonly provider: ethers.WebSocketProvider;
  private readonly signer: Signer;

  constructor(
    chainId: number,
    poolAddress: string,
    provider: ethers.WebSocketProvider
  ) {
    this.chainId = chainId;
    this.poolAddress = poolAddress;
    this.provider = provider;
    this.signer = Signer.instance;
  }

  async executeSwap(
    tokenIn: string,
    tokenOut: string,
    fee: bigint,
    amountIn: bigint
  ): Promise<boolean> {
    console.log("Executing swap...");
    const iface = UniswapV2Router__factory.createInterface();

    const data = iface.encodeFunctionData("exactInputSingle", [
      {
        tokenIn,
        tokenOut,
        fee,
        recipient: this.signer.wallet.address,
        amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
      },
    ]);

    const [nonce, feeData] = await Promise.all([
      this.provider.getTransactionCount(this.signer.wallet.address),
      this.provider.getFeeData(),
    ]);

    const tx: ethers.TransactionRequest = {
      chainId: this.chainId,
      to: this.poolAddress,
      from: this.signer.wallet.address,
      data,
      nonce,
      gasLimit: 300000,
      maxFeePerGas: feeData.maxFeePerGas,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      type: 2,
    };
    console.log("tx request:", tx);

    const signedTx = await this.signer.wallet.signTransaction(tx);
    console.log("signed tx: ", signedTx);

    const txHash = await this.provider.send("eth_sendRawTransaction", [
      signedTx,
    ]);
    console.log("✅ Sent tx:", txHash);

    // wait for tx to be included with a 2 min timeout
    const receipt = await this.provider.waitForTransaction(txHash, 1, 120000);
    console.log(receipt);

    if (!receipt) {
      console.log("⚠️ Transaction not found or timed out.");
    } else if (receipt.status === 1) {
      console.log("✅ Transaction succeeded.");
      return true;
    } else if (receipt.status === 0) {
      console.log("❌ Transaction reverted.");
    }

    return false;
  }
}
