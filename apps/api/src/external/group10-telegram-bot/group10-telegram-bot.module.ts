import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TelegramBotApiService } from './group10-telegram-bot.service';
import { TelegramBotApiController } from './group10-telegram-bot.controller';

@Module({
  imports: [HttpModule],
  providers: [TelegramBotApiService],
  controllers: [TelegramBotApiController],
  exports: [TelegramBotApiService],
})
export class TelegramBotApiModule {}
