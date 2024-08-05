import { Module } from '@nestjs/common';
import { SnippetsService } from './snippets.service';
import { SnippetsController } from './snippets.controller';
import { SnippetFetchService } from './services/snippet-fetch.service';
import { SnippetParseService } from './services/snippet-parser.service';
import { SnippetProcessService } from './services/snippet-process.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [
    SnippetsService,
    SnippetFetchService,
    SnippetParseService,
    SnippetProcessService,
  ],
  controllers: [SnippetsController],
})
export class SnippetsModule {}
