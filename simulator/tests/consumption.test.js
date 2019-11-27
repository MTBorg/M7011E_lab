const sinon = require("sinon");
const { expect } = require("chai");
const { pool } = require("../src/db");
const { getHouseholdConsumption } = require("../src/consumption");

describe("getHouseholdConsumption", async () => {
  let poolStub; // stub for the database pool

  afterEach(() => {
    sinon.restore();
  });

  it("Should return correct values", async () => {
    poolStub = sinon
      .stub(pool, "query")
      .withArgs("SELECT current_consumption FROM prosumers WHERE id=$1", [4])
      .resolves({ rows: [{ current_consumption: 7 }] });

    expect(await getHouseholdConsumption(4)).to.equal(7);
  });
});
