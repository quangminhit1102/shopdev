const Joi = require("joi");

// Validate environment variables
const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("Development", "Production")
    .default("Development"),
  DEV_APP_PORT: Joi.number().default(3000),
  DEV_DB_HOST: Joi.string().default("localhost"),
  DEV_DB_PORT: Joi.number().default(27017),
  DEV_DB_NAME: Joi.string().default("ShopDev"),
  PRO_APP_PORT: Joi.number().default(3000),
  PRO_DB_HOST: Joi.string().default("localhost"),
  PRO_DB_PORT: Joi.number().default(27017),
  PRO_DB_NAME: Joi.string().default("ShopDev"),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);
if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

const Development = {
  app: {
    port: envVars.DEV_APP_PORT,
  },
  db: {
    host: envVars.DEV_DB_HOST,
    port: envVars.DEV_DB_PORT,
    name: envVars.DEV_DB_NAME,
  },
};

const Production = {
  app: {
    port: envVars.PRO_APP_PORT,
  },
  db: {
    host: envVars.PRO_DB_HOST,
    port: envVars.PRO_DB_PORT,
    name: envVars.PRO_DB_NAME,
  },
};

const config = { Development, Production };
const env = envVars.NODE_ENV;

console.log(config[env]);

module.exports = config[env];
