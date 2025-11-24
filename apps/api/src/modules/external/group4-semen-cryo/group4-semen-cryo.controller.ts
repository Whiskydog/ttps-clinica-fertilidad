import { Controller, Post, Body } from '@nestjs/common';
import { Group4SemenCryoService } from './group4-semen-cryo.service';
import { Public } from '@common/decorators/public.decorator';
@Public()
@Controller('external/group4-semen-cryo')
export class Group4SemenCryoController {
  constructor(private readonly service: Group4SemenCryoService) {}

  @Post('crear-tanque')
  crearTanque(@Body() body) {
    return this.service.crearTanque(body);
  }

  @Post('congelar')
  congelar(@Body() body) {
    return this.service.congelar(body);
  }

  @Post('descongelar')
  descongelar(@Body() body) {
    return this.service.descongelar(body);
  }

  @Post('dni-tiene-muestra')
  check(@Body() body) {
    return this.service.dniTieneMuestra(body);
  }
}
