const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLFloat,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull
} = require("graphql");
const joinMonster = require("join-monster");
const { getHouseholdConsumption } = require("./consumption");
const { currWindSpeed } = require("./windspeed");
const { pool } = require("./db.js");
const { getPricing } = require("./pricing.js");
const { startRequestPowerPlant, stopPowerPlant } = require("./powerplant");

function joinMonsterQuery(resolveInfo) {
  return joinMonster.default(resolveInfo, {}, async sql => {
    return pool.query(sql);
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
    currentProduction: {
      type: GraphQLFloat,
      sqlColumn: "current_production"
    },
    currentConsumption: {
      type: GraphQLFloat,
      sqlColumn: "current_consumption"
    }
  })
});

prosumerType._typeConfig = {
  sqlTable: "prosumers",
  uniqueKey: "id"
};

const batteryType = new GraphQLObjectType({
  name: "battery",
  fields: () => ({
    maxCapacity: {
      type: GraphQLFloat,
      sqlColumn: "max_capacity"
    },
    power: {
      type: GraphQLFloat,
      sqlColumn: "power"
    }
  })
});
batteryType._typeConfig = {
  sqlTable: "batteries",
  uniqueKey: "id"
};

const powerPlantType = new GraphQLObjectType({
  name: "powerPlant",
  fields: () => ({
    id: {
      type: GraphQLInt,
      sqlColumn: "id"
    },
    currentProduction: {
      type: GraphQLFloat,
      sqlColumn: "current_production"
    },
    status: {
      type: GraphQLString,
      sqlColumn: "status"
    },
    battery: {
      type: batteryType,
      sqlColumn: "battery_id",
      sqlJoin: (powerPlantsTable, batteriesTable, _args) =>
        `${powerPlantsTable}.id = ${batteriesTable}.id`
    }
  })
});

powerPlantType._typeConfig = {
  sqlTable: "power_plants",
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
        return joinMonsterQuery(resolveInfo);
      }
    },
    powerplants: {
      type: powerPlantType,
      resolve(_parent, _args, _context, resolveInfo) {
        return joinMonsterQuery(resolveInfo);
      }
    }
  }
});

const mutationType = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    startPowerPlant: {
      type: GraphQLString,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve(_obj, args) {
        return startRequestPowerPlant(args.id);
      }
    },
    stopPowerPlant: {
      type: GraphQLString,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve(_obj, args) {
        return stopPowerPlant(args.id);
      }
    },
    currentPricing: {
      type: GraphQLFloat,
      async resolve() {
        return getPricing();
      }
    }
  }
});

const schema = new GraphQLSchema({ query: queryType, mutation: mutationType });

module.exports = schema;
