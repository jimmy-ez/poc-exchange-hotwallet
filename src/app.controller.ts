import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/hotwallet')
  getHotwallet(): any {
    try {
      return this.appService.getWallet();
    } catch (error) {
      throw new BadRequestException(`getWallet error : ${error}`);
    }
  }

  @Get('/transaction/:address')
  getTransaction(@Param('address') address: string): any {
    try {
      return this.appService.getTransaction(address);
    } catch (error) {
      throw new BadRequestException(`getWallet error : ${error}`);
    }
  }

  
}
