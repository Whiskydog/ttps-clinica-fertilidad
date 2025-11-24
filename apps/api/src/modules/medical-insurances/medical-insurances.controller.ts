import { Controller, Get } from '@nestjs/common';
import { Public } from '@modules/auth/decorators/public.decorator';
import { EnvelopeMessage } from '@common/decorators/envelope-message.decorator';
import { MedicalInsurancesService } from './medical-insurances.service';

@Controller('medical-insurances')
export class MedicalInsurancesController {
  constructor(private readonly service: MedicalInsurancesService) {}

  @Public()
  @Get()
  @EnvelopeMessage('Obras sociales obtenidas exitosamente')
  async list() {
    return this.service.findAll();
  }
}
