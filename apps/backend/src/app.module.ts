import { Module } from '@nestjs/common';
import { SnippetsModule } from '@/modules/snippets/snippets.module';
import { HttpModule } from '@nestjs/axios';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
@Module({
  imports: [
    SnippetsModule,
    HttpModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../', 'frontend'),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
