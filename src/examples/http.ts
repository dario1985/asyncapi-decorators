import { ApiChannel, ApiHttpChannel } from '../decorators/ApiChannel';
import { ApiMessage } from '../decorators/ApiMessage';
import { AsyncAPIDocumentBuilder } from '../builders/asyncapi-document-builder';
import { ApiProperty } from '../decorators/ApiProperty';
import { OpenApiDocumentBuilder } from '../builders/openapi-document-builder';

class EmbeddedDto {
  @ApiProperty()
  externalId?: string;

  @ApiProperty()
  items?: string[];

  @ApiProperty()
  createdAt?: Date;
}

class BaseRequestDto {
  @ApiProperty()
  key?: string;

  @ApiProperty()
  query?: string;
}

@ApiMessage({
  headers: {
    type: 'object',
    required: ['authentication'],
    properties: {
      authentication: { type: 'string' }
    }
  }
})
class RequestDto extends BaseRequestDto {
  @ApiProperty({ minLength: 35 })
  body?: string;

  @ApiProperty({
    type: 'string',
    minLength: 24,
    maxLength: 24,
    format: 'binary'
  })
  query?: string;

  @ApiProperty()
  hasBody?: boolean;

  @ApiProperty()
  object?: EmbeddedDto;
}

@ApiMessage()
class ResponseDto {
  @ApiProperty()
  message?: string;
}

@ApiHttpChannel('/', 'GET', RequestDto, [ResponseDto], {
  description: 'Home'
})
@ApiChannel('/', {
  description: 'Create',
  subscribe: ResponseDto,
  publish: {
    bindings: { http: { type: 'request', method: 'POST' } },
    message: () => RequestDto
  },
})
// @ts-ignore
class Handler { }

const asyncApiBuilder = new AsyncAPIDocumentBuilder()
  .setTitle('Awesome API')
  .setDescription('Awesome api description')
  .setVersion('v1.0.0')
  .addServer('production', 'http://localhost:3000', 'http')
  .setDefaultContentType('application/json')

console.log('\n'.padStart(32, '-') + ' AsyncAPI document:\n\n' + asyncApiBuilder.toYAML())

const openApiBuilder = new OpenApiDocumentBuilder()
  .setTitle('Awesome API')
  .setDescription('Awesome api description')
  .setVersion('v1.0.0')
  .addServer('http://localhost:3000', 'Local server')
  .setDefaultContentType('application/json')

console.log('\n'.padStart(32, '-') + ' OpenAPI document:\n\n' + openApiBuilder.toYAML())
