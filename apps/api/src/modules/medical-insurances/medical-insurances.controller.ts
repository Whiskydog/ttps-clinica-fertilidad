import { Controller, Get } from '@nestjs/common';
import { ZodSerializerDto, createZodDto } from 'nestjs-zod';
import { MedicalInsurancesService } from './medical-insurances.service';
import { MedicalInsuranceSchema } from '@repo/contracts';

class MedicalInsuranceDto extends createZodDto(MedicalInsuranceSchema) {}

@Controller('medical-insurances')
export class MedicalInsurancesController {
  constructor(private readonly service: MedicalInsurancesService) {}

  @Get()
  @ZodSerializerDto([MedicalInsuranceDto])
  async list() {
    return this.service.findAll();
  }
}
