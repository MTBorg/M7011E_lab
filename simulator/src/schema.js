const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLFloat,
  GraphQLList,
  GraphQLInt
} = require("graphql");
const joinMonster = require("join-monster");
const { getHouseholdConsumption } = require("./consumption");
const { dbClient } = require("./db_client");

// Database client
const client = dbClient();
client.connect(error => {
  if (error) console.error("Database connection error : ", error);
});

function getProsumers(resolveInfo) {
  return joinMonster.default(resolveInfo, {}, sql => {
    return client.query(sql);
  });
}

const prosumerType = new GraphQLObjectType({
  name: "prosumer",
  fields: () => ({
    id: {
      type: GraphQLInt
    },
    meanDayWindSpeed: {
      type: GraphQLFloat,
      sqlColumn: "mean_day_wind_speed"
    },
    currentWindSpeed: {
      type: GraphQLFloat,
      sqlColumn: "current_wind_speed"
    },
    currentConsumption: {
      type: GraphQLFloat,
      sqlColumn: "current_consumption",
      resolve() {
        return getHouseholdConsumption();
      }
    }
  })
});

prosumerType._typeConfig = {
  sqlTable: "prosumers",
  uniqueKey: "id"
};

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
      resolve(_parent, _args, _context, resolveInfo) {
        return getProsumers(resolveInfo);
      }
    }
  }
});

const schema = new GraphQLSchema({ query: queryType });

module.exports = schema;
