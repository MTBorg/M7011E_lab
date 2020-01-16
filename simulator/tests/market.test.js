const sinon = require("sinon");
const { expect } = require("chai");
const { pool } = require("../src/db.js");
const {
  sellToMarket,
  buyFromMarket,
  sellQuery,
  buyBatteryQuery,
  buyBatteryBeforeQuery,
  buyMarketSupplyQuery,
  buyMarketSupplyBeforeQuery,
  powerPlantStatusQuery
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

  describe("while the power plant is not producing", async () => {
    it("should return requested amount if the power plant can supply it with the battery", async () => {
      sinon.stub(pool, "connect").resolves(client);
      sinon
        .stub(client, "query")
        .withArgs(buyBatteryBeforeQuery)
        .resolves({ rows: [{ power: 500 }] })
        .withArgs(buyBatteryQuery, [500])
        .resolves({ rows: [{ after_amount: 0 }] })
        .withArgs(powerPlantStatusQuery)
        .resolves({ rows: [{ status: "stopped" }] });

      const boughtAmount = buyFromMarket(500);
      expect(await boughtAmount).to.equal(500);
    });

    it("should return the actual bought amount if the request exceeds the available supply in the battery", async () => {
      sinon.stub(pool, "connect").resolves(client);
      sinon
        .stub(client, "query")
        .withArgs(buyBatteryBeforeQuery)
        .resolves({ rows: [{ power: 50 }] })
        .withArgs(buyBatteryQuery, [500])
        .resolves({ rows: [{ after_amount: 0 }] })
        .withArgs(powerPlantStatusQuery)
        .resolves({ rows: [{ status: "starting" }] });

      const boughtAmount = buyFromMarket(500);
      expect(await boughtAmount).to.equal(50);
    });
  });

  describe("while the power plant is producing", async () => {
    it("should return the requested amount if the electricity directed to the market can supply it", async () => {
      sinon.stub(pool, "connect").resolves(client);
      sinon
        .stub(client, "query")
        .withArgs(buyMarketSupplyBeforeQuery)
        .resolves({ rows: [{ market_electricity: 500 }] })
        .withArgs(buyMarketSupplyQuery, [500])
        .resolves({ rows: [{ after_amount: 0 }] })
        .withArgs(powerPlantStatusQuery)
        .resolves({ rows: [{ status: "started" }] });

      const boughtAmount = buyFromMarket(500);
      expect(await boughtAmount).to.equal(500);
    });

    it("should return the actual bought amount if the electricity directed to the market cannot supply it", async () => {
      sinon.stub(pool, "connect").resolves(client);
      sinon
        .stub(client, "query")
        .withArgs(buyMarketSupplyBeforeQuery)
        .resolves({ rows: [{ market_electricity: 250 }] })
        .withArgs(buyMarketSupplyQuery, [500])
        .resolves({ rows: [{ after_amount: 0 }] })
        .withArgs(powerPlantStatusQuery)
        .resolves({ rows: [{ status: "started" }] });

      const boughtAmount = buyFromMarket(500);
      expect(await boughtAmount).to.equal(250);
    });
  });
});
