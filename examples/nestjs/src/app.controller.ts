import {Controller, Get, Header, Redirect} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/json')
  @Header('content-type', 'application/json')
  getJson(): string{
      return this.appService.getJson();
  }

  @Get('/config')
  @Header('content-type', 'application/json')
  getConfig(): string{
      return this.appService.getConfig();
  }

    @Get('/redirect')
    @Redirect('/foo', 307)
    redirect(): void{
    }
}
