import { ApiChannel } from '../decorators/ApiChannel';
import { ApiMessage } from '../decorators/ApiMessage';
import { DocumentationBuilder } from '../metadata/documentation-builder';
import { ApiProperty } from '../decorators/ApiProperty';

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
}

@ApiMessage()
class ResponseDto {
  @ApiProperty()
  message?: string;
}

@ApiChannel('/', {
  description: 'Home',
  subscribe: [ResponseDto],
  publish: {
    bindings: { http: { type: 'request', method: 'GET' } },
    message: () => RequestDto
  },
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

const builder = new DocumentationBuilder()
  .setTitle('Awesome API')
  .setDescription('Awesome api description')
  .setVersion('v1.0.0')
  .addServer('production', 'http://localhost:3000', 'http')
  .setDefaultContentType('application/json')

console.log(builder.toYAML())
