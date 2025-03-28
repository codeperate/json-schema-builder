# JSON Schema Builder

A powerful TypeScript library for building, manipulating, and transforming JSON schemas with a fluent API.

## Features

- 🛠️ Fluent API for schema manipulation
- 🔄 Pick and omit properties from schemas
- ⚡ Dynamic property updates
- 🔒 Required/optional property management
- 📦 Array schema conversion
- 🔄 Reference removal
- 🧬 Type-safe operations

## Installation

```bash
npm install @codeperate/json-schema-builder
```

## Quick Start

```typescript
import { schemaBuilder } from '@codeperate/json-schema-builder';

// Create a schema
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'integer' },
    email: { type: 'string' },
    address: {
      type: 'object',
      properties: {
        street: { type: 'string' },
        city: { type: 'string' },
      },
      required: ['street', 'city'],
    },
  },
  required: ['name', 'age', 'email', 'address'],
};

// Use the builder to transform the schema
const updatedSchema = schemaBuilder(schema).pick(['name', 'email']).schema;

console.log(updatedSchema);
```

## API Reference

### Core Methods

#### `schemaBuilder(schema: JSONSchema)`

Creates a new `SchemaBuilder` instance.

#### Property Selection

- `pick(props: (keyof T)[] | RegExp, options?: { removeRequired?: boolean }): SchemaBuilder<T>`

  - Select specific properties from the schema
  - Optionally remove required properties

- `omit(props: (keyof T)[] | RegExp, options?: { removeRequired?: boolean }): SchemaBuilder<T>`
  - Remove specific properties from the schema
  - Optionally remove required properties

#### Property Management

- `optional(props: (keyof T)[]): SchemaBuilder<T>`

  - Make specified properties optional

- `required(props: (keyof T)[]): SchemaBuilder<T>`
  - Make specified properties required

#### Schema Manipulation

- `set<K extends keyof JSONSchema>(key: K, value: JSONSchema[K] | ((curVal: JSONSchema[K]) => JSONSchema[K])): SchemaBuilder<T>`

  - Set a schema property directly

- `setProps<K extends keyof T, V extends JSONSchema>(key: K, value: V | ((curVal: JSONSchema) => V)): SchemaBuilder<Omit<T, K> & { [key in K]: FromSchema<V> }>`

  - Set a property with type safety

- `setPropsRaw<K extends keyof T, V = any>(key: K, value: JSONSchema | ((curVal: JSONSchema) => JSONSchema)): SchemaBuilder<Omit<T, K> & { [key in K]: V }>`
  - Set a property without type constraints

#### Utility Methods

- `clone(): SchemaBuilder<T>`

  - Create a deep copy of the current schema

- `toArray(): SchemaBuilder<Array<T>>`

  - Convert the schema to an array schema

- `noRef(options?: { removeRequired?: boolean }): SchemaBuilder<T>`
  - Remove all references from the schema

## Examples

### Picking Properties

```typescript
const schema = schemaBuilder(originalSchema).pick(['name', 'email']).schema;
```

### Making Properties Optional

```typescript
const schema = schemaBuilder(originalSchema).optional(['age', 'address']).schema;
```

### Converting to Array

```typescript
const arraySchema = schemaBuilder(originalSchema).toArray().schema;
```

### Removing References

```typescript
const cleanSchema = schemaBuilder(originalSchema).noRef().schema;
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
