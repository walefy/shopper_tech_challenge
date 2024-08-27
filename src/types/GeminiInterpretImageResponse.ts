export type GeminiInterpretImageResponse = 
  | { ok: true, payload: number }
  | { ok: false, payload: { error_description: string } };