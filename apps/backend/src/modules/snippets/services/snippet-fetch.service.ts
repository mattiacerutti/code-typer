import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { LanguageName } from '@lib/types/CodeLanguage';
import { getSupportedLanguage } from '@lib/utils/game-utils';
import 'dotenv/config';
import { setupCache } from 'axios-cache-interceptor';
import { getSnippetRawLink } from '@/common/utils/snippets/snippet-utils';

const GITHUB_API_URL = 'https://api.github.com';
const TOKEN = process.env.GITHUB_API_TOKEN;

@Injectable()
export class SnippetFetchService {
  private cachedAxios = setupCache(this.http.axiosRef, {
    interpretHeader: false,
  });

  constructor(private http: HttpService) {}
  async fetchRandomCodeFiles(language: LanguageName): Promise<string[]> {
    const extensionsFilter = getSupportedLanguage(language)
      .extensions.map((extension) => `extension:${extension}`)
      .join(' ');

    const request = () =>
      this.cachedAxios.get(`${GITHUB_API_URL}/search/code`, {
        params: {
          q: `language:${language} size:>3000 ${extensionsFilter}`,
          page: Math.ceil(Math.random() * 10),
          per_page: 100,
        },
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
        cache: {
          ttl: 1000 * 60 * 3, // 3 minutes. We can have maximum n_of_languages * 10 requests every 3 minutes. Considering 10 languages, that makes maximum 2000 requests per hour, which is well below the limit of 5000 requests per hour
        },
      });

    let response = await request();

    // Sometimes the request is succesfull but the items array is empty. In this case, we just need to re-try the request
    if (response.data.items.length === 0) {
      response = await request();
    }

    if (response.data.items.length === 0) {
      throw 'Request was successfull but the items array was empty for two times in a row';
    }

    return response.data.items.map((item: any) => getSnippetRawLink(item));
  }

  async getFileContent(rawUrl: any): Promise<string> {
    const request = this.http.get(rawUrl);

    const response = await lastValueFrom(request);

    return response.data;
  }
}
