import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as uWebSockets from 'uWebSockets.js';
import * as uwsProxy from 'uws-reverse-proxy';

import * as config from '../../conf';
import * as helpers from '../../helpers';

const { server: { forwardTo, port } } = config;
const { startUWS } = helpers;
const { UWSProxy, createHTTPConfig, createUWSConfig } = uwsProxy;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(forwardTo.port, forwardTo.host);

  const proxy = new UWSProxy(
      createUWSConfig(uWebSockets, { port }),
      createHTTPConfig(forwardTo)
  );
  proxy.start();

  startUWS(proxy.uws.server, port);
}
bootstrap();
