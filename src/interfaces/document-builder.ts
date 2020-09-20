export interface DocumentBuilder {
  setTitle(title: string): this;
  setDescription(description: string): this;
  setVersion(version: string): this;
  setDefaultContentType(type: string): this;
  addServer(
    url: string,
    description?: string,
    variables?: Record<string, any>
  ): this;

  addServer(
    name: string,
    url: string,
    protocol: string,
    options: Record<string, any>,
  ): this;

  toJSON(): object;
  toYAML(): string;
}
