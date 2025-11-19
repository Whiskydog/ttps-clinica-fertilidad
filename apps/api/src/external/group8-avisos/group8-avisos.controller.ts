import { Body, Controller, Post } from '@nestjs/common';
import { AvisosApiService } from './group8-avisos.service';
import type { SendAvisoEmailPayload } from './group8-avisos.service';

@Controller('external/grupo8/avisos')
export class AvisosApiController {
  constructor(private readonly avisosApiService: AvisosApiService) {}

  @Post('send-email')
  async sendEmail(@Body() body: SendAvisoEmailPayload) {
    const data = await this.avisosApiService.sendEmail(body);
    return {
      statusCode: 200,
      message: 'Email enviado a través del módulo de avisos',
      data,
    };
  }
}
