import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
} from '@nestjs/common';
import { Group3TurneroService } from './group3-turnero.service';
import { Public } from '@common/decorators/public.decorator';
@Public()
@Controller('external/group3-turnero')
export class Group3TurneroController {
  constructor(private readonly service: Group3TurneroService) {}

  @Post('crear-turnos')
  crearTurnos(@Body() body) {
    return this.service.crearTurnos(body);
  }

  @Get('turnos-medico')
  turnosMedico(@Query('id_medico') id: number) {
    return this.service.turnosMedico(Number(id));
  }

  @Patch('reservar')
  reservar(@Body() body) {
    return this.service.reservarTurno(body);
  }

  @Patch('cancelar')
  cancelar(@Query('id_turno') turno: number) {
    return this.service.cancelarTurno(Number(turno));
  }

  @Get('turnos-paciente')
  turnosPaciente(@Query('id_paciente') id: number) {
    return this.service.turnosPaciente(Number(id));
  }

  @Get('medico-fecha')
  medicoFecha(@Query('id_medico') m: number, @Query('fecha') fecha: string) {
    return this.service.turnosPorFecha(Number(m), fecha);
  }

  @Delete('borrar-todos')
  borrar() {
    return this.service.borrarTurnos();
  }
}
