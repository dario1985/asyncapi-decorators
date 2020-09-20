import 'reflect-metadata';
import { MetadataRegistry } from '../metadata/registry'
import { SchemaObjectMetadata } from '../metadata/interfaces';

const getJsonSchemaType = (target: object, propertyKey: string | symbol): { type: string, format?: string, name?: string } => {
  const designType = Reflect.getMetadata('design:type', target, propertyKey);
  const designTypeName = String(designType?.name);
  if (designTypeName === 'undefined') {
    return { type: 'null' };
  } else if (designTypeName === 'BigInt') {
    return { type: 'integer' };
  } else if (designTypeName === 'Date') {
    return { type: 'string', format: 'date' };
  } else {
    const lowcaseType = designTypeName.toLowerCase();
    if (['array', 'boolean', 'number', 'string', 'object', 'null'].includes(lowcaseType)) {
      return { type: lowcaseType, ...(lowcaseType === 'array' ? { items: { type: 'any' } } : {}) };
    } else {
      return { type: 'object', name: designTypeName };
    }
  }
}

/**
 * @param schema JSON Schema to describe the property
 */
export function ApiProperty(schema?: SchemaObjectMetadata): PropertyDecorator

/**
 * 
 * @param type JSON Schema property type 
 */
export function ApiProperty(type?: string): PropertyDecorator

export function ApiProperty(schemaOrType: SchemaObjectMetadata | string = ''): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const normalisedTypeFormat = getJsonSchemaType(target, propertyKey);
    if (schemaOrType) {
      const schema = typeof schemaOrType === 'string' ? { type: schemaOrType } : schemaOrType;
      schema.type = schema.type || normalisedTypeFormat.type;
      MetadataRegistry.registerMessageField(target.constructor, propertyKey, schema);
    } else {
      MetadataRegistry.registerMessageField(
        target.constructor,
        propertyKey,
        normalisedTypeFormat ?? {},
      );
    }
  }
}
