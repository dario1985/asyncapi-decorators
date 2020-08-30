import 'reflect-metadata';
import { MetadataRegistry } from '../metadata/registry'
import { SchemaObjectMetadata } from '../metadata/interfaces';

export function ApiProperty(schema?: SchemaObjectMetadata): PropertyDecorator
export function ApiProperty(type?: string): PropertyDecorator
export function ApiProperty(schemaOrType: SchemaObjectMetadata | string = ''): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const type = String(Reflect.getMetadata('design:type', target, propertyKey)?.name).toLowerCase();
    if (schemaOrType) {
      const schema = typeof schemaOrType === 'string' ? { type: schemaOrType } : schemaOrType;
      schema.type = schema.type || type;
      MetadataRegistry.registerMessageField(target.constructor, propertyKey, schema);
    } else {
      MetadataRegistry.registerMessageField(
        target.constructor,
        propertyKey,
        type ? { type } : {},
      );
    }
  }
}
