# asyncapi-decorators

NPM/Yarn module for generate automatic asyncapi documentation

## Getting Started

```
npm i asyncapi-decorators
```

Notes:
* To enable experimental support for metadata decorators in your TypeScript project, you must add `"experimentalDecorators": true` to your `tsconfig.json` file.
* To enable experimental support for auto-generated type metadata in your TypeScript project, you must add `"emitDecoratorMetadata": true` to your `tsconfig.json` file.
Please note that auto-generated type metadata may have issues with circular or forward references for types.

## Decorators

### ApiChannel()

This decorator is used to create a Channel definition. You can add message subscription/publishing using the format `{ publish: YourMessageClass }` or `{ publish: () => YourMessageClass }` (in case you have cross references). 

It optionally accepts all channel item definition schema attributes from [AsyncAPI Channel specification](https://github.com/asyncapi/asyncapi/blob/master/versions/2.0.0/asyncapi.md#channel-item-object)

### ApiMessage()

This decorator is used to create a Message definition. 
It optionally accepts all message definition schema attributes from [AsyncAPI Message specification](https://github.com/asyncapi/asyncapi/blob/master/versions/2.0.0/asyncapi.md#messageObject)

### ApiProperty()

This decorator is used to create a Message property definition. 
It optionally accepts all message property definition schema attributes from [AsyncAPI Message Properties specification](https://github.com/asyncapi/asyncapi/blob/master/versions/2.0.0/asyncapi.md#properties)

## Documentation Builder

```
const yaml: string = new DocumentationBuilder()
  .setTitle('Awesome API')
  .setDescription('Awesome api description')
  .setVersion('v1.0.0')
  .addServer('production', 'http://localhost:3000', 'http')
  .setDefaultContentType('application/json')
  .toYAML();
```
## Examples

Look into the `examples` directory to find some ones.
