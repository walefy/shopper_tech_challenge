import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import path from 'path';
import fs from 'fs';
import { tmpNameSync } from 'tmp';
import type { GeminiInterpretImageResponse } from '../types/GeminiInterpretImageResponse';

export class GeminiService {
  private genAi: GoogleGenerativeAI;
  private model: GenerativeModel;
  private googleFileManager: GoogleAIFileManager;
  private prompt: string;

  constructor() {
    console.warn('[WARN] class not implemented');
    const { GEMINI_API_KEY } = process.env;

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini api key not found!');
    }

    this.prompt = fs.readFileSync(path.join('assets', 'prompt_v2.txt')).toString();

    this.genAi = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.googleFileManager = new GoogleAIFileManager(GEMINI_API_KEY);
    this.model = this.genAi.getGenerativeModel({ model: 'gemini-1.5-pro' });
  }

  public async interpretImage(imageBase64: string): Promise<GeminiInterpretImageResponse> {
    const buffer = Buffer.from(imageBase64, 'base64');
    const tempFilePath = tmpNameSync({ postfix: '.jpg' });
    fs.writeFileSync(tempFilePath, buffer);

    try {
      const uploadResult = await this.googleFileManager.uploadFile(tempFilePath, {
        mimeType: 'image/jpeg'
      });  

      const generativeAIResponse = await this.model.generateContent([
        { fileData: { fileUri: uploadResult.file.uri, mimeType: uploadResult.file.mimeType } },
        { text: this.prompt }
      ]);
  
      const text = generativeAIResponse.response.text();
      console.log(text);
      return { ok: true, payload: this.extractNumericValue(text)};
    } catch (e) {
      console.log(e);
      return { ok: false, payload: { error_description: 'an error occurred in gemini, try again.' } };
    }
  }

  private extractNumericValue(value: string): number {
    return Number(value.replace(/\D/g, ''));
  }
}
