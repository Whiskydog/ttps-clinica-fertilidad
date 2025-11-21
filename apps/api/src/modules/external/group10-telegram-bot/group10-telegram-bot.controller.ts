import { Body, Controller, Post } from '@nestjs/common';
import { Group10TelegramBotService } from './group10-telegram-bot.service';
import type { TelegramBotSendPayload } from './group10-telegram-bot.service';

@Controller('external/grupo10/telegram')
export class Group10TelegramBotController {
  constructor(
    private readonly group10TelegramBotService: Group10TelegramBotService,
  ) {}

  /**
   * POST /v1/api/external/grupo10/telegram/send
   * Envía un mensaje de alerta al grupo de Telegram del módulo externo
   */
  @Post('send')
  async send(@Body() body: TelegramBotSendPayload) {
    const data = await this.group10TelegramBotService.sendAlert(body);
    return {
      statusCode: 200,
      message: 'Mensaje enviado al Bot de Telegram (grupo 10)',
      data,
    };
  }
}
