import { FromSchema, JSONSchema as JSONSchema } from 'json-schema-to-ts';
type Writable<T> = { -readonly [P in keyof T]: Writable<T[P]> };
type SchemaProperties<T> = T extends { properties: infer U } ? U : never;
export interface SchemaBuilder<Schema extends JSONSchema = any, Type = SchemaProperties<Schema>> {
  type?: Type;
  schema: Schema;
  pick<Props extends keyof Type>(
    props: ((string & {}) | Props)[],
    options?: { removeRequired?: boolean },
  ): SchemaBuilder<Schema, Pick<Type, Props>>;
  omit<Props extends keyof Type>(
    props: ((string & {}) | Props)[],
    options?: { removeRequired?: boolean },
  ): SchemaBuilder<Schema, Omit<Type, Props>>;
  set<K extends keyof JSONSchema>(key: K, value: JSONSchema[K] | ((curVal: JSONSchema[K]) => JSONSchema[K])): SchemaBuilder<Schema, Type>;
  setProps<K extends keyof Type, V extends JSONSchema>(
    key: (string & {}) | K,
    value: V | ((curVal: JSONSchema) => V),
  ): SchemaBuilder<Schema, Omit<Type, K> & { [key in K]: FromSchema<V> }>;
  setPropsType<K extends keyof Type, V = any>(
    key: (string & {}) | K,
    value: JSONSchema | ((curVal: JSONSchema) => JSONSchema),
  ): SchemaBuilder<Schema, Omit<Type, K> & { [key in K]: V }>;
  optional(props: ((string & {}) | keyof Type)[]): SchemaBuilder<Schema, Type>;
  required(props: ((string & {}) | keyof Type)[]): SchemaBuilder<Schema, Type>;
  clone(): SchemaBuilder<Schema, Type>;
  toArray(): SchemaBuilder<{ type: 'array'; items: Schema }, Array<Type>>;
  noRef(options?: { removeRequired?: boolean }): SchemaBuilder<Schema, Type>;
  withType<V extends object>(type?: V): SchemaBuilder<Schema, V>;
}

export const schemaBuilder = <Schema extends JSONSchema = any, Type = SchemaProperties<Schema>>(schema: Schema) => {
  return {
    schema,
    pick(props, { removeRequired = true } = {}) {
      const clone = this.clone();
      const { schema } = clone as { schema: Writable<JSONSchema> };
      if (typeof schema == 'boolean') return clone;

      if (!schema.properties) return clone;
      const deleted: string[] = [];
      for (const key in schema.properties) {
        const condition = props.includes(key as (typeof props)[0]);
        if (!condition) {
          delete schema.properties[key];
          deleted.push(key);
          continue;
        }
      }
      if (schema.required && removeRequired) schema.required = schema.required.filter((require) => !deleted.includes(require));
      return clone;
    },
    omit(props, { removeRequired = true } = {}) {
      const clone = this.clone();
      const { schema } = clone as { schema: Writable<JSONSchema> };
      if (typeof schema == 'boolean') return clone;
      if (!schema.properties) return clone;
      const deleted: string[] = [];
      for (const key in schema.properties) {
        const condition = props.includes(key as (typeof props)[0]);
        if (condition) {
          delete schema.properties[key];
          deleted.push(key);
          continue;
        }
      }
      if (schema.required && removeRequired) schema.required = schema.required.filter((require) => !deleted.includes(require));
      return clone;
    },
    set(key, value) {
      const clone = this.clone();
      clone.schema[key] = typeof value === 'function' ? value(clone.schema[key]) : value;
      return clone;
    },
    setProps(key, value: Writable<JSONSchema> | ((curVal) => Writable<JSONSchema>)) {
      const clone = this.clone();
      const { schema } = clone as { schema: Writable<JSONSchema> };
      if (typeof schema == 'boolean') return clone;
      if (!schema?.properties) return clone;
      schema.properties[key as string] = typeof value === 'function' ? value(schema.properties[key as string]) : value;
      return clone;
    },
    setPropsType(...args) {
      return this.setProps(...args);
    },
    clone() {
      return schemaBuilder(JSON.parse(JSON.stringify(this.schema)));
    },
    toArray() {
      return schemaBuilder({ type: 'array', items: this.schema });
    },
    optional(props) {
      const clone = this.clone();
      const { schema } = clone as { schema: Writable<JSONSchema> };
      if (typeof schema == 'boolean') return clone;
      if (!schema.required) schema.required = [];
      schema.required = schema.required.filter((required) => !props.includes(required as keyof Type));
      return clone;
    },
    required(props) {
      const clone = this.clone();
      const { schema } = clone as { schema: Writable<JSONSchema> };
      if (typeof schema == 'boolean') return clone;
      if (!schema.required) schema.required = [];
      schema.required = Array.from(new Set([...schema.required, ...props])) as string[];
      return clone;
    },
    noRef({ removeRequired = true } = {}) {
      const clone = this.clone();
      const { schema } = clone as { schema: Writable<JSONSchema> };
      const deleted: string[] = [];
      if (typeof schema === 'boolean' || !schema.properties) return clone;
      schema.properties = Object.keys(schema.properties).reduce((reducer, key) => {
        if (JSON.stringify(schema.properties![key]).indexOf('$ref') == -1) return { ...reducer, [key]: schema.properties![key] };
        deleted.push(key);
        return reducer;
      }, {});
      if (schema.required && removeRequired) schema.required = schema.required.filter((str: string) => !deleted.includes(str));
      return clone;
    },
    withType() {
      return this;
    },
  } as SchemaBuilder<Schema, Type>;
};
