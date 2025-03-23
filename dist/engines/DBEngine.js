"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBEngine = void 0;
const mongodb_1 = require("mongodb");
const ModelEngine_1 = require("./ModelEngine");
class DBEngine extends ModelEngine_1.ModelEngine {
    config;
    client;
    databaseInitialized = false;
    constructor() {
        super();
        this.config = {
            connectionString: "",
            databaseName: "",
        };
        this.client = new mongodb_1.MongoClient(this.config.connectionString || "mongodb://localhost:27017");
    }
    async setConfig(input) {
        console.log(input);
        this.config = input;
        this.client = new mongodb_1.MongoClient(this.config.connectionString);
        await this.client.connect();
        this.databaseInitialized = true;
        console.log("Database initialized");
    }
    async execute(input) {
        console.log(input);
        if (input.schema) {
            this.registerModel(input.collection, input.schema.schema, input.schema.timestamps || false);
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
            const validation = this.validate({
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
        }
        else {
            const validation = this.validate({
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
        const collection = db.collection(collectionName);
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
                return await collection.updateMany(parameters.filter, parameters.update);
            case "deleteOne":
                return await collection.deleteOne(parameters);
            case "deleteMany":
                return await collection.deleteMany(parameters);
            case "aggregate":
                return await collection.aggregate(parameters).toArray();
        }
    }
}
exports.DBEngine = DBEngine;
