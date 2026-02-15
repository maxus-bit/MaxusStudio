import { Injectable, inject } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';

export interface GenerationRequest {
  prompt: string;
  image?: string; // base64 image for image-to-image
  mode?: 'text-to-image' | 'image-to-image';
  model?: 'v1' | 'v2';
}

export interface GenerationResponse {
  image: string; // base64 image
  seed: number;
  finishReason: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiApiService {
  private functions = inject(Functions);

  constructor() {}

  async generateImage(request: GenerationRequest, abortSignal?: AbortSignal): Promise<GenerationResponse> {
    const finalPrompt = request.prompt;

    try {
      const generateImageFn = httpsCallable(this.functions, 'generateImage');
      
      const payload: any = {
        prompt: finalPrompt,
        aspectRatio: "16:9"
      };

      if (request.image) {
        payload.image = request.image;
      }
      
      const result: any = await generateImageFn(payload);
      
      if (result.data && result.data.image) {
          return {
              image: `data:image/png;base64,${result.data.image}`,
              seed: 0,
              finishReason: 'SUCCESS'
          };
      }
      
      throw new Error('No image returned from generation service');

    } catch (error: any) {
      console.error('Generation error:', error);
      
      if (error.code === 'functions/not-found' || error.message?.includes('internal')) {
         throw new Error('Backend service for Imagen 3 is not connected or failed. Please check your Cloud Functions.');
      }
      throw new Error(error.message || 'API error');
    }
  }
}
