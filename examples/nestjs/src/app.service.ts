import { Injectable } from '@nestjs/common';

import * as config from '../../conf';

@Injectable()
export class AppService {
  getJson(): string {
      return JSON.stringify(config.data['/json']);
  }

  getConfig(): string{
      return JSON.stringify({ demo: 'NestJS' });
  }
}
