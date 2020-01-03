const sinon = require("sinon");
const { expect } = require("chai");
const { pool } = require("../src/db");
const {
  excessRatio,
  deficitRatio,
  setDeficitRatio,
  setExcessRatio,
  excessRatioQuery,
  deficitRatioQuery,
  setDeficitRatioQuery,
  setExcessRatioQuery,
  setManagerProdRatio,
  setManagerProdRatioQuery,
  managerProdRatio,
  managerProdRatioQuery
} = require("../src/ratio");

describe("Ratios", () => {
  let poolStub;

  afterEach(() => {
    sinon.restore();
  });

  describe("excessRatio", async () => {
    it("should return the prosumers ratio of how much excess power is sold to the market", async () => {
      poolStub = sinon
        .stub(pool, "query")
        .withArgs(excessRatioQuery, [1])
        .resolves({ rows: [{ ratio_excess_market: 0.3 }] });

      const ratioExcessMarket = excessRatio(1);
      expect(await ratioExcessMarket).to.equal(0.3);
    });
  });

  describe("deficitRatio", async () => {
    it("should return the prosumers ratio of how much of the deficit power should be bought from the market", async () => {
      poolStub = sinon
        .stub(pool, "query")
        .withArgs(deficitRatioQuery, [1])
        .resolves({ rows: [{ ratio_deficit_market: 0.2 }] });

      const ratioDeficitMarket = deficitRatio(1);
      expect(await ratioDeficitMarket).to.equal(0.2);
    });
  });

  describe("setDeficitRatio", async () => {
    it("should return the prosumers new market deficit ratio", async () => {
      poolStub = sinon
        .stub(pool, "query")
        .withArgs(setDeficitRatioQuery, [1, 0.9])
        .resolves({ rows: [{}] });
      expect(await setDeficitRatio(1, 0.9)).to.equal(0.9);
    });
  });

  describe("setExcessRatio", async () => {
    it("should return the prosumers new market excess ratio", async () => {
      poolStub = sinon
        .stub(pool, "query")
        .withArgs(setExcessRatioQuery, [1, 0.1])
        .resolves({ rows: [{}] });
      expect(await setExcessRatio(1, 0.1)).to.equal(0.1);
    });
  });

  describe("setManagerProdRatio", async () => {
    it("should return the managers new production ratio", async () => {
      poolStub = sinon
        .stub(pool, "query")
        .withArgs(setManagerProdRatioQuery, [1, 0.2])
        .resolves({ rows: [{}] });
      expect(await setManagerProdRatio(1, 0.2)).to.equal(0.2);
    });
  });

  describe("managerProdRatio", async () => {
    it("should return the managers market production ratio", async () => {
      poolStub = sinon
        .stub(pool, "query")
        .withArgs(managerProdRatioQuery, [1])
        .resolves({ rows: [{ ratio_production_market: 0.8 }] });
      expect(await managerProdRatio(1)).to.equal(0.8);
    });
  });
});
