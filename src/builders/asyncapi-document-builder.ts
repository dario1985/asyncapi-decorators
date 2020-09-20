import yaml from 'yaml';
import { MetadataRegistry } from '../metadata/registry';
import { ChannelMetadata, ChannelOperationMetadata, MessageMetadata, SchemaObjectMetadata } from '../metadata/interfaces';
import { generateSchemaRef, isObject } from './common';

export class AsyncAPIDocumentBuilder {
  private servers: Record<string, Record<string, any>> = {};
  private info: Record<string, string> = {};
  private metadata = MetadataRegistry.getMetadata();
  private data: Record<string, string> = {};

  setTitle(title: string): this {
    this.info.title = title;
    return this;
  }

  setDescription(description: string) {
    this.info.description = description;
    return this;
  }

  setVersion(version: string): this {
    this.info.version = version;
    return this;
  }

  addServer(name: string, url: string, protocol: string, options: Record<string, any> = {}): this {
    this.servers[name] = {
      url, protocol, ...options,
    };
    return this;
  }

  setDefaultContentType(type: string): this {
    this.data.defaultContentType = type;
    return this;
  }

  private buildComponents() {
    const messages: Record<string, MessageMetadata> = {};
    const schemas: Record<string, SchemaObjectMetadata> = {};
    Object.keys(this.metadata.messages).forEach(name => {
      const message = { ...this.metadata.messages[name] };
      if (message.payload) {
        schemas[name] = message.payload;
        message.payload = { $ref: `#/components/schemas/${name}` } as any;
      }
      messages[name] = message;
    });
    return { messages, schemas };
  }

  private normaliseChannels(): ChannelMetadata {
    const generateMessageRef = generateSchemaRef('#/components/messages');
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
      components: this.buildComponents(),
    }
  }

  toYAML() {
    return yaml.stringify(this.toJSON());
  }
}