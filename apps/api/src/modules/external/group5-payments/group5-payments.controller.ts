import { Controller, Get, Post, Body } from '@nestjs/common';
import { Group5PaymentsService } from './group5-payments.service';
import { Public } from '@common/decorators/public.decorator';
@Public()
@Controller('external/group5')
export class Group5PaymentsController {
  constructor(private readonly service: Group5PaymentsService) {}

  @Get('obras-sociales')
  obras() {
    return this.service.getObrasSociales();
  }

  @Post('deuda-paciente')
  deudaPaciente(@Body() b) {
    return this.service.deudaPaciente(b.id_paciente, b.numero_grupo);
  }

  @Post('deuda-obra')
  deudaObra(@Body() b) {
    return this.service.deudaObra(b.id_obra, b.numero_grupo);
  }

  @Post('total-cobrado-obra')
  totalObra(@Body() b) {
    return this.service.totalCobradoObra(b.id_obra, b.numero_grupo);
  }

  @Post('total-cobrado-paciente')
  totalPaciente(@Body() b) {
    return this.service.totalCobradoPaciente(b.id_paciente, b.numero_grupo);
  }

  @Post('registrar-orden-pago')
  registrarOrden(@Body() b) {
    return this.service.registrarOrdenPago(b);
  }

  @Post('registrar-pago')
  registrarPago(@Body() b) {
    return this.service.registrarPago(b);
  }
}
