Here is a basic

README.md

for your project:

````markdown
# JSON Schema Builder

A TypeScript library for building and manipulating JSON schemas.

## Installation

To install the library, run:

```sh
npm install @codeperate/json-schema-builder
```
````

## Usage

Here is an example of how to use the `schemaBuilder`:

```ts
import { schemaBuilder } from '@codeperate/json-schema-builder';

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

const updatedSchema = schemaBuilder(schema).pick(['name', 'email']).schema;
console.log(updatedSchema);
```

## API

### `schemaBuilder(schema: JSONSchema)`

Creates a new `SchemaBuilder` instance.

### Methods

- `pick(props: (keyof T)[] | RegExp, options?: { removeRequired?: boolean }): SchemaBuilder<T>`
- `omit(props: (keyof T)[] | RegExp, options?: { removeRequired?: boolean }): SchemaBuilder<T>`
- `set<K extends keyof JSONSchema>(key: K, value: JSONSchema[K] | ((curVal: JSONSchema[K]) => JSONSchema[K])): SchemaBuilder<T>`
- `setProps<K extends keyof T, V extends JSONSchema>(key: K, value: V | ((curVal: JSONSchema) => V)): SchemaBuilder<Omit<T, K> & { [key in K]: FromSchema<V> }>`
- `setPropsRaw<K extends keyof T, V = any>(key: K, value: JSONSchema | ((curVal: JSONSchema) => JSONSchema)): SchemaBuilder<Omit<T, K> & { [key in K]: V }>`
- `optional(props: (keyof T)[]): SchemaBuilder<T>`
- `required(props: (keyof T)[]): SchemaBuilder<T>`
- `clone(): SchemaBuilder<T>`
- `toArray(): SchemaBuilder<Array<T>>`
- `noRef(options?: { removeRequired?: boolean }): SchemaBuilder<T>`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
