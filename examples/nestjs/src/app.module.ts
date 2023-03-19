import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ServeStaticModule } from '@nestjs/serve-static';

import * as config from '../../conf';

@Module({
  imports: [
      ServeStaticModule.forRoot({
          rootPath: config.directories.public,
          serveRoot: '/',
          serveStaticOptions: {
              extensions: [ 'html' ]
          }
      })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
