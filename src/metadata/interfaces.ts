export interface SchemaRef {
  $ref: Function;
}

export interface SchemaObjectMetadata {
  type?: string;
  title?: string;
  description?: string;
  format?: string;
  default?: any;
  enum?: string[];
  properties?: Record<string | symbol, SchemaObjectMetadata | SchemaRef>;
  required?: string[];
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  examples?: any;
  if?: SchemaObjectMetadata;
  then?: SchemaObjectMetadata;
  else?: SchemaObjectMetadata;
  readOnly?: boolean;
  writeOnly?: boolean;
  patternProperties?: Record<string | symbol, SchemaObjectMetadata | SchemaRef>;
  additionalProperties?: false | SchemaObjectMetadata | SchemaRef;
  additionalItems?: false | SchemaObjectMetadata | SchemaRef;
  items?: SchemaObjectMetadata | SchemaRef | Array<SchemaObjectMetadata | SchemaRef>;
  propertyNames?: Record<string, string>;
  contains?: SchemaObjectMetadata;
  allOf?: Array<SchemaObjectMetadata | SchemaRef>;
  oneOf?: Array<SchemaObjectMetadata | SchemaRef>;
  anyOf?: Array<SchemaObjectMetadata | SchemaRef>;
  not?: SchemaObjectMetadata | SchemaRef;
  xml?: {
    name?: string;
    attribute?: boolean;
    namespace?: string;
    prefix?: string;
  };
}

export interface MessageMetadata {
  name?: string;
  title?: string;
  summary?: string;
  description?: string;
  schemaFormat?: string;
  correlationId?: any;
  contentType?: string;
  bindings?: Record<string, any>;
  payload?: SchemaObjectMetadata;
  headers?: SchemaObjectMetadata;
}

export interface ChannelOperationMetadata {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  message: Function | Function[];
  bindings?: Record<string, any>;
}

export interface ChannelMetadata {
  description?: string;
  subscribe?: ChannelOperationMetadata | Function | Function[];
  publish?: ChannelOperationMetadata | Function | Function[];
  bindings?: Record<string, any>;
}
