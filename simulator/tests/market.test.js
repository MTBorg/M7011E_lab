const sinon = require("sinon");
const { expect } = require("chai");
const { pool } = require("../src/db");
const {
  sellToMarket,
  buyFromMarket,
  sellQuery,
  buyQuery
} = require("../src/market");

describe("sellToMarket", async () => {
  let poolStub;

  afterEach(() => {
    sinon.restore();
  });

  it("should return requested amount when the power plant can store the requested amount", async () => {
    poolStub = sinon
      .stub(pool, "query")
      .withArgs(sellQuery, [500])
      .resolves({ rows: [{ sold_amount: 500 }] });

    const soldAmount = sellToMarket(500);
    expect(await soldAmount).to.equal(500);
  });

  it("should only return the sold amount when the requested amount exceeds the capacity of the power plants battery", async () => {
    poolStub = sinon
      .stub(pool, "query")
      .withArgs(sellQuery, [500])
      .resolves({ rows: [{ sold_amount: 300 }] });

    const soldAmount = sellToMarket(500);
    expect(await soldAmount).to.equal(300);
  });
});

describe("buyFromMarket", async () => {
  let poolStub;

  afterEach(() => {
    sinon.restore();
  });

  it("should return requested amount when the power plant can supply it", async () => {
    poolStub = sinon
      .stub(pool, "query")
      .withArgs(buyQuery, [500])
      .resolves({ rows: [{ bought_amount: 500 }] });

    const boughtAmount = buyFromMarket(500);
    expect(await boughtAmount).to.equal(500);
  });

  it("should return the actual bought amount if the request exceeds the available supply", async () => {
    poolStub = sinon
      .stub(pool, "query")
      .withArgs(buyQuery, [500])
      .resolves({ rows: [{ bought_amount: 200 }] });

    const boughtAmount = buyFromMarket(500);
    expect(await boughtAmount).to.equal(200);
  });
});
