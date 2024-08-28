const camelToSnakeString = (str: string) =>
  str.replace(/([A-Z])/g, letter => `_${letter.toLowerCase()}`);

export const camelToSnake = (obj: Record<string, any> | Record<string, any>[]): Record<string, any> | Record<string, any>[] => {
  if (Array.isArray(obj)) {
    return obj.map((el) => camelToSnake(el));
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = camelToSnakeString(key);
      acc[snakeKey] = camelToSnake(obj[key]);
      return acc;
    }, {} as typeof obj);
  }

  return obj;
}