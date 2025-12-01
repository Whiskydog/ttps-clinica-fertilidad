import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Group1StudiesService } from './group1-studies.service';
import { Public } from '@common/decorators/public.decorator';
@Public()
@Controller('external/group1-studies')
export class Group1StudiesController {
  constructor(private readonly service: Group1StudiesService) {}

  @Post('generar-orden')
  @UseInterceptors(FileInterceptor('firma_medico'))
  generarOrden(
    @Body('payload') payload: string,
    @UploadedFile() firma: Express.Multer.File,
  ) {
    return this.service.generarOrdenMedica(JSON.parse(payload), firma);
  }

  @Get('semen')
  getSemen() {
    return this.service.getSemenStudies();
  }

  @Get('hormonales')
  getHormonales() {
    return this.service.getHormonalStudies();
  }

  @Get('ginecologicos')
  getGinecologicos() {
    return this.service.getGynecologicalStudies();
  }

  @Get('prequirurgicos')
  getPreQx() {
    return this.service.getPreSurgicalOrder();
  }
}
