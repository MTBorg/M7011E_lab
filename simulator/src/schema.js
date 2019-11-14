const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLFloat,
  GraphQLList,
  GraphQLInt
} = require("graphql");
const { getHouseholdConsumption } = require("./consumption");

// Dummy function
function getProsumers() {
  return [{ id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
}

const prosumerType = new GraphQLObjectType({
  name: "prosumer",
  fields: () => ({
    id: {
      type: GraphQLInt
    },
    currentConsumption: {
      type: GraphQLFloat,
      resolve() {
        return getHouseholdConsumption();
      }
    }
  })
});

const queryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    active: {
      type: GraphQLString,
      name: "active",
      resolve() {
        return true;
      }
    },
    prosumers: {
      type: GraphQLList(prosumerType),
      resolve() {
        return getProsumers();
      }
    }
  }
});

const schema = new GraphQLSchema({ query: queryType });

module.exports = schema;
