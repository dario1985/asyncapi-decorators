import { MetadataRegistry } from '../metadata/registry';
import { MessageMetadata } from '../metadata/interfaces';

/**
 * @param schema optional message schema metadata
 */
export function ApiMessage(schema: MessageMetadata = {}): ClassDecorator {
  return (klass: Function) => MetadataRegistry.registerMessage(klass, schema);
}
