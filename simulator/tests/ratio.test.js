const sinon = require("sinon");
const { expect } = require("chai");
const { pool } = require("../src/db");
const {
  excessRatio,
  deficitRatio,
  excessRatioQuery,
  deficitRatioQuery
} = require("../src/ratio");

describe("excessRatio", async () => {
  let poolStub;

  afterEach(() => {
    sinon.restore();
  });

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
  let poolStub;

  afterEach(() => {
    sinon.restore();
  });

  it("should return the prosumers ratio of how much of the deficit power should be bought from the market", async () => {
    poolStub = sinon
      .stub(pool, "query")
      .withArgs(deficitRatioQuery, [1])
      .resolves({ rows: [{ ratio_deficit_market: 0.2 }] });

    const ratioDeficitMarket = deficitRatio(1);
    expect(await ratioDeficitMarket).to.equal(0.2);
  });
});
