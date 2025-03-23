"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelEngine = void 0;
class ModelEngine {
    schemas = new Map();
    constructor() { }
    registerModel(collection, schema, timestamps = false) {
        this.schemas.set(collection, { schema, timestamps });
    }
    validate(input) {
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
        }
        catch (err) {
            console.error(err);
            throw new Error("Validation error");
        }
    }
}
exports.ModelEngine = ModelEngine;
