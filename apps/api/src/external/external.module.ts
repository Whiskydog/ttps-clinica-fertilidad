import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { Group1StudiesService } from './group1-studies/group1-studies.service';
import { Group2MedicalTermsService } from './group2-medical-terms/group2-medical-terms.service';
import { Group3TurneroService } from './group3-turnero/group3-turnero.service';
import { Group4SemenCryoService } from './group4-semen-cryo/group4-semen-cryo.service';
import { Group5PaymentsService } from './group5-payments/group5-payments.service';
import { Group6ChatbotService } from './group6-chatbot/group6-chatbot.service';
import { Group7GametBankService } from './group7-gamet-bank/group7-gamet-bank.service';
import { Group8NoticesService } from './group8-notices/group8-notices.service';
import { Group9OvocytesInventoryService } from './group9-ovocytes-inventory/group9-ovocytes-inventory.service';
import { Group10TelegramBotService } from './group10-telegram-bot/group10-telegram-bot.service';

@Module({
  imports: [HttpModule],
  providers: [
    Group1StudiesService,
    Group2MedicalTermsService,
    Group3TurneroService,
    Group4SemenCryoService,
    Group5PaymentsService,
    Group6ChatbotService,
    Group7GametBankService,
    Group8NoticesService,
    Group9OvocytesInventoryService,
    Group10TelegramBotService,
  ],
  exports: [
    Group1StudiesService,
    Group2MedicalTermsService,
    Group3TurneroService,
    Group4SemenCryoService,
    Group5PaymentsService,
    Group6ChatbotService,
    Group7GametBankService,
    Group8NoticesService,
    Group9OvocytesInventoryService,
    Group10TelegramBotService,
  ],
})
export class ExternalModule {}
