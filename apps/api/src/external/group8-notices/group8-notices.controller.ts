import { Body, Controller, Post } from '@nestjs/common';
import { Group8NoticesService } from './group8-notices.service';
import type { SendAvisoEmailPayload } from './group8-notices.service';

@Controller('external/grupo8/avisos')
export class Group8NoticesController {
  constructor(private readonly group8NoticesService: Group8NoticesService) {}

  @Post('send-email')
  async sendEmail(@Body() body: SendAvisoEmailPayload) {
    const data = await this.group8NoticesService.sendEmail(body);
    return {
      statusCode: 200,
      message: 'Email enviado a través del módulo de avisos',
      data,
    };
  }
}
