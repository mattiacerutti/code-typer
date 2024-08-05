import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { LanguageName } from '@lib/types/CodeLanguage';
import { getSupportedLanguage } from '@lib/utils/game-utils';
import 'dotenv/config';

const GITHUB_API_URL = 'https://api.github.com';
const TOKEN = process.env.GITHUB_API_TOKEN;

@Injectable()
export class SnippetFetchService {
  constructor(private http: HttpService) {}
  async fetchRandomCodeFiles(language: LanguageName): Promise<string[]> {
    const extensionsFilter = getSupportedLanguage(language)
      .extensions.map((extension) => `extension:${extension}`)
      .join(' ');

    const request = this.http.get(`${GITHUB_API_URL}/search/code`, {
      params: {
        q: `language:${language} size:>3000 ${extensionsFilter}`,
        page: Math.ceil(Math.random() * 10),
        per_page: 100,
      },
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    let response = await lastValueFrom(request);

    // Sometimes the request is succesfull but the items array is empty. In this case, we just need to re-try the request
    if (response.data.items.length === 0) {
      response = await lastValueFrom(request);
    }

    if (response.data.items.length === 0) {
      throw 'Request was successfull but the items array was empty for two times in a row';
    }

    return response.data.items.map((item: any) => item.url);
  }

  async fetchFileDetails(fileUrl: string): Promise<any> {
    const request = this.http.get(fileUrl, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    const response = await lastValueFrom(request);

    return response.data;
  }

  async getFileContent(fileDetails: any): Promise<string> {
    const rawUrl = fileDetails.download_url;

    const request = this.http.get(rawUrl);

    const response = await lastValueFrom(request);

    return response.data;
  }
}
