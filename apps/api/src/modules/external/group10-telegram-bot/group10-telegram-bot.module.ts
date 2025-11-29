import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { Group10TelegramBotService } from './group10-telegram-bot.service';
import { Group10TelegramBotController } from './group10-telegram-bot.controller';

@Module({
  imports: [HttpModule],
  providers: [Group10TelegramBotService],
  controllers: [Group10TelegramBotController],
  exports: [Group10TelegramBotService],
})
export class Group10TelegramBotModule {}
