import assert from 'assert';
import { describe, it } from 'node:test';
import { schemaBuilder } from '../schema-builder.js';
import { JSONSchema } from 'json-schema-to-ts';

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
} satisfies JSONSchema;
describe('schemaBuilder pick', () => {
  it('should pick a single property', () => {
    const pickedSchema = schemaBuilder(schema).pick(['name']).schema;
    assert.deepStrictEqual(pickedSchema, { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] });
  });

  it('should pick multiple properties', () => {
    const pickedSchema = schemaBuilder(schema).pick(['name', 'age']).schema;
    assert.deepStrictEqual(pickedSchema, {
      type: 'object',
      properties: { name: { type: 'string' }, age: { type: 'integer' } },
      required: ['name', 'age'],
    });
  });

  it('should return an empty object if no properties are picked', () => {
    const pickedSchema = schemaBuilder(schema).pick([]).schema;
    assert.deepStrictEqual(pickedSchema, { type: 'object', properties: {}, required: [] });
  });
});
