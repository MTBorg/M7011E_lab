const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLFloat,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLUnionType,
  GraphQLBoolean
} = require("graphql");
const { GraphQLDateTime } = require("graphql-iso-date");
const joinMonster = require("join-monster");
const { registerProsumer, registerManager } = require("./registration.js");
const { pool } = require("../db.js");
const {
  getSimPricing,
  getPricing,
  setPricing
} = require("../models/manager/pricing.js");
const {
  startRequestPowerPlant,
  stopPowerPlant,
  getCurrentProduction
} = require("../models/manager/powerplant.js");
const {
  setDeficitRatio,
  setExcessRatio,
  setPowerPlantProdRatio
} = require("../models/ratio");
const {
  authenticateLoggedIn,
  logInUser,
  authenticateIsMe,
  authenticateIsManager
} = require("./auth.js");
const {
  updateEmail,
  updatePassword,
  deleteAccount,
  deleteProsumerAccount
} = require("./credentials.js");
const { timestampUser, setUserOffline } = require("./userActivity.js");
const { blockProsumer } = require("../models/manager/manager.js");
const { updateBatteryMaxCapacity } = require("../models/battery.js");
const { calculateMarketDemand } = require("../models/market.js");

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
    },
    lastActivity: {
      type: GraphQLDateTime,
      sqlColumn: "last_activity"
    },
    online: {
      type: GraphQLBoolean,
      sqlExpr: () =>
        `(SELECT id FROM accounts WHERE id=account_id AND online=true AND age(CURRENT_TIMESTAMP, last_activity) < time '00:15:00')`
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
    blocked: {
      type: GraphQLBoolean,
      sqlColumn: "blocked"
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
    },
    blackout: {
      type: GraphQLBoolean,
      sqlColumn: "blackout"
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
      resolve(_obj, _args, context) {
        return getCurrentProduction(context.user.accountId);
      }
    },
    ratioProductionMarket: {
      type: GraphQLFloat,
      sqlColumn: "ratio_production_market"
    }
  })
});

powerPlantType._typeConfig = {
  sqlTable: "power_plants",
  uniqueKey: "id"
};

const managerType = new GraphQLObjectType({
  name: "manager",
  fields: {
    id: {
      type: GraphQLInt,
      sqlColumn: "id"
    },
    account: {
      type: accountType,
      sqlColumn: "account_id",
      sqlJoin: (managerTable, accountTable) =>
        `${managerTable}.account_id = ${accountTable}.id`
    },
    powerplant: {
      type: powerPlantType,
      sqlColumn: "power_plant_id",
      sqlJoin: (managerTable, powerPlantsTable) =>
        `${managerTable}.power_plant_id = ${powerPlantsTable}.id`
    }
  }
});
managerType._typeConfig = {
  sqlTable: "managers",
  uniqueKey: "id"
};

const userUnionType = new GraphQLUnionType({
  name: "user",
  types: [prosumerType, managerType],
  resolveType: obj => obj.$type
});
userUnionType._typeConfig = {
  alwaysFetch: "$type",
  sqlTable: `
	(
		SELECT 
			id, 
			account_id,
			mean_day_wind_speed,
			current_wind_speed,
			current_consumption,
			current_production,
			ratio_excess_market,
			ratio_deficit_market,
			blocked,
			battery_id,
			blackout,
			NULL as power_plant_id,
			'prosumer' as "$type"
		FROM prosumers
		UNION
		SELECT 
			id, 
			account_id,
			NULL as mean_day_wind_speed,
			NULL as current_wind_speed,
			NULL as current_consumption,
			NULL as current_production,
			NULL as ratio_excess_market,
			NULL as ratio_deficit_market,
			NULL as blocked,
			NULL as battery_id,
			NULL as blackout,
			power_plant_id,
			'manager' as "$type"
		FROM managers)`,
  uniqueKey: "account_id"
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
    simPricing: {
      type: GraphQLFloat,
      resolve: authenticateIsManager(() => getSimPricing())
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
      where: (prosumerTable, args) => {
        return `${prosumerTable}.id = ${args.id}`;
      },
      resolve: authenticateLoggedIn(
        authenticateIsManager((_parent, _args, _context, resolveInfo) =>
          joinMonsterQuery(resolveInfo)
        )
      )
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
      type: userUnionType,
      where: (users, _args, context) =>
        context.user.accountId
          ? `${users}.account_id = ${context.user.accountId}`
          : null,
      resolve: authenticateLoggedIn((_parent, _args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, context, async sql =>
          pool.query(sql)
        );
      })
    },
    marketDemand: {
      type: GraphQLFloat,
      resolve: authenticateLoggedIn(
        authenticateIsManager((_parent, _args, _context, resolveInfo) =>
          calculateMarketDemand()
        )
      )
    }
  }
});

const mutationType = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    timestamp: {
      type: GraphQLDateTime,
      resolve: authenticateLoggedIn((_parent, _args, context) =>
        timestampUser(context.user.accountId)
      )
    },
    logout: {
      type: GraphQLString,
      resolve: authenticateLoggedIn((_parent, _arg, context) =>
        setUserOffline(context.user.accountId)
      )
    },
    startPowerPlant: {
      type: GraphQLString,
      resolve: authenticateIsManager((_obj, _args, context) =>
        startRequestPowerPlant(context.user.accountId)
      )
    },
    stopPowerPlant: {
      type: GraphQLString,
      resolve: authenticateIsManager((_obj, _args, context) =>
        stopPowerPlant(context.user.accountId)
      )
    },
    setRatioProdMarket: {
      type: GraphQLFloat,
      args: {
        ratio: { type: GraphQLFloat }
      },
      resolve: authenticateIsManager((_obj, args) =>
        setPowerPlantProdRatio(args.ratio)
      )
    },
    setRatioDeficitMarket: {
      type: GraphQLFloat,
      args: {
        ratio: { type: GraphQLFloat }
      },
      resolve: authenticateLoggedIn((_obj, args, context) =>
        setDeficitRatio(context.user.accountId, args.ratio)
      )
    },
    setRatioExcessMarket: {
      type: GraphQLFloat,
      args: {
        ratio: { type: GraphQLFloat }
      },
      resolve: authenticateLoggedIn((_obj, args, context) =>
        setExcessRatio(context.user.accountId, args.ratio)
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
    },
    updateEmail: {
      type: GraphQLString,
      args: {
        email: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: authenticateLoggedIn((_obj, args, context) =>
        updateEmail(context.user.accountId, args.email)
      )
    },
    updatePassword: {
      type: GraphQLString,
      args: {
        password: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: authenticateLoggedIn((_obj, args, context) =>
        updatePassword(context.user.accountId, args.password)
      )
    },
    deleteAccount: {
      type: GraphQLBoolean,
      resolve: authenticateLoggedIn((_obj, args, context) =>
        deleteAccount(context.user.accountId)
      )
    },
    deleteProsumerAccount: {
      type: GraphQLBoolean,
      args: {
        prosumerId: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: authenticateLoggedIn(
        authenticateIsManager((_obj, args, context) =>
          deleteProsumerAccount(args.prosumerId)
        )
      )
    },
    blockProsumer: {
      type: GraphQLBoolean,
      args: {
        prosumerId: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: authenticateLoggedIn(
        authenticateIsManager((_obj, args, context) =>
          blockProsumer(args.prosumerId)
        )
      )
    },
    updateBatteryMaxCapacity: {
      type: GraphQLFloat,
      args: {
        maxCapacity: { type: GraphQLNonNull(GraphQLFloat) }
      },
      resolve: authenticateLoggedIn((_obj, args, context) =>
        updateBatteryMaxCapacity(context.user.accountId, args.maxCapacity)
      )
    },
    setPricing: {
      type: GraphQLFloat,
      args: {
        price: { type: GraphQLNonNull(GraphQLFloat) }
      },
      resolve: authenticateLoggedIn(
        authenticateIsManager((_obj, args) => setPricing(args.price))
      )
    }
  }
});

const schema = new GraphQLSchema({ query: queryType, mutation: mutationType });

module.exports = schema;
