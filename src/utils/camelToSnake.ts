export const camelToSnake = (obj: Record<string, unknown>) => {
  const camelToSnakeString = (str: string) =>
    str.replace(/([A-Z])/g, letter => `_${letter.toLowerCase()}`);

  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = camelToSnakeString(key);
      acc[snakeKey] = obj[key];
      return acc;
    }, {} as typeof obj);
  }

  return obj;
}