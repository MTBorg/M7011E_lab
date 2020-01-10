const { expect } = require("chai");
const {
  turbineOutput,
  ratedOutputPower,
  cutInSpeed,
  cutOutSpeed
} = require("../src/models/prosumer/windturbine.js");

describe("turbineOutput", () => {
  it("Should not output power when the wind speed is less than the cut in speed", () => {
    expect(turbineOutput(cutInSpeed * 0.9)).to.equal(0);
  });

  it("Should not output power when the wind speed is greater than the cut out speed", () => {
    expect(turbineOutput(cutOutSpeed * 1.1)).to.equal(0);
  });

  it("Should not output power greater than the rated output power", () => {
    expect(turbineOutput(cutOutSpeed * 0.9)).to.equal(ratedOutputPower);
  });

  it("Should output power when the wind speed is inbetween the cut in and cut out wind speed", () => {
    expect(turbineOutput(cutOutSpeed - cutInSpeed)).to.not.equal(0);
  });
});
