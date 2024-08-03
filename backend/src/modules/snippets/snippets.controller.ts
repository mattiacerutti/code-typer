import { Controller, Get } from '@nestjs/common';
import { SnippetsService } from './snippets.service';
import { QueryRequired } from '@/common/decorators/query-required.decorator';
import { LanguageName } from '@/types/CodeLanguage';

@Controller('snippets')
export class SnippetsController {
  constructor(private readonly snippetsService: SnippetsService) {}

  @Get('random')
  @Get('random')
  getRandomSnippets(
    @QueryRequired({
      param: 'language',
      allowedValues: Object.values(LanguageName),
    })
    language: string,
  ) {
    return this.snippetsService.getRandomCodeSnippets(language as LanguageName);
  }
}
