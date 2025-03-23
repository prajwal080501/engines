import type { BaseSchema, DBEngineConfig, ExecuteConfig } from "../../types";
import { MongoClient, Collection } from "mongodb";
import { ModelEngine } from "./ModelEngine";
import { LoggerManager } from "../helpers/Logger";
import { createClient } from 'redis';
import {redisConfig} from "../../configs";


const cache = createClient(redisConfig);
const logger = new LoggerManager();

export class DBEngine extends ModelEngine {
  config: DBEngineConfig;
  client: MongoClient;
  private _isConnected: boolean = false; // Tracks if DB & cache are connected

  constructor() {
    super();
    this.config = {
      connectionString: "",
      databaseName: "",
    };
    this.client = new MongoClient(
      this.config.connectionString || "mongodb://localhost:27017"
    );
  }

  async setConfig(input: DBEngineConfig) {
    console.log(input);
    this.config = input;
    this.client = new MongoClient(this.config.connectionString);
    
    if (!this._isConnected) {
      await this.client.connect();
      await cache.connect();
      this._isConnected = true;
      console.log("Database and cache initialized");
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

  async execute<T extends BaseSchema>(input: ExecuteConfig) {
    try {
      logger.log("info", "Executing command", input);
      
      if (!this._isConnected) {
        throw new Error("Database and cache are not initialized. Call setConfig first.");
      }

      let cacheKey = input.collection;
      const cachedResult = await cache.get(cacheKey);
      console.log(cachedResult, 'cachedResult');

      if (cachedResult) {
        logger.log("info", "Cache hit", cachedResult);
        return cachedResult;
      }

      console.log(input, 'ip');
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
          result = await collection.insertOne(input.parameters);
          break;
        case "insertMany":
          result = await collection.insertMany(input.parameters);
          break;
        case "find":
          result = await collection.find(input.parameters).toArray();
          break;
        case "findOne":
          result = await collection.findOne(input.parameters);
          break;
        case "updateOne":
          result = await collection.updateOne(
            input.parameters.filter,
            { $set: input.parameters.update }
          );
          break;
        case "updateMany":
          result = await collection.updateMany(
            input.parameters.filter,
            { $set: input.parameters.update }
          );
          break;
        case "deleteOne":
          result = await collection.deleteOne(input.parameters);
          break;
        case "deleteMany":
          result = await collection.deleteMany(input.parameters);
          break;
        case "aggregate":
          result = await collection.aggregate(input.parameters).toArray();
          break;
        default:
          throw new Error(`Unknown command: ${input.command}`);
      }

      if (result !== undefined) {
        await cache.set(cacheKey, JSON.stringify(result));
      }

      console.log(result, 'result');
      return result;
    } catch (error) {
      logger.logError("error", "Error while executing command", error);
      return { error };
    }
  }
}



let engine = new DBEngine();

export default engine;
