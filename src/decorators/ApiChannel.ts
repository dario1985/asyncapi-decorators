import { MetadataRegistry } from '../metadata/registry';
import { ChannelMetadata } from '../metadata/interfaces';

export type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';

/**
 * @param name Channel Name
 * @param schema Channel Schema
 */
export function ApiChannel(name: string, schema: ChannelMetadata = {}): ClassDecorator {
  return (_target: Function) => MetadataRegistry.registerChannel(name, schema);
}

/**
 * @param {string} path Http Route Path
 * @param {string} method Http method
 * @param request Request message(s)
 * @param response Response message(s)
 * @param {ChannelMetadata} schema [optional] schema
 */
export function ApiHttpChannel(
  path: string,
  method: HttpMethod,
  request: Function | Function[],
  response: Function | Function[],
  schema: ChannelMetadata = {},
) {
  return ApiChannel(path, {
    publish: { message: request, bindings: { http: { type: 'request', method } } },
    subscribe: { message: response, bindings: { http: { type: 'response' } } },
    ...schema,
  })
}