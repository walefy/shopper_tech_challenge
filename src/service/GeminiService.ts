import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import fs from 'fs';
import type { GeminiInterpretImageResponse } from '../types/GeminiInterpretImageResponse';

export class GeminiService {
  private genAi: GoogleGenerativeAI;
  private model: GenerativeModel;
  private prompt: string;

  constructor() {
    const { GEMINI_API_KEY } = process.env;

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini api key not found!');
    }

    this.prompt = fs.readFileSync(path.join('assets', 'prompt_v2.txt')).toString();
    this.genAi = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = this.genAi.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  public async interpretImage(imageBase64: string): Promise<GeminiInterpretImageResponse> {
    try {
      const generativeAIResponse = await this.model.generateContent([
        {inlineData: { data: imageBase64, mimeType: 'image/jpeg' }},
        { text: this.prompt }
      ]);
  
      const text = generativeAIResponse.response.text();
      const value = this.extractNumericValue(text)
      return { ok: true, payload: { value }};
    } catch (e) {
      console.log(e);
      return { ok: false, payload: { errorDescription: 'an error occurred in gemini, try again.' } };
    }
  }

  private extractNumericValue(value: string): number {
    return Number(value.replace(/\D/g, ''));
  }
}
