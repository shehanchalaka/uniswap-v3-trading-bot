import { expect } from "chai";
import { Strategy } from "../src/strategy";

describe("Strategy", () => {
  const threshold = 100;
  const buyBpsBelow = 500; // 5%
  const sellBpsAbove = 500; // 5%
  let strategy: Strategy;

  beforeEach(() => {
    strategy = new Strategy(threshold, buyBpsBelow, sellBpsAbove);
  });

  describe("shouldBuy", () => {
    it("returns true if price is below trigger and no open position", () => {
      const currentPrice = 94.99; // threshold - 5.01%
      expect(strategy.shouldBuy(currentPrice)).to.be.true;
    });

    it("returns false if price is above trigger", () => {
      const currentPrice = 95.01; // threshold - 4.99%
      expect(strategy.shouldBuy(currentPrice)).to.be.false;
    });

    it("returns false if there is already an open position", () => {
      strategy.setOpenPosition(true);
      const currentPrice = 94;
      expect(strategy.shouldBuy(currentPrice)).to.be.false;
    });
  });

  describe("shouldSell", () => {
    beforeEach(() => strategy.setOpenPosition(true));

    it("returns true if price is above trigger and position is open", () => {
      const currentPrice = 105.01; // threshold + 5.01%
      expect(strategy.shouldSell(currentPrice)).to.be.true;
    });

    it("returns false if price is below trigger", () => {
      const currentPrice = 104.99; // threshold + 4.99%
      expect(strategy.shouldSell(currentPrice)).to.be.false;
    });

    it("returns false if no open position", () => {
      strategy.setOpenPosition(false);
      const currentPrice = 106;
      expect(strategy.shouldSell(currentPrice)).to.be.false;
    });
  });

  describe("position state", () => {
    it("starts with no open position", () => {
      expect(strategy.hasOpenPosition()).to.be.false;
    });

    it("can set and get open position", () => {
      strategy.setOpenPosition(true);
      expect(strategy.hasOpenPosition()).to.be.true;
      strategy.setOpenPosition(false);
      expect(strategy.hasOpenPosition()).to.be.false;
    });
  });
});
