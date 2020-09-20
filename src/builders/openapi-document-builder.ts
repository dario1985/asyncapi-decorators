import { DocumentBuilder } from '../interfaces/document-builder';
import { MetadataRegistry } from '../metadata/registry';

import { Security, Path } from 'swagger-schema-official';
import yaml from 'yaml';
import { ChannelOperationMetadata } from '../metadata/interfaces';
import { HttpMethod } from '../decorators/ApiChannel';
import { JSONSchema4 } from 'json-schema';
import { generateSchemaRef } from './common';

export class OpenApiDocumentBuilder implements DocumentBuilder {
  private readonly metadata = MetadataRegistry.getMetadata();
  private readonly basePath = '/';
  private readonly document = {
    openapi: '3.0.3',
    info: {
      title: '',
      description: '',
      version: '1.0.0',
    },
    tags: [],
    servers: [] as { url: string, description?: string, variables?: Record<string, any> }[],
    security: [] as Security[],
    paths: {} as Record<string, any>,
    components: {} as Record<string, any>,
  };

  private defaultMediaType = 'application/json';

  public setTitle(title: string): this {
    this.document.info.title = title;
    return this;
  }

  public setDescription(description: string): this {
    this.document.info.description = description;
    return this;
  }

  public setVersion(version: string): this {
    this.document.info.version = version;
    return this;
  }

  public addServer(
    url: string,
    description?: string,
    variables?: Record<string, any> | string
  ): this {
    if (typeof variables === 'string') {
      throw new TypeError('OpenAPI only supports HTTP(s) protocol.');
    }
    this.document.servers.push({ url, description, variables: variables || {} });
    return this;
  }

  public setDefaultContentType(type: string): this {
    this.defaultMediaType = type;
    return this;
  }

  public addSecurity(name: string, options: Security): this {
    this.document.components.securitySchemes = {
      ...(this.document.components.securitySchemes || {}),
      [name]: options
    };
    return this;
  }

  public addOAuth2(
    options: Partial<Security> = {
      type: 'oauth2'
    },
    name = 'oauth2'
  ): this {
    this.addSecurity(name, {
      type: 'oauth2',
      flow: {},
      ...options
    } as Security);
    return this;
  }

  public addApiKey(
    options: Partial<Security> = {
      type: 'apiKey'
    },
    name = 'api_key'
  ): this {
    this.addSecurity(name, {
      type: 'apiKey',
      in: 'header',
      name,
      ...options
    } as Security);
    return this;
  }

  private buildPaths() {
    const buildSchemaRef = generateSchemaRef('#/components/schemas');
    const buildOpenApiContent = (op: ChannelOperationMetadata | Function | Function[]) => ({
      description: '',
      content: {
        [this.defaultMediaType || '*/*']: {
          schema: buildSchemaRef((op as ChannelOperationMetadata).message || op) || {},
        }
      }
    });

    const httpChannels = Object.keys(this.metadata.channels)
      .map((channelName: string): { path: string, method: HttpMethod, operation: any } | void => {
        const channel = this.metadata.channels[channelName];
        const [path] = channelName.split('#');
        const method = (channel.publish as ChannelOperationMetadata)?.bindings?.http?.method;

        if (method) {
          const requestBody = ['GET', 'DELETE', 'TRACE', 'OPTIONS', 'HEAD'].includes(method)
            ? undefined
            : buildOpenApiContent(channel.publish!);

          return {
            path: path.startsWith('/') ? path : `${this.basePath}${path}`,
            method,
            operation: {
              summary: channel.description,
              ...(requestBody && { requestBody }),
              responses: {
                default: buildOpenApiContent(channel.subscribe!)
              }
            }
          }
        }
      })
      .filter(Boolean) as { path: string, method: HttpMethod, operation: any }[];

    return httpChannels.reduce((paths: Record<string, Path>, definition) => {
      const method = definition.method.toLowerCase();
      paths[definition.path] = paths[definition.path] || {};
      paths[definition.path][method as keyof Path] = definition.operation;
      return paths;
    }, {} as Record<string, Path>);
  }

  private buildSchemas() {
    const isAnyArray = (schema: JSONSchema4): boolean => schema.type === 'array' && (
      !schema.items || !schema.items?.length || (schema.items as JSONSchema4)?.type === 'any'
    );

    const cleanSchema = <T extends JSONSchema4>(schema: T): JSONSchema4 => {
      schema = { ...schema };
      if (schema.name && schema.name in this.metadata.messages) {
        if (schema.type === 'object') {
          return { $ref: `#/components/schemas/${schema.name}` };
        } else if (isAnyArray(schema)) {
          schema.items = { $ref: `#/components/schemas/${schema.name}` };
        }
        delete schema.name;
      } else if (isAnyArray(schema)) {
        schema.items = {};
      }

      if (schema.properties) {
        schema.properties = Object.entries(schema.properties)
          .map(([name, propertySchema]): [string, JSONSchema4] => [name, cleanSchema(propertySchema)])
          .reduce((properties, [k, v]) => Object.assign(properties, { [k]: v }), {} as JSONSchema4);
      }

      if (schema.examples && Array.isArray(schema.examples)) {
        if (schema.examples.length === 1) {
          (schema as any).example = schema.examples[0];
          delete schema.examples;
        } else {
          (schema as any).examples = schema.examples.reduce((examples, example, index) => {
            Object.assign(examples, { [`#${index}`]: example })
          }, {} as Record<string, any>)
        }
      }

      return schema;
    };

    return Object.keys(this.metadata.messages).reduce((schemas, name: string) => {
      return this.metadata.messages[name].payload
        ? Object.assign(schemas, { [name]: cleanSchema(this.metadata.messages[name].payload as JSONSchema4) })
        : schemas;
    }, {} as Record<string, JSONSchema4>);
  }

  toJSON() {
    return {
      ...this.document,
      paths: this.buildPaths(),
      components: {
        ...this.document.components,
        schemas: this.buildSchemas(),
      }
    };
  }

  toYAML() {
    return yaml.stringify(this.toJSON());
  }
}