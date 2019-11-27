const sinon = require("sinon");
const { expect } = require("chai");
const { pool } = require("../src/db");
const {
  getCurrentProduction,
  stopPowerPlant,
  startRequestPowerPlant,
  POWERPLANT_STATUS_QUERY,
  POWERPLANT_OUTPUT,
  POWERPLANT_STOP_QUERY,
  POWERPLANT_UPDATE_QUERY
} = require("../src/powerplant");

describe("Power plant", async () => {
  afterEach(() => {
    sinon.restore();
  });

  describe("current production", async () => {
    it("Should return zero production if the power plant is stopped", async () => {
      const id = 3;
      sinon
        .stub(pool, "query")
        .withArgs(POWERPLANT_STATUS_QUERY, [id])
        .resolves({ rows: [{ status: "stopped" }] });

      expect(await getCurrentProduction(id)).to.equal(0);
    });

    it("Should constant non-zero production if the power plant is started", async () => {
      const id = 3;
      sinon
        .stub(pool, "query")
        .withArgs(POWERPLANT_STATUS_QUERY, [id])
        .resolves({ rows: [{ status: "started" }] });

      expect(await getCurrentProduction(id)).to.equal(POWERPLANT_OUTPUT);
    });

    it("Should return zero production if the power plant is starting", async () => {
      const id = 3;
      sinon
        .stub(pool, "query")
        .withArgs(POWERPLANT_STATUS_QUERY, [id])
        .resolves({ rows: [{ status: "starting" }] });

      expect(await getCurrentProduction(id)).to.equal(0);
    });
  });

  describe("stopping powerplant", async () => {
    it("Should return status stopped if successfully stopped", async () => {
      const id = 3;
      sinon
        .stub(pool, "query")
        .withArgs(POWERPLANT_STOP_QUERY, ["stopped", id])
        .resolves({ rows: [{ status: "stopped" }] });

      expect(await stopPowerPlant(id)).to.equal("stopped");
    });
  });

  describe("starting powerplant", async () => {
    it("should return status as starting when already starting", async () => {
      const id = 3;
      sinon
        .stub(pool, "query")
        .withArgs(POWERPLANT_STATUS_QUERY, [id])
        .resolves({ rows: [{ status: "starting" }] });

      expect(await startRequestPowerPlant(id)).to.equal("starting");
    });

    it("should return status as started when already started", async () => {
      const id = 3;
      sinon
        .stub(pool, "query")
        .withArgs(POWERPLANT_STATUS_QUERY, [id])
        .resolves({ rows: [{ status: "started" }] });

      expect(await startRequestPowerPlant(id)).to.equal("started");
    });

    it("should return status as starting when stopped", async () => {
      const id = 3;
      sinon
        .stub(pool, "query")
        .withArgs(POWERPLANT_STATUS_QUERY, [id])
        .resolves({ rows: [{ status: "stopped" }] })
        .withArgs(POWERPLANT_UPDATE_QUERY, ["starting", id])
        .resolves();

      expect(await startRequestPowerPlant(id)).to.equal("starting");
    });
  });
});
