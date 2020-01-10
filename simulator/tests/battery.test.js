const sinon = require("sinon");
const { expect } = require("chai");
const { pool } = require("../src/db");
const {
  useBatteryPower,
  useBatteryPowerQuery
} = require("../src/models/battery");

describe("useBatteryPower", async () => {
  let poolStub;

  afterEach(() => {
    sinon.restore();
  });

  it("should only return used amount when request exceeds availabe power", async () => {
    poolStub = sinon
      .stub(pool, "query")
      .withArgs(useBatteryPowerQuery, [1, 8])
      .resolves({ rows: [{ used_power: 5 }] });

    const usedBatteryPower = useBatteryPower(1, 8);
    expect(await usedBatteryPower).to.equal(5);
  });

  it("should return requested amount when request subceeds availabe power", async () => {
    poolStub = sinon
      .stub(pool, "query")
      .withArgs(useBatteryPowerQuery, [1, 8])
      .resolves({ rows: [{ used_power: 8 }] });

    const usedBatteryPower = useBatteryPower(1, 8);
    expect(await usedBatteryPower).to.equal(8);
  });
});
