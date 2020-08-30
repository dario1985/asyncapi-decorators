import { MetadataRegistry } from '../metadata/registry';
import { ChannelMetadata } from '../metadata/interfaces';

export function ApiChannel(name: string, schema: ChannelMetadata = {}): ClassDecorator {
  return (_target: Function) => MetadataRegistry.registerChannel(name, schema);
}
