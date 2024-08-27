export type PayloadSuccess = {
  value: number;
  image_uri: string;
};

export type GeminiInterpretImageResponse = 
  | { ok: true, payload: PayloadSuccess }
  | { ok: false, payload: { error_description: string } };