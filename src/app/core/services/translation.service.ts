import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly API_URL = 'https://api.mymemory.translated.net/get';

  constructor(private http: HttpClient) {}

  async translateToEnglish(text: string): Promise<string> {
    try {
      const response = await this.http.get<any>(`${this.API_URL}?q=${encodeURIComponent(text)}&langpair=auto|en`).toPromise();
      return response?.responseData?.translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }
}

