import assert from 'assert';
import { describe, it } from 'node:test';
import { schemaBuilder } from '../schema-builder.js';

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
} as const;

describe('schemaBuilder required', () => {
  it('should add required properties', () => {
    const updatedSchema = schemaBuilder(schema).required(['gender', 'country']).schema;
    assert.deepStrictEqual(updatedSchema, {
      type: 'object',
      properties: {
        ...schema.properties,
      },
      required: ['name', 'age', 'email', 'address', 'gender', 'country'],
    });
  });

  it('should not duplicate required properties', () => {
    const updatedSchema = schemaBuilder(schema).required(['name', 'email']).schema;
    assert.deepStrictEqual(updatedSchema, {
      type: 'object',
      properties: {
        ...schema.properties,
      },
      required: ['name', 'age', 'email', 'address'],
    });
  });
});
