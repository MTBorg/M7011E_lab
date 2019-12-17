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
  prosumerRegistrationAccountQuery,
  managerRegistrationAccountsQuery,
  logInUser,
  authenticateLoggedIn,
  authenticateIsMe,
  authenticateIsManager
} = require("../src/auth");
const { pool } = require("../src/db");

const { expect } = chai;
chai.use(sinonChai);

describe("auth", () => {
  describe("authenticate logged in", () => {
    describe("context has a user", () => {
      afterEach(() => {
        sinon.restore();
      });

      it("should call the next function with correct arguments", () => {
        const spy = sinon.spy();
        authenticateLoggedIn(spy)(null, null, { user: { id: 2 } }, null);
        expect(spy).to.have.been.calledWith(
          null,
          null,
          { user: { id: 2 } },
          null
        );
      });
    });

    describe("context does not have a user", () => {
      afterEach(() => {
        sinon.restore();
      });

      it("should return an error", () => {
        const res = authenticateLoggedIn(() => {});
        expect(res(null, null, {})).to.be.an("error");
      });

      it("should not call the next function", () => {
        const spy = sinon.spy();
        authenticateLoggedIn(spy)(null, null, {}, null);
        expect(spy).to.not.have.been.called;
      });
    });
  });

  describe("authenticate is me", () => {
    describe("context has a user with a matching id", () => {
      afterEach(() => {
        sinon.restore();
      });

      it("should call the next function with correct arguments", () => {
        const spy = sinon.spy();
        authenticateIsMe(spy)(null, { id: 2 }, { user: { id: 2 } }, null);
        expect(spy).to.have.been.calledWith(
          null,
          { id: 2 },
          { user: { id: 2 } },
          null
        );
      });
    });

    describe("context does not have a user with a matching id", () => {
      afterEach(() => {
        sinon.restore();
      });

      it("should return an error", () => {
        const res = authenticateIsMe(() => {});
        const args = { id: 2 };
        const context = {
          user: { id: 3 }
        };
        expect(res(null, args, context)).to.be.an("error");
      });

      it("should not call the next function", () => {
        const spy = sinon.spy();
        const args = { id: 2 };
        const context = {
          user: { id: 3 }
        };
        authenticateIsMe(spy)(null, args, context, null);
        expect(spy).to.not.have.been.called;
      });
    });
  });

  describe("authenticate is manager", () => {
    describe("context has a user with the manager flag set to true", () => {
      afterEach(() => {
        sinon.restore();
      });

      it("should call the next function with correct arguments", () => {
        const spy = sinon.spy();
        authenticateIsManager(spy)(
          null,
          null,
          { user: { manager: true } },
          null
        );
        expect(spy).to.have.been.calledWith(
          null,
          null,
          { user: { manager: true } },
          null
        );
      });
    });

    describe("context does not have a user with the manager flag set to true", () => {
      afterEach(() => {
        sinon.restore();
      });

      it("should return an error", () => {
        const res = authenticateIsManager(() => {});
        const context = {
          user: { manager: false }
        };
        expect(res(null, null, context)).to.be.an("error");
      });

      it("should not call the next function", () => {
        const spy = sinon.spy();
        const context = {
          user: { manager: false }
        };
        authenticateIsManager(spy)(null, null, context, null);
        expect(spy).to.not.have.been.called;
      });
    });
  });

  describe("Logging in", () => {
    describe("Unsuccessful", () => {
      afterEach(() => {
        sinon.restore();
      });

      it("Should return null when no email is passed", async () => {
        expect(await logInUser(null, "password")).to.be.equal(null);
      });

      it("Should return null when no password is passed", async () => {
        expect(await logInUser("email")).to.be.equal(null);
      });

      it("Should return null when user credentials are invalid", async () => {
        const mockModule = rewire("../src/auth");
        mockModule.__set__({
          checkAccountCredentials: () => false
        });

        sinon.stub(pool, "query").resolves({ rows: [8] });

        expect(await mockModule.logInUser("email", "password")).to.be.equal(
          null
        );
      });
    });

    describe("Successful", () => {
      describe("User is a manager", () => {
        afterEach(() => {
          sinon.restore();
        });

        it("should return a token with the account id and manager flag set to true", async () => {
          const mockModule = rewire("../src/auth");
          mockModule.__set__({
            checkAccountCredentials: () => true,
            userIsManager: () => true,
            process: { env: {} } // Make sure the private key is not set via environment
          });

          sinon.stub(pool, "query").resolves({ rows: [{ id: 8 }] });

          const token = await mockModule.logInUser("email", "password");
          const user = jwt.verify(token, "secret");
          expect(user.accountId).to.be.equal(8);
          expect(user.manager).to.be.true;
        });
      });

      describe("User is a prosumer", () => {
        afterEach(() => {
          sinon.restore();
        });

        it("should return a token with the account id and manager flag set to false", async () => {
          const mockModule = rewire("../src/auth");
          mockModule.__set__({
            checkAccountCredentials: () => true,
            userIsManager: () => false,
            process: { env: {} } // Make sure the private key is not set via environment
          });

          sinon.stub(pool, "query").resolves({ rows: [{ id: 8 }] });

          const token = await mockModule.logInUser("email", "password");
          const user = jwt.verify(token, "secret");
          expect(user.accountId).to.be.equal(8);
          expect(user.manager).to.be.false;
        });
      });
    });
  });

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
          const authModule = rewire("../src/auth");
          authModule.__set__({
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

          const token = await authModule.registerManager(
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
          const authModule = rewire("../src/auth");
          authModule.__set__({
            bcrypt: {
              genSaltSync: () => "salt",
              hashSync: () => "testHash"
            },
            process: { env: {} } // Make sure the private key is not set via environment
          });

          const mockClient = {
            async query(queryString) {
              if (queryString === prosumerRegistrationAccountQuery) {
                return { rows: [{ id: 7 }] };
              }
              return null;
            },
            release() {}
          };

          sinon.stub(pool, "connect").resolves(mockClient);

          const token = await authModule.registerProsumer("email", "password");
          const user = jwt.verify(token, "secret");
          expect(user.accountId).to.be.equal(7);
          expect(user.manager).to.be.false;
        });
      });
    });
  });
});
