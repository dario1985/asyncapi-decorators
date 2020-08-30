import { MetadataRegistry } from '../metadata/registry';
import { MessageMetadata } from '../metadata/interfaces';

export function ApiMessage(schema: MessageMetadata = {}): ClassDecorator {
  return (klass: Function) => MetadataRegistry.registerMessage(klass, schema);
}
