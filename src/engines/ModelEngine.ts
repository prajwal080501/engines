import { z, ZodSchema } from "zod";
import type { BaseSchema, ModelRegisterSchema } from "../../types";

export class ModelEngine {
  schemas: Map<
    string,
    {
      schema: ZodSchema<BaseSchema>;
      timestamps: boolean;
    }
  > = new Map();
  constructor() {}

  registerModel<T extends BaseSchema>(
    collection: string,
    schema: ZodSchema<T>,
    timestamps: boolean = false
  ) {
    this.schemas.set(collection, { schema, timestamps });
  }

  validate<T extends BaseSchema>(input: {
    collection: string;
    parameters: any;
    isUpdate?: boolean;
  }) {
    const schema = this.schemas.get(input.collection);
    if (!schema) {
      return {
        success: true,
        data: input.parameters,
      };
    }
    try {
      const validation = schema.schema.safeParse(input.parameters);
      return validation.success
        ? { success: true, data: validation.data }
        : { success: false, error: validation.error.format() };
    } catch (err) {
      console.error(err);
      throw new Error("Validation error");
    }
  }
}
