import type { GeminiInterpretImageResponse } from '../../src/types/GeminiInterpretImageResponse';

export class GeminiServiceMock {
  public static ok: boolean = false;
  public static payload: any;

  constructor() {
    console.log('mocked GeminiService');
  }

  public async interpretImage(imageBase64: string): Promise<GeminiInterpretImageResponse> {
    return { ok: GeminiServiceMock.ok, payload: GeminiServiceMock.payload };
  }
}
