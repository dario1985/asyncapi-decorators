export const isObject = (x: any): x is object => x !== null && typeof x === 'object' && !Array.isArray(x);

export const generateSchemaRef = (componentPathPrefix: string) => (classOrRef: Function | Function[]): object => {
  if (Array.isArray(classOrRef)) {
    if (classOrRef.length > 1) {
      return { oneOf: classOrRef.map(generateSchemaRef(componentPathPrefix)) };
    } else {
      classOrRef = classOrRef[0];
    }
  }

  const name = (typeof classOrRef === 'function') &&
    (classOrRef.hasOwnProperty('prototype') ? classOrRef.name : classOrRef()?.name);

  if (!name) {
    throw new TypeError('Invalid Message Class reference.');
  }
  return { $ref: `${componentPathPrefix}/${name}` };
};
