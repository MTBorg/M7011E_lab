const sinon = require("sinon");
const { expect } = require("chai");
const { pool } = require("../src/db.js");
const {
  getPricing,
  START_PRICE,
  PRICE_COEFFICIENT,
  CONSUMPTION_SUM_QUERY,
  CURRENT_WINDSPEED_QUERY
} = require("../src/pricing");
const { turbineOutput } = require("../src/windturbine");

describe("pricing", async () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should return the correct price", async () => {
    const windSpeeds = [
      { current_wind_speed: 10 },
      { current_wind_speed: 20 },
      { current_wind_speed: 30 }
    ];
    const prodSum = windSpeeds.reduce(
      (sum, w) => sum + turbineOutput(w.current_wind_speed),
      0
    );
    sinon
      .stub(pool, "query")
      .withArgs(CONSUMPTION_SUM_QUERY)
      .resolves({ rows: [{ sum: 200 }] })
      .withArgs(CURRENT_WINDSPEED_QUERY)
      .resolves({ rows: windSpeeds });

    expect(await getPricing()).to.equal(
      START_PRICE + (200 - prodSum) * PRICE_COEFFICIENT
    );
  });
});
