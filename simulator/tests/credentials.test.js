/* eslint-disable no-underscore-dangle */
const rewire = require("rewire");
const sinon = require("sinon");
const chai = require("chai");

const { expect } = chai;

const { pool } = require("../src/db.js");

const {
  updateEmail,
  UPDATE_EMAIL_QUERY,
  UPDATE_PASSWORD_QUERY
} = require("../src/credentials");

describe("credentials", () => {
  describe("updating email", () => {
    afterEach(() => {
      sinon.restore();
    });

    it("should return the new email when successfull", async () => {
      const accountId = 5;
      const email = "test@email.com";
      sinon
        .stub(pool, "query")
        .withArgs(UPDATE_EMAIL_QUERY, [email, accountId])
        .resolves({ rows: [{ email }] });

      const newEmail = await updateEmail(accountId, email);
      expect(newEmail).to.equal(email);
    });

    it("should return an error when unsuccessful", async () => {
      const accountId = 5;
      const email = "test@email.com";
      sinon
        .stub(pool, "query")
        .withArgs(UPDATE_EMAIL_QUERY, [email, accountId])
        .resolves({ rows: [] });

      const newEmail = await updateEmail(accountId, email);
      expect(newEmail).to.be.an("error");
    });
  });

  describe("updating password", async () => {
    afterEach(() => {
      sinon.restore();
    });

    it("should return the new password_hash when successfull", async () => {
      const accountId = 5;
      const hash = "hash";
      const mockModule = rewire("../src/credentials");
      mockModule.__set__({
        bcrypt: {
          genSaltSync: () => {},
          hashSync: () => hash
        }
      });
      sinon
        .stub(pool, "query")
        .withArgs(UPDATE_PASSWORD_QUERY, [hash, accountId])
        .resolves({ rows: [{ password_hash: hash }] });

      const passwordHash = await mockModule.updatePassword(
        accountId,
        "myNewPassword"
      );
      expect(passwordHash).to.be.equal(hash);
    });

    it("should return an error when unsuccessfull", async () => {
      const accountId = 5;
      const hash = "hash";
      const mockModule = rewire("../src/credentials");
      mockModule.__set__({
        bcrypt: {
          genSaltSync: () => {},
          hashSync: () => hash
        }
      });
      sinon
        .stub(pool, "query")
        .withArgs(UPDATE_PASSWORD_QUERY, [hash, accountId])
        .resolves({ rows: [] });

      const passwordHash = await mockModule.updatePassword(
        accountId,
        "myNewPassword"
      );
      expect(passwordHash).to.be.an("error");
    });
  });
});
