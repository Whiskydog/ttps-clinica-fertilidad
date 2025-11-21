import { Controller, Post, Body } from '@nestjs/common';
import { Group6ChatbotService } from './group6-chatbot.service';
import { Public } from '@common/decorators/public.decorator';
@Public()
@Controller('external/group6')
export class Group6ChatbotController {
  constructor(private readonly service: Group6ChatbotService) {}

  @Post('preguntar')
  preguntar(@Body() body) {
    return this.service.preguntar(body);
  }
}
