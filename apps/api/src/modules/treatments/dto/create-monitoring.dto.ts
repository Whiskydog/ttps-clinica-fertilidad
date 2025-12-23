import { createZodDto } from 'nestjs-zod';
import { CreateMonitoringSchema } from '@repo/contracts';

export class CreateMonitoringDto extends createZodDto(CreateMonitoringSchema) {}
