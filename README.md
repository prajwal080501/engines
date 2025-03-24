# Engines

> A high-performance database abstraction layer with intelligent caching and schema validation

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-in%20development-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue)

## Overview

DataEngine is a sophisticated database abstraction layer designed to simplify database operations while providing advanced features like intelligent caching, schema validation, and automatic logging. Built with TypeScript, it offers a clean API for MongoDB operations with Redis-powered caching.

**⚠️ Note: This project is currently under active development.**

## Features

- **MongoDB Integration**: First-class support for core MongoDB operations
- **Intelligent Caching**: Redis-backed caching system that automatically caches query results
- **Schema Validation**: Zod-powered schema validation to ensure data integrity
- **Comprehensive Logging**: Built-in logging with Winston for debugging and monitoring
- **Type Safety**: Full TypeScript support with strict typing
- **Extensible Architecture**: Modular design that allows for easy extension

## Architecture

DataEngine follows a layered architecture:

- `DBEngine` - Core database operations with MongoDB integration and Redis caching
- `ModelEngine` - Schema registration and validation with Zod
- `LoggerManager` - Centralized logging with Winston
- `AIManager` - AI-powered features (currently in development)

## Installation

```bash
npm install data-engine
# or
yarn add data-engine
```

## Quick Start

```typescript
import { DBEngine } from 'data-engine';
import { z } from 'zod';

// Define your schema
const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().min(13)
});

// Initialize the engine
const db = new DBEngine({
  connectionString: "mongodb://localhost:27017",
  databaseName: "my_app"
});

// Register your model
db.registerModel('users', UserSchema, true);

// Execute operations
const user = await db.execute({
  collection: 'users',
  command: 'insertOne',
  parameters: {
    name: 'John Doe',
    email: 'john@example.com',
    age: 25
  },
  schema: {
    schema: UserSchema,
    timestamps: true
  }
});
```

## Supported Operations

DataEngine supports the following MongoDB operations:

- `insertOne` - Insert a single document
- `insertMany` - Insert multiple documents
- `find` - Query documents
- `findOne` - Query a single document
- `updateOne` - Update a single document
- `updateMany` - Update multiple documents
- `deleteOne` - Delete a single document
- `deleteMany` - Delete multiple documents
- `aggregate` - Run aggregation pipeline

## Configuration

```typescript
// Example configuration
const engine = new DBEngine({
  connectionString: "mongodb://localhost:27017",
  databaseName: "my_app",
  options: {
    maxPoolSize: 20
  }
});
```

## Advanced Usage

### Caching

DataEngine automatically caches query results using Redis. Cache keys are generated based on the collection, query parameters, and database name.

```typescript
// Results will be cached automatically
const users = await db.execute({
  collection: 'users',
  command: 'find',
  parameters: { age: { $gt: 18 } }
});
```

### Schema Validation

```typescript
// Define schema with validation
const ProductSchema = z.object({
  name: z.string(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  categories: z.array(z.string())
});

// Register model with schema
db.registerModel('products', ProductSchema);

// Schema validation happens automatically during execute
```

## Roadmap

- **Query Builder**: Implementation of a fluent query builder API
- **Migration System**: Database migration utilities
- **Additional Databases**: Support for PostgreSQL, MySQL, and more
- **Enhanced AI Integration**: Advanced AI-powered operations
- **Performance Optimizations**: Further caching and query optimization
- **ORM Features**: Relationship modeling and management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

## Long Live Open Source
