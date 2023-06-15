import "extensionsjs/lib";
import * as dotenv from "dotenv";
const { NODE_ENV = "bscTestnet" } = process.env;
console.log({ NODE_ENV });
const pathEnv = `./envs/${NODE_ENV}.env`.trim();
dotenv.config({ path: pathEnv });

