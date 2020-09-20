export * from './decorators/ApiChannel';
export * from './decorators/ApiMessage';
export * from './decorators/ApiProperty';
export * from './metadata/interfaces';
export * from './builders/asyncapi-document-builder';
export * from './builders/openapi-document-builder';

import { AsyncAPIDocumentBuilder } from './builders/asyncapi-document-builder';
export const DocumentationBuilder = AsyncAPIDocumentBuilder;
