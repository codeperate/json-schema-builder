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

describe('schemaBuilder setProps', () => {
  it('should set a single property', () => {
    const updatedSchema = schemaBuilder(schema).setProps('gender', { type: 'string' }).schema;
    assert.deepStrictEqual(updatedSchema, {
      type: 'object',
      properties: {
        ...schema.properties,
        gender: { type: 'string' },
      },
      required: ['name', 'age', 'email', 'address'],
    });
  });

  it('should set multiple properties', () => {
    const updatedSchema = schemaBuilder(schema).setProps('gender', { type: 'string' }).setProps('country', { type: 'string' }).schema;
    assert.deepStrictEqual(updatedSchema, {
      type: 'object',
      properties: {
        ...schema.properties,
        gender: { type: 'string' },
        country: { type: 'string' },
      },
      required: ['name', 'age', 'email', 'address'],
    });
  });

  it('should overwrite existing properties', () => {
    const updatedSchema = schemaBuilder(schema).setProps('name', { type: 'number' }).schema;
    assert.deepStrictEqual(updatedSchema, {
      type: 'object',
      properties: {
        ...schema.properties,
        name: { type: 'number' },
      },
      required: ['name', 'age', 'email', 'address'],
    });
  });
});

schemaBuilder(schema).setProps('email', { type: 'number' });
