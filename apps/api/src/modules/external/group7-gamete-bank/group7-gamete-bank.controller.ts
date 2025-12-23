import { Controller, Post, Get, Delete, Body, Query } from '@nestjs/common';
import { Group7GameteBankService } from './group7-gamete-bank.service';
import { Public } from '@common/decorators/public.decorator';
@Public()
@Controller('external/group7/gamete-bank')
export class Group7GameteBankController {
  constructor(private readonly service: Group7GameteBankService) {}
  // 1. Crear tanque
  @Post('create-tank')
  createTank(
    @Body() body: { type: 'esperma' | 'ovocito'; rack_count: number },
  ) {
    return this.service.createTank(body);
  }

  // 2. Donar gameto
  @Post('donate')
  donate(
    @Body()
    body: {
      type: 'esperma' | 'ovocito';
      phenotype: Record<string, any>;
    },
  ) {
    return this.service.donateGamete(body);
  }

  // 3. Buscar gameto compatible
  @Post('find-compatible')
  findCompatible(
    @Body()
    body: {
      type: 'esperma' | 'ovocito';
      phenotype: Record<string, any>;
    },
  ) {
    return this.service.findCompatibleGamete(body);
  }

  // 4. Consultar almacenamiento
  @Get('storage')
  getStorage(
    @Query('page') page?: number,
    @Query('page_size') page_size?: number,
    @Query('type') type?: string,
  ) {
    return this.service.getStorage({
      page: page ? Number(page) : undefined,
      page_size: page_size ? Number(page_size) : undefined,
      type: type as 'esperma' | 'ovocito',
    });
  }

  // 5. Limpiar datos de grupo
  @Delete('clear')
  clearGroup() {
    return this.service.clearGroup();
  }

  // 6. Obtener enums fenotípicos
  @Get('enums')
  getEnums() {
    return this.service.getEnums();
  }
}
