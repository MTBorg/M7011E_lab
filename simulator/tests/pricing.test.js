const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { expect } = require("chai");
const { pool } = require("../src/db.js");
const {
  START_PRICE,
  PRICE_COEFFICIENT,
  PROSUMERS_QUERY,
  PRICE_QUERY,
  getPricing
} = require("../src/pricing");

describe("pricing", async () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("simulation pricing", async () => {
    it("should return at least the starting price", async () => {
      const mockModule = proxyquire("../src/pricing", {
        "./windturbine": {
          turbineOutput: () => 1000000
        }
      });
      const prosumers = [
        {
          current_consumption: 0,
          current_wind_speed: 10,
          ratio_excess_market: 1,
          ratio_deficit_market: 0.8
        },
        {
          current_consumption: 0,
          current_wind_speed: 10,
          ratio_excess_market: 1,
          ratio_deficit_market: 0.4
        }
      ];

      sinon
        .stub(pool, "query")
        .withArgs(PROSUMERS_QUERY)
        .resolves({ rows: prosumers });

      expect(await mockModule.getSimPricing()).to.be.at.least(START_PRICE);
    });

    it("should return the correct price", async () => {
      const prosumers = [
        {
          current_consumption: 20,
          current_wind_speed: 10,
          ratio_excess_market: 10,
          ratio_deficit_market: 0.8
        },
        {
          current_consumption: 0,
          current_wind_speed: 10,
          ratio_excess_market: 0.4,
          ratio_deficit_market: 10
        }
      ];

      const mockModule = proxyquire("../src/pricing", {
        "./windturbine": {
          turbineOutput: () => 10
        }
      });

      sinon
        .stub(pool, "query")
        .withArgs(PROSUMERS_QUERY)
        .resolves({ rows: prosumers });

      expect(await mockModule.getSimPricing()).to.equal(
        START_PRICE + 4 * PRICE_COEFFICIENT
      );
    });
  });

  describe("manager pricing", async () => {
    it("should return the correct price", async () => {
      sinon
        .stub(pool, "query")
        .withArgs(PRICE_QUERY)
        .resolves({ rows: [{ price: 0.8 }] });

      expect(await getPricing()).to.equal(0.8);
    });
  });
});
