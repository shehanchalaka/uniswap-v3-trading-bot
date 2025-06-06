/**
 * Strategy class encapsulates basic buy/sell decision logic for a trading bot.
 * - Buys when the price drops a specified number of basis points below a threshold.
 * - Sells when the price rises a specified number of basis points above the threshold.
 * - Maintains position state to prevent repeated buys or sells while a position is open.
 */

export class Strategy {
  private threshold: number;
  private buyBpsBelow: number;
  private sellBpsAbove: number;
  private openPosition: boolean;

  constructor(threshold: number, buyBpsBelow: number, sellBpsAbove: number) {
    this.threshold = threshold;
    this.buyBpsBelow = buyBpsBelow;
    this.sellBpsAbove = sellBpsAbove;
    this.openPosition = false;
  }

  public shouldBuy(currentPrice: number): boolean {
    if (this.openPosition) return false;
    const buyTriggerPrice = this.threshold * (1 - this.buyBpsBelow / 10000);
    return currentPrice < buyTriggerPrice;
  }

  public shouldSell(currentPrice: number): boolean {
    if (!this.openPosition) return false;
    const sellTriggerPrice = this.threshold * (1 + this.sellBpsAbove / 10000);
    return currentPrice > sellTriggerPrice;
  }

  public hasOpenPosition(): boolean {
    return this.openPosition;
  }

  public setOpenPosition(open: boolean): void {
    this.openPosition = open;
  }
}
