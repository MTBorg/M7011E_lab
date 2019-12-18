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
const { registerProsumer, registerManager } = require("./registration.js");
const { getHouseholdConsumption } = require("./consumption");
const { currWindSpeed } = require("./windspeed");
const { pool } = require("./db.js");
const { getPricing } = require("./pricing.js");
const {
  startRequestPowerPlant,
  stopPowerPlant,
  getCurrentProduction
} = require("./powerplant");
const { setDeficitRatio, setExcessRatio } = require("./ratio");
const {
  authenticateLoggedIn,
  logInUser,
  authenticateIsMe,
  authenticateIsManager
} = require("./auth.js");

function joinMonsterQuery(resolveInfo) {
  return joinMonster.default(resolveInfo, {}, async sql => {
    return pool.query(sql);
  });
}

const accountType = new GraphQLObjectType({
  name: "account",
  fields: () => ({
    id: {
      type: GraphQLInt,
      sqlColumn: "id"
    },
    email: {
      type: GraphQLString,
      sqlColumn: "email"
    }
  })
});
accountType._typeConfig = {
  sqlTable: "accounts",
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
    },
    ratioExcessMarket: {
      type: GraphQLFloat,
      sqlColumn: "ratio_excess_market"
    },
    ratioDeficitMarket: {
      type: GraphQLFloat,
      sqlColumn: "ratio_deficit_market"
    },
    battery: {
      type: batteryType,
      sqlColumn: "battery_id",
      sqlJoin: (prosumerTable, batteriesTable, _args) =>
        `${prosumerTable}.battery_id = ${batteriesTable}.id`
    },
    account: {
      type: accountType,
      sqlColumn: "account_id",
      sqlJoin: (prosumerTable, accountTable) =>
        `${prosumerTable}.account_id = ${accountTable}.id`
    }
  })
});

prosumerType._typeConfig = {
  sqlTable: "prosumers",
  uniqueKey: "id"
};

const powerPlantType = new GraphQLObjectType({
  name: "powerPlant",
  fields: () => ({
    id: {
      type: GraphQLInt,
      sqlColumn: "id"
    },
    status: {
      type: GraphQLString,
      sqlColumn: "status"
    },
    battery: {
      type: batteryType,
      sqlColumn: "battery_id",
      sqlJoin: (powerPlantsTable, batteriesTable, _args) =>
        `${powerPlantsTable}.battery_id = ${batteriesTable}.id`
    },
    currentProduction: {
      type: GraphQLFloat,
      resolve(powerplant) {
        return getCurrentProduction(powerplant.id);
      }
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
    pricing: {
      type: GraphQLFloat,
      resolve: authenticateLoggedIn(() => getPricing())
    },
    prosumer: {
      type: prosumerType,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) }
      },
      where: (prosumerTable, args, _context) => {
        return `${prosumerTable}.id = ${args.id}`;
      },
      resolve(_parent, _args, _context, resolveInfo) {
        return joinMonsterQuery(resolveInfo);
      }
    },
    prosumers: {
      type: GraphQLList(prosumerType),
      resolve: authenticateLoggedIn(
        authenticateIsManager((parent, args, context, resolveInfo) =>
          joinMonsterQuery(resolveInfo)
        )
      )
    },
    powerplants: {
      type: powerPlantType,
      resolve: authenticateLoggedIn((_parent, _args, _context, resolveInfo) =>
        joinMonsterQuery(resolveInfo)
      )
    },
    me: {
      type: prosumerType,
      where: (prosumers, _args, context) => {
        if (context.user.id) return `${prosumers}.id = ${context.user.id}`;
      },
      resolve: authenticateLoggedIn((_parent, _args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, context, async sql =>
          pool.query(sql)
        );
      })
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
      resolve: authenticateLoggedIn((_obj, args) =>
        startRequestPowerPlant(args.id)
      )
    },
    stopPowerPlant: {
      type: GraphQLString,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: authenticateLoggedIn((_obj, args) => stopPowerPlant(args.id))
    },
    setRatioDeficitMarket: {
      type: GraphQLFloat,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
        ratio: { type: GraphQLFloat }
      },
      resolve: authenticateLoggedIn(
        authenticateIsMe((_obj, args) => setDeficitRatio(args.id, args.ratio))
      )
    },
    setRatioExcessMarket: {
      type: GraphQLFloat,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
        ratio: { type: GraphQLFloat }
      },
      resolve: authenticateLoggedIn(
        authenticateIsMe((_obj, args) => setExcessRatio(args.id, args.ratio))
      )
    },
    login: {
      type: GraphQLString,
      args: {
        email: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve(_obj, args) {
        return logInUser(args.email, args.password);
      }
    },
    registerProsumer: {
      type: GraphQLString,
      args: {
        email: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve(_obj, args) {
        return registerProsumer(args.email, args.password);
      }
    },
    registerManager: {
      type: GraphQLString,
      args: {
        email: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) },
        managerPassword: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve(_obj, args) {
        return registerManager(args.email, args.password, args.managerPassword);
      }
    }
  }
});

const schema = new GraphQLSchema({ query: queryType, mutation: mutationType });

module.exports = schema;
