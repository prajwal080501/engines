import { ZodSchema } from "zod";

export interface DBEngineConfig {
    connectionString: string;
    databaseName: string;
    options?: Object,
}


export interface BaseSchema {
    _id?: string;         // MongoDB automatically assigns `_id`
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  
  /**
   * Type for schema registration, supporting timestamps
   */
  export interface ModelRegisterSchema<T> {
    collection: string;
    schema: ZodSchema<T>;
    timestamps?: boolean;
  }

/**
   * Type for ExecuteConfig, supporting dynamic parameters and commands
   */

  export interface ExecuteConfig {
    collection: string,
    command:string,
    parameters: any
    schema?: ModelRegisteSchema<any>
}