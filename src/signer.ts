import { ethers } from "ethers";
import { env } from "./config";

export class Signer {
  private static _instance: Signer;
  public readonly wallet: ethers.Wallet;

  private constructor() {
    this.wallet = new ethers.Wallet(env.PRIVATE_KEY);
  }

  public static get instance(): Signer {
    if (!Signer._instance) {
      this._instance = new Signer();
    }
    return this._instance;
  }
}
