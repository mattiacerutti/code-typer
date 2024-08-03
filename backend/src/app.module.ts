import { Module } from '@nestjs/common';
import { SnippetsModule } from '@/modules/snippets/snippets.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [SnippetsModule, HttpModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
