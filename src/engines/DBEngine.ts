import type { BaseSchema, DBEngineConfig, ExecuteConfig } from "../../types";
import { MongoClient, Collection } from "mongodb";
import { ModelEngine } from "./ModelEngine";

export class DBEngine extends ModelEngine {
  config: DBEngineConfig;
  client: MongoClient;
  databaseInitialized: boolean = false;

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
    await this.client.connect();
    this.databaseInitialized = true;
    console.log("Database initialized");
  }

  getConnectionInfo(){
    if(this.client){
      let obj = {
        connectionString: this.config.connectionString,
        databaseName: this.config.databaseName
      }
      return obj;

    }
    return null;
  }

  async execute<T extends BaseSchema>(input: ExecuteConfig) {
    console.log(input);
    if (input.schema) {
      this.registerModel(
        input.collection,
        input.schema.schema,
        input.schema.timestamps || false
      );
    }
    const collectionName = input.collection;
    const command = input.command;
    let parameters = input.parameters;

    if (!this.databaseInitialized) {
      await this.client.connect();
      this.databaseInitialized = true;
      console.log("Database initialized");
    }
    const isUpdate = command.startsWith("update");
    if (isUpdate) {
      const validation = this.validate<T>({
        collection: collectionName,
        parameters: parameters.update,
        isUpdate: isUpdate,
      });
      if (!validation.success) {
        return { error: validation.error };
      }

      parameters = {
        filter: parameters.filter,
        update: { $set: parameters.update },
      };
    } else {
      const validation = this.validate<T>({
        collection: collectionName,
        parameters: parameters,
        isUpdate: isUpdate,
      });
      if (!validation.success) {
        return { error: validation.error };
      }

      parameters = validation.data;
    }
    console.log(parameters, "parameters");

    const db = this.client.db(this.config.databaseName);
    const collection: Collection = db.collection(collectionName);

    switch (command) {
      case "insertOne":
        return await collection.insertOne(parameters);
      case "insertMany":
        return await collection.insertMany(parameters);
      case "find":
        return await collection.find(parameters);
      case "findOne":
        return await collection.findOne(parameters);
      case "updateOne":
        return await collection.updateOne(parameters.filter, parameters.update);
      case "updateMany":
        return await collection.updateMany(
          parameters.filter,
          parameters.update
        );
      case "deleteOne":
        return await collection.deleteOne(parameters);
      case "deleteMany":
        return await collection.deleteMany(parameters);
      case "aggregate":
        return await collection.aggregate(parameters).toArray();
    }
  }
}
