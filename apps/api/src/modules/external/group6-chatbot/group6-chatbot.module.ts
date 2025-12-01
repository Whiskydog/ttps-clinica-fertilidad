import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { Group6ChatbotService } from './group6-chatbot.service';
import { Group6ChatbotController } from './group6-chatbot.controller';

@Module({
  imports: [HttpModule],
  providers: [Group6ChatbotService],
  controllers: [Group6ChatbotController],
  exports: [Group6ChatbotService],
})
export class Group6ChatbotModule {}
