const proxyquire = require("proxyquire");
const { expect } = require("chai");

const gaussian = require("gaussian");

describe("currWindSpeed", async () => {
  it("should not be able to return negative values", async () => {
    const mockModule = proxyquire("../src/windspeed", {
      gaussian: () => {
        return {
          ppf: () => -100
        };
      }
    });

    expect(mockModule.currWindSpeed(0)).to.be.at.least(0);
  });

  it("should not be able to return above the max speed limit", async () => {
    const mockModule = proxyquire("../src/windspeed", {
      gaussian: () => {
        return {
          ppf: () => 100
        };
      }
    });

    expect(mockModule.currWindSpeed(0)).to.be.at.most(40);
  });
});

describe("meanWindSpeed", async () => {
  it("should return a positive number", async () => {
    const mockModule = proxyquire("../src/windspeed", {
      gaussian: () => {
        return {
          ppf: () => 5.26
        };
      }
    });

    expect(mockModule.meanWindSpeed(0)).to.equal(5.26);
  });
});
