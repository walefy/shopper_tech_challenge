export type ErrorAsValue<T> = 
  | { ok: true, payload: T }
  | { ok: false, payload: { error_description: string } };
