import { ChannelMetadata, MessageMetadata, SchemaObjectMetadata } from './interfaces';
import merge from 'lodash.merge';

export class MetadataRegistry {
  private static classRelations: Record<string, string> = {};
  private static data = {
    channels: {} as Record<string, ChannelMetadata>,
    messages: {} as Record<string, MessageMetadata>,
  }

  static getMessage(target: Function) {
    const className = target.name;
    const parentClassName = Object.getPrototypeOf(target).name;
    if (!this.data.messages[className]) {
      if (parentClassName) {
        this.classRelations[className] = parentClassName;
      }
      this.data.messages[className] = {};
    }
    return this.data.messages[className];
  }

  static getMessagePayload(target: Function): SchemaObjectMetadata {
    const message = this.getMessage(target);
    message.payload = message.payload || { type: 'object', properties: {} };
    message.payload.properties = message.payload.properties || {};
    return message.payload;
  }

  static registerMessageField(target: Function, fieldName: string | symbol, schema: SchemaObjectMetadata) {
    const payload = this.getMessagePayload(target);
    payload.properties![fieldName as string] = schema;
  }

  static registerMessage(target: Function, schema: MessageMetadata = {}) {
    const message = this.getMessage(target);
    Object.assign(message, schema);
  }

  static registerChannel(name: string, schema: ChannelMetadata = {}) {
    this.data.channels[name] = schema;
  }

  static getMetadata() {
    const inheritProperties = (className: string, meta: MessageMetadata): MessageMetadata => {
      const parentClassName = this.classRelations[className];
      if (parentClassName && this.data.messages[parentClassName]) {
        return inheritProperties(parentClassName, merge({}, this.data.messages[parentClassName], meta));
      }
      return meta;
    }

    return {
      channels: this.data.channels,
      messages: Object.entries(this.data.messages).reduce((messages, [className, meta]) => {
        messages[className] = inheritProperties(className, meta);
        return messages;
      }, {} as Record<string, MessageMetadata>),
    };
  }
}
