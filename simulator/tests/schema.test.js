const EasyGraphQLTester = require("easygraphql-tester");
const { expect } = require("chai");

const schema = require("../src/schema.js");

const tester = new EasyGraphQLTester(schema);

describe("GraphQl schema", async () => {
  describe("Active query", async () => {
    it("Should return true", async () => {
      const query = `
			{
				active
			}
			`;
      const res = tester.mock({
        query,
        fixture: {
          data: {
            active: true
          }
        }
      });
      expect(res.data.active).to.equal("true");
    });
  });

  describe("Prosumer", async () => {
    it("Should have an id", async () => {
      // TODO: This should use a more direct query and not prosumers
      const query = `
			{
				prosumers{
					id
				}
			}
			`;
      const res = tester.mock({
        query,
        fixture: {
          data: {
            prosumers: [{ id: 4 }]
          }
        }
      });
      expect(res.data.prosumers[0]).to.have.property("id");
    });

    it("Should be able to query current consumption", async () => {
      // TODO: This should use a more direct query and not prosumers
      const query = `
			{
				prosumers{
					currentConsumption
				}
			}
			`;
      const res = tester.mock({
        query,
        fixture: {
          data: {
            prosumers: [{ id: 1, currentConsumption: 5.0 }]
          }
        }
      });
      expect(res.data.prosumers[0]).to.have.property("currentConsumption");
      expect(res.data.prosumers[0].currentConsumption).to.be.a("number");
    });

    it("Should be able to query the mean wind speed of the day", async () => {
      const query = `
			{
				prosumers{
					meanDayWindSpeed
				}
			}
			`;
      const res = tester.mock({
        query,
        fixture: {
          data: {
            prosumers: [{ id: 1, meanDayWindSpeed: 5.237 }]
          }
        }
      });
      expect(res.data.prosumers[0]).to.have.property("meanDayWindSpeed");
      expect(res.data.prosumers[0].meanDayWindSpeed).to.be.a("number");
    });
  });

  describe("Prosumers query", async () => {
    it("Should return a list of prosumers", async () => {
      const query = `
			{
				prosumers{
					id
				}
			}
			`;
      const res = tester.mock({
        query,
        fixture: {
          data: {
            prosumers: [{ id: 1 }, { id: 7 }, { id: 3 }]
          }
        }
      });
      expect(res.data.prosumers).to.be.an("array");
      expect(res.data.prosumers).to.have.length(3);
      expect(res.data.prosumers[0].id).to.equal(1);
      expect(res.data.prosumers[1].id).to.equal(7);
      expect(res.data.prosumers[2].id).to.equal(3);
    });
  });
});
