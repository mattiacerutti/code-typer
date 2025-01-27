import { Injectable } from '@nestjs/common';
import { SnippetFetchService } from './services/snippet-fetch.service';
import { SnippetProcessService } from './services/snippet-process.service';
import { LanguageName } from '@lib/types/CodeLanguage';
import {
  MIN_CACHED_SNIPPETS,
  SNIPPETS_SIMULTANEOUS_REQUESTS,
} from '@/common/constants/snippet-process-constant';
import { getUniqueRandomIndexes } from '@/common/utils/snippets/snippet-utils';

@Injectable()
export class SnippetsService {
  constructor(
    private readonly snippetFetchService: SnippetFetchService,
    private readonly snippetProcessService: SnippetProcessService,
  ) {}
  getRandomCodeSnippets = async (language: LanguageName): Promise<string[]> => {
    const snippetUrls = await this.snippetFetchService
      .fetchRandomCodeFiles(language)
      .catch((error) => {
        console.error('Error fetching random files:', error);
        return [];
      });

    const codeSnippets: string[] = await this.getSnippetsBatch(
      snippetUrls,
      language,
    );

    if (codeSnippets.length === 0)
      throw "Couldn't find any valid nodes in any of the fetched files";

    // Shuffle snippets before returning
    return codeSnippets.sort(() => 0.5 - Math.random());
  };

  async getSnippetsFromLink(
    link: string,
    language: LanguageName,
  ): Promise<string[]> {
    const fileContent = await this.snippetFetchService.getFileContent(link);

    const extractedSnippets = this.snippetProcessService.extractSnippets(
      fileContent,
      language,
    );

    let codeSnippets = extractedSnippets
      .map((snippet) => {
        const formattedSnippet = this.snippetProcessService.formatCode(snippet);

        // console.log("Raw snippet:", JSON.stringify(snippet));

        if (!formattedSnippet) return null;

        // console.log("Formatted snippet:", JSON.stringify(formattedSnippet));

        return formattedSnippet;
      })
      .filter((snippet) => snippet !== null);

    codeSnippets = this.snippetProcessService.filterSnippets(codeSnippets);

    return codeSnippets;
  }

  async getSnippetsBatch(
    snippetUrls: string[],
    language: LanguageName,
  ): Promise<string[]> {
    const codeSnippets: string[] = [];
    while (codeSnippets.length < MIN_CACHED_SNIPPETS) {
      if (snippetUrls.length === 0) break;

      // Gets N unquie random indexes. Number could be changed to increase concurrency
      const randomIndexes = getUniqueRandomIndexes(
        snippetUrls.length,
        SNIPPETS_SIMULTANEOUS_REQUESTS,
      );

      // Simultaneously get snippets different files
      const snippetPromises = randomIndexes.map((randomIndex) =>
        this.getSnippetsFromLink(snippetUrls[randomIndex], language),
      );
      const snippets = (await Promise.all(snippetPromises)).flat();

      codeSnippets.push(...snippets);

      // Removes already fetched files
      snippetUrls = snippetUrls.filter((_, i) => !randomIndexes.includes(i));
    }

    return codeSnippets;
  }
}
