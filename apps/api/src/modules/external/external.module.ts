import { Module } from '@nestjs/common';

import { Group1StudiesModule } from './group1-studies/group1-studies.module';
import { Group2MedicalTermsModule } from './group2-medical-terms/group2-medical-terms.module';
import { Group3TurneroModule } from './group3-turnero/group3-turnero.module';
import { Group4SemenCryoModule } from './group4-semen-cryo/group4-semen-cryo.module';
import { Group5PaymentsModule } from './group5-payments/group5-payments.module';
import { Group6ChatbotModule } from './group6-chatbot/group6-chatbot.module';
import { Group7GameteBankModule } from './group7-gamete-bank/group7-gamete-bank.module';
import { Group8NoticesModule } from './group8-notices/group8-notices.module';
import { Group9OvocytesInventoryModule } from './group9-ovocytes-inventory/group9-ovocytes-inventory.module';
import { Group10TelegramBotModule } from './group10-telegram-bot/group10-telegram-bot.module';

@Module({
  imports: [
    Group1StudiesModule,
    Group2MedicalTermsModule,
    Group3TurneroModule,
    Group4SemenCryoModule,
    Group5PaymentsModule,
    Group6ChatbotModule,
    Group7GameteBankModule,
    Group8NoticesModule,
    Group9OvocytesInventoryModule,
    Group10TelegramBotModule,
  ],
})
export class ExternalModule {}
