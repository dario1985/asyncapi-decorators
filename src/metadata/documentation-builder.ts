import yaml from 'yaml';
import { MetadataRegistry } from './registry';
import { ChannelMetadata, ChannelOperationMetadata } from './interfaces';

const isObject = (x: any): x is object => x !== null && typeof x === 'object' && !Array.isArray(x);

const generateMessageRef = (classOrRef: Function | Function[]): object => {
  if (Array.isArray(classOrRef)) {
    return { oneOf: classOrRef.map(generateMessageRef) };
  }

  const name = (typeof classOrRef === 'function') &&
    (classOrRef.hasOwnProperty('prototype') ? classOrRef.name : classOrRef()?.name);

  if (!name) {
    throw new TypeError('Invalid Message Class reference.')
  }
  return { $ref: `#/components/messages/${name}` }
}

export class DocumentationBuilder {
  private servers: Record<string, Record<string, any>> = {};
  private info: Record<string, string> = {};
  private metadata = MetadataRegistry.getMetadata();
  private data: Record<string, string> = {};

  setTitle(title: string) {
    this.info.title = title;
    return this;
  }

  setDescription(description: string) {
    this.info.description = description;
    return this;
  }

  setVersion(version: string) {
    this.info.version = version;
    return this;
  }

  addServer(name: string, url: string, protocol: string, options: Record<string, any> = {}) {
    this.servers[name] = {
      url, protocol, ...options,
    };
    return this;
  }

  setDefaultContentType(type: string) {
    this.data.defaultContentType = type;
    return this;
  }

  private normaliseChannels(): ChannelMetadata {
    const normaliseChannelOperation = (op: any): ChannelOperationMetadata => {
      const message = generateMessageRef((op as ChannelOperationMetadata).message || op);
      return {
        ...(isObject(op) ? op : {}),
        message,
      } as ChannelOperationMetadata;
    }

    return Object.entries(this.metadata.channels).reduce((channels, [name, channel]) => {
      const { publish, subscribe, ...meta } = channel;
      channels[name] = { ...meta };
      if (publish) {
        channels[name].publish = normaliseChannelOperation(publish);
      }
      if (subscribe) {
        channels[name].subscribe = normaliseChannelOperation(subscribe);
      }
      return channels;
    }, {} as Record<string, ChannelMetadata>)
  }

  toJSON() {
    return {
      asyncapi: '2.0.0',
      info: this.info,
      servers: this.servers,
      ...this.data,
      channels: this.normaliseChannels(),
      components: {
        messages: this.metadata.messages,
      }
    }
  }

  toYAML() {
    return yaml.stringify(this.toJSON());
  }
}