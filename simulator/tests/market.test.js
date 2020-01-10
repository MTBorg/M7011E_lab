const sinon = require("sinon");
const { expect } = require("chai");
const { pool } = require("../src/db.js");
const {
  sellToMarket,
  buyFromMarket,
  sellQuery,
  buyQuery,
  buyBeforeQuery
} = require("../src/models/market.js");

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
  afterEach(() => {
    sinon.restore();
  });

  const client = {
    query() {},
    release() {}
  };

  it("should return requested amount when the power plant can supply it", async () => {
    sinon.stub(pool, "connect").resolves(client);
    sinon
      .stub(client, "query")
      .withArgs(buyBeforeQuery)
      .resolves({ rows: [{ power: 500 }] })
      .withArgs(buyQuery, [500])
      .resolves({ rows: [{ after_amount: 0 }] });

    const boughtAmount = buyFromMarket(500);
    expect(await boughtAmount).to.equal(500);
  });

  it("should return the actual bought amount if the request exceeds the available supply", async () => {
    sinon.stub(pool, "connect").resolves(client);
    sinon
      .stub(client, "query")
      .withArgs(buyBeforeQuery)
      .resolves({ rows: [{ power: 50 }] })
      .withArgs(buyQuery, [500])
      .resolves({ rows: [{ after_amount: 0 }] });

    const boughtAmount = buyFromMarket(500);
    expect(await boughtAmount).to.equal(50);
  });
});
