import { ZodSchema } from "zod";

export interface DBEngineConfig {
    connectionString: string;
    databaseName: string;
}



export interface BaseSchema {
    _id?: string;         // MongoDB automatically assigns `_id`
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  /**
   * Type for ExecuteConfig, supporting dynamic parameters and commands
   */
  
  /**
   * Type for schema registration, supporting timestamps
   */
  export interface ModelRegisterSchema<T> {
    collection: string;
    schema: ZodSchema<T>;
    timestamps?: boolean;
  }


  export interface ExecuteConfig {
    collection: string,
    command:string,
    parameters: any
    schema?: ModelRegisteSchema<any>
}