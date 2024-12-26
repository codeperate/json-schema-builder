import { FromSchema, JSONSchema as JSONSchema } from 'json-schema-to-ts';
type Writable<T> = { -readonly [P in keyof T]: Writable<T[P]> };

export interface SchemaBuilder<T extends object = any, Schema = any> {
  type: T;
  schema: Schema;
  pick<Props extends keyof T>(props: Props[], options?: { removeRequired?: boolean }): SchemaBuilder<Pick<T, Props>>;
  omit<Props extends keyof T>(props: Props[], options?: { removeRequired?: boolean }): SchemaBuilder<Omit<T, Props>>;
  set<K extends keyof JSONSchema>(key: K, value: JSONSchema[K] | ((curVal: JSONSchema[K]) => JSONSchema[K])): SchemaBuilder<T>;
  setProps<K extends keyof T, V extends JSONSchema>(
    key: K,
    value: V | ((curVal: JSONSchema) => V),
  ): SchemaBuilder<Omit<T, K> & { [key in K]: FromSchema<V> }>;
  setPropsType<K extends keyof T, V = any>(
    key: K,
    value: JSONSchema | ((curVal: JSONSchema) => JSONSchema),
  ): SchemaBuilder<Omit<T, K> & { [key in K]: V }>;
  optional(props: (keyof T)[]): SchemaBuilder<T>;
  required(props: (keyof T)[]): SchemaBuilder<T>;
  clone(): SchemaBuilder<T>;
  toArray(): SchemaBuilder<Array<T>>;
  noRef(options?: { removeRequired?: boolean }): SchemaBuilder<T>;
}

export const schemaBuilder = <T extends object = any, Schema extends JSONSchema = any>(schema: Schema) => {
  return {
    schema,
    type: {} as T,
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
    setProps(key, value: Writable<JSONSchema> | ((curVal: T[typeof key]) => Writable<JSONSchema>)) {
      const clone = this.clone();
      const { schema } = clone as { schema: Writable<JSONSchema> };
      if (typeof schema == 'boolean') return clone;
      if (!schema?.properties) return clone;
      schema.properties[key as string] = typeof value === 'function' ? value(schema.properties[key as string] as T[typeof key]) : value;
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
      schema.required = schema.required.filter((required) => !props.includes(required as keyof T));
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
  } as SchemaBuilder<T, Schema>;
};
