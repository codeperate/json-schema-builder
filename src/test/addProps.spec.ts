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

describe('schemaBuilder addProps', () => {
    it('should add a single property', () => {
        const updatedSchema = schemaBuilder(schema).addProps('gender', { type: 'string' }).schema;
        assert.deepStrictEqual(updatedSchema, {
            type: 'object',
            properties: {
                ...schema.properties,
                gender: { type: 'string' },
            },
            required: ['name', 'age', 'email', 'address'],
        });
    });

    it('should add a property with required flag', () => {
        const updatedSchema = schemaBuilder(schema).addProps('gender', { type: 'string' }, { required: true }).schema;
        assert.deepStrictEqual(updatedSchema, {
            type: 'object',
            properties: {
                ...schema.properties,
                gender: { type: 'string' },
            },
            required: ['name', 'age', 'email', 'address', 'gender'],
        });
    });

    it('should add a property using a function', () => {
        const updatedSchema = schemaBuilder(schema).addProps('age', (current: any) => ({
            ...current,
            minimum: 0,
            maximum: 120
        })).schema;
        assert.deepStrictEqual(updatedSchema, {
            type: 'object',
            properties: {
                ...schema.properties,
                age: { type: 'integer', minimum: 0, maximum: 120 },
            },
            required: ['name', 'age', 'email', 'address'],
        });
    });

    it('should add a nested object property', () => {
        const updatedSchema = schemaBuilder(schema).addProps('contact', {
            type: 'object',
            properties: {
                phone: { type: 'string' },
                fax: { type: 'string' }
            },
            required: ['phone']
        }).schema;
        assert.deepStrictEqual(updatedSchema, {
            type: 'object',
            properties: {
                ...schema.properties,
                contact: {
                    type: 'object',
                    properties: {
                        phone: { type: 'string' },
                        fax: { type: 'string' }
                    },
                    required: ['phone']
                }
            },
            required: ['name', 'age', 'email', 'address'],
        });
    });

    it('should handle boolean schema', () => {
        const booleanSchema = true;
        const updatedSchema = schemaBuilder(booleanSchema).addProps('test', { type: 'string' }).schema;
        assert.deepStrictEqual(updatedSchema, booleanSchema);
    });
}); 