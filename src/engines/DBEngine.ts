import type { BaseSchema, DBEngineConfig, ExecuteConfig } from "../../types";
import { MongoClient, Collection, UUID } from "mongodb";
import { ModelEngine } from "./ModelEngine";
import { LoggerManager } from "../helpers/Logger";
import { createClient } from "redis";
import { redisConfig } from "../../configs";
import { generateCacheKey } from "../utils/utils";
import { AIManager } from "../managers/AIManager";

let aiManager = new AIManager();
const cache = createClient(redisConfig);
const logger = new LoggerManager();

export class DBEngine extends ModelEngine {
  config: DBEngineConfig;
  client: MongoClient;
  private _isConnected: boolean = false; // Tracks if DB & cache are connected

  constructor(config: DBEngineConfig = {
    connectionString: "mongodb://localhost:27017",
    databaseName: "",
    options: { maxPoolSize: 10 }
  }) {
    super();
    this.config = config;
    this.client = new MongoClient(this.config.connectionString, this.config.options);
  }

  async setConfig(input: DBEngineConfig) {
    this.config = input;
    this.client = new MongoClient(
      this.config.connectionString,
      this.config.options
    );

    await this.ensureConnected();
  }

  private async ensureConnected() {
    if (!this._isConnected) {
      await this.client.connect();
      await cache.connect();
      this._isConnected = true;
      logger.log("info", "Database and cache initialized", this.config);
    }
  }

  getConnectionInfo() {
    logger.log("info", "Getting connection info", this.config);
    if (this.client) {
      return {
        connectionString: this.config.connectionString,
        databaseName: this.config.databaseName,
      };
    }
    return null;
  }

  beforeExecute(input: ExecuteConfig) {
    // function to update the input parameters before executing
    return input;
  }

  async execute<T extends BaseSchema>(input: ExecuteConfig) {
    try {
      logger.log("info", "Executing command", input);
      await this.ensureConnected();
      let params = input.parameters;

      let cacheKey = generateCacheKey({
        collection: input.collection,
        query: params,
        database: this.config.databaseName,
      }); //
      const cachedResult = await cache.get(cacheKey);

      if (cachedResult) {
        logger.log("info", "Cache hit", cachedResult);
        return cachedResult;
      }

      if (input.schema) {
        this.registerModel(
          input.collection,
          input.schema.schema,
          input.schema.timestamps || false
        );
      }

      const db = this.client.db(this.config.databaseName);
      const collection: Collection = db.collection(input.collection);
      let result;

      switch (input.command) {
        case "insertOne":
          result = await collection.insertOne(params);
          break;
        case "insertMany":
          result = await collection.insertMany(params);
          break;
        case "find":
          result = await collection.find(params).toArray();
          break;
        case "findOne":
          result = await collection.findOne(params);
          break;
        case "updateOne":
          result = await collection.updateOne(
            params.filter,
            { $set: params.update },
            params?.options ?? {}
          );
          break;
        case "updateMany":
          result = await collection.updateMany(
            params.filter,
            { $set: params.update },
            params.option
          );
          break;
        case "deleteOne":
          result = await collection.deleteOne(params);
          break;
        case "deleteMany":
          result = await collection.deleteMany(params);
          break;
        case "aggregate":
          result = await collection.aggregate(params).toArray();
          break;
        default:
          throw new Error(`Unknown command: ${input.command}`);
      }

      if (result !== undefined) {
        await cache.set(cacheKey, JSON.stringify(result));
      }

      return result;
    } catch (error) {
      logger.logError("error", "Error while executing command", error);
      return { error };
    }
  }
}

let engine = new DBEngine();

export default engine;
