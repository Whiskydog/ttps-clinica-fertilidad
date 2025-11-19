import { Body, Controller, Post } from '@nestjs/common';
import type {
  TelegramBotApiService,
  TelegramBotSendPayload,
} from './group10-telegram-bot.service';

@Controller('external/grupo10/telegram')
export class TelegramBotApiController {
  constructor(private readonly telegramBotApiService: TelegramBotApiService) {}

  /**
   * POST /v1/api/external/grupo10/telegram/send
   * Envía un mensaje de alerta al grupo de Telegram del módulo externo
   */
  @Post('send')
  async send(@Body() body: TelegramBotSendPayload) {
    const data = await this.telegramBotApiService.sendAlert(body);
    return {
      statusCode: 200,
      message: 'Mensaje enviado al Bot de Telegram (grupo 10)',
      data,
    };
  }
}
