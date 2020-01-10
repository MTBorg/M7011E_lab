/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
const chai = require("chai");
const rewire = require("rewire");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const jwt = require("jsonwebtoken");
const {
  registerProsumer,
  registerManager,
  prosumerRegistrationAccountsQuery,
  prosumerRegistrationBatteryQuery,
  managerRegistrationAccountsQuery
} = require("../src/api/registration.js");
const { pool } = require("../src/db");

const { expect } = chai;
chai.use(sinonChai);

describe("registration", () => {
  describe("manager", () => {
    describe("unsuccessful", () => {
      afterEach(() => {
        sinon.restore();
      });

      it("should return null if email password is passed as null", async () => {
        expect(await registerManager(null, "password")).to.be.equal(null);
      });

      it("should return null if no password is passed", async () => {
        expect(await registerManager("email")).to.be.equal(null);
      });

      it("should return null if no manager password is passed", async () => {
        expect(
          await registerManager("email", "password", "managerPassword")
        ).to.be.equal(null);
      });

      it("should return null if an error is raised", async () => {
        const mockClient = {
          query(queryString) {
            // Don't throw in catch clause
            if (queryString !== "ROLLBACK") {
              throw new Error("test");
            }
          }
        };

        sinon.stub(pool, "connect").resolves(mockClient);
        expect(await registerManager()).to.be.equal(null);
      });
    });

    describe("successful", () => {
      afterEach(() => {
        sinon.restore();
      });

      it("should return a token containing an account id and manager flag set to true when succesful", async () => {
        const mockModule = rewire("../src/api/registration.js");
        mockModule.__set__({
          bcrypt: {
            genSaltSync: () => "salt",
            hashSync: () => "testHash"
          },
          // Make sure the private key and manager password is not
          // set via environment
          process: { env: {} }
        });

        const mockClient = {
          async query(queryString) {
            if (queryString === managerRegistrationAccountsQuery) {
              return { rows: [{ id: 7 }] };
            }
            return null;
          },
          release() {}
        };

        sinon.stub(pool, "connect").resolves(mockClient);

        const token = await mockModule.registerManager(
          "email",
          "password",
          "manager"
        );
        const user = jwt.verify(token, "secret");
        expect(user.accountId).to.be.equal(7);
        expect(user.manager).to.be.true;
      });
    });
  });

  describe("prosumer", () => {
    describe("unsuccessful", () => {
      afterEach(() => {
        sinon.restore();
      });

      it("should return null if email password is passed as null", async () => {
        expect(await registerProsumer(null, "password")).to.be.equal(null);
      });

      it("should return null if no password is passed", async () => {
        expect(await registerProsumer("email")).to.be.equal(null);
      });

      it("should return null if an error is raised", async () => {
        const mockClient = {
          query(queryString) {
            // Don't throw in catch clause
            if (queryString !== "ROLLBACK") {
              throw new Error("test");
            }
          }
        };

        sinon.stub(pool, "connect").resolves(mockClient);
        expect(await registerProsumer()).to.be.equal(null);
      });
    });

    describe("successful", () => {
      afterEach(() => {
        sinon.restore();
      });

      it("should return a token containing an account id and manager flag set to false when succesful", async () => {
        const mockModule = rewire("../src/api/registration.js");
        mockModule.__set__({
          bcrypt: {
            genSaltSync: () => "salt",
            hashSync: () => "testHash"
          },
          process: { env: {} } // Make sure the private key is not set via environment
        });

        const mockClient = {
          async query(queryString) {
            if (queryString === prosumerRegistrationAccountsQuery) {
              return { rows: [{ id: 7 }] };
            }
            if (queryString === prosumerRegistrationBatteryQuery) {
              return { rows: [{ id: 4 }] };
            }
            return null;
          },
          release() {}
        };

        sinon.stub(pool, "connect").resolves(mockClient);

        const token = await mockModule.registerProsumer("email", "password");
        const user = jwt.verify(token, "secret");
        expect(user.accountId).to.be.equal(7);
        expect(user.manager).to.be.false;
      });
    });
  });
});
