import 'reflect-metadata';
import { MetadataRegistry } from '../metadata/registry'

export function ApiProperty(schema: Record<string, any> = {}): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const type = Reflect.getMetadata('design:type', target, propertyKey);
    MetadataRegistry.registerMessageField(target.constructor, propertyKey, {
      type: String(type?.name).toLowerCase(),
      ...schema,
    });
  }
}
