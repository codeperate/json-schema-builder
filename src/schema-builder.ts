import { FromSchema, JSONSchema as JSONSchema } from 'json-schema-to-ts';
type Writable<T> = { -readonly [P in keyof T]: Writable<T[P]> };
type SchemaProperties<T> = T extends { properties: infer U } ? U : never;
type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
type RequiredByKey<T, K extends keyof T> = Omit<T, K> & { [key in K]: T[key] };
type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;
export interface SchemaBuilder<Schema extends JSONSchema = any, Type = SchemaProperties<Schema>> {
  type?: Type;
  schema: Schema;
  typedSchema: Type;

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
  optional<Key extends keyof Type>(props: (Key | (string & {}))[]): SchemaBuilder<Schema, Optional<Type, Key>>;
  required<Key extends keyof Type>(props: (Key | (string & {}))[]): SchemaBuilder<Schema, RequiredByKey<Type, Key>>;
  allOptional<Deep extends boolean = false>(deep?: Deep): SchemaBuilder<Schema, Deep extends true ? DeepPartial<Type> : Partial<Type>>;
  allRequired(): SchemaBuilder<Schema, Required<Type>>;
  clone(): SchemaBuilder<Schema, Type>;
  toArray(): SchemaBuilder<{ type: 'array'; items: Schema }, Array<Type>>;
  noRef(options?: { removeRequired?: boolean }): SchemaBuilder<Schema, Type>;
  withType<V extends object>(type?: V): SchemaBuilder<Schema, V>;
}

export const schemaBuilder = <Schema extends JSONSchema = any, Type = SchemaProperties<Schema>>(schema: Schema) => {
  return {
    schema: JSON.parse(JSON.stringify(schema)),
    pick(props, { removeRequired = true } = {}) {
      const { schema } = this as { schema: Writable<JSONSchema> };
      if (typeof schema == 'boolean') return this;
      if (!schema.properties) return this;
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
      return this;
    },
    omit(props, { removeRequired = true } = {}) {
      const { schema } = this as { schema: Writable<JSONSchema> };
      if (typeof schema == 'boolean') return this;
      if (!schema.properties) return this;
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
      return this;
    },
    set(key, value) {
      this.schema[key] = typeof value === 'function' ? value(this.schema[key]) : value;
      return this;
    },
    setProps(key, value: Writable<JSONSchema> | ((curVal) => Writable<JSONSchema>)) {
      const { schema } = this as { schema: Writable<JSONSchema> };
      if (typeof schema == 'boolean') return this;
      if (!schema?.properties) return this;
      schema.properties[key as string] = typeof value === 'function' ? value(schema.properties[key as string]) : value;
      return this;
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
      const { schema } = this as { schema: Writable<JSONSchema> };
      if (typeof schema == 'boolean') return this;
      if (!schema.required) schema.required = [];
      schema.required = schema.required.filter((required) => !props.includes(required as any));
      return this;
    },
    allOptional(deep) {
      const { schema } = this as { schema: Writable<JSONSchema> };
      if (typeof schema == 'boolean') return this;
      if (schema.required) delete schema.required;
      if (deep) {
        const deepOptional = (obj: Record<any, any>) => {
          for (const [key, value] of Object.entries(obj)) {
            if (key == 'required' && Array.isArray(value)) delete obj[key];
            if (typeof value == 'object' && value && value.constructor.name === 'Object') {
              obj[key] = deepOptional(value);
            }
          }
          return obj;
        };
        deepOptional(schema);
      }
      return this;
    },
    allRequired() {
      const { schema } = this as { schema: Writable<JSONSchema> };
      if (typeof schema == 'boolean') return this;
      schema.required = Object.keys(schema.properties ?? {});
      return this;
    },
    required(props) {
      const { schema } = this as { schema: Writable<JSONSchema> };
      if (typeof schema == 'boolean') return this;
      if (!schema.required) schema.required = [];
      schema.required = Array.from(new Set([...schema.required, ...props])) as string[];
      return this;
    },
    noRef({ removeRequired = true } = {}) {
      const { schema } = this as { schema: Writable<JSONSchema> };
      const deleted: string[] = [];
      if (typeof schema === 'boolean' || !schema.properties) return this;
      schema.properties = Object.keys(schema.properties).reduce((reducer, key) => {
        if (JSON.stringify(schema.properties![key]).indexOf('$ref') == -1) return { ...reducer, [key]: schema.properties![key] };
        deleted.push(key);
        return reducer;
      }, {});
      if (schema.required && removeRequired) schema.required = schema.required.filter((str: string) => !deleted.includes(str));
      return this;
    },
    withType() {
      return this;
    },
    get typedSchema() {
      return this.schema as unknown as Type;
    },
  } as SchemaBuilder<Schema, Type>;
};
