import { Body, Controller, Post } from '@nestjs/common';
import type {
  AssignOvocytePayload,
  DeallocateOvocytePayload,
  GetOvocytePositionPayload,
} from './group9-ovocytes-inventory.service';
import { Group9OvocytesInventoryService } from './group9-ovocytes-inventory.service';

@Controller('external/grupo9/ovocytes')
export class Group9OvocytesInventoryController {
  constructor(
    private readonly group9OvocytesInventoryService: Group9OvocytesInventoryService,
  ) {}

  /**
   * POST /v1/api/external/grupo9/ovocytes/assign
   * Asigna un ovocito a la primera posición libre
   */
  @Post('assign')
  async assign(@Body() body: Omit<AssignOvocytePayload, 'nro_grupo'>) {
    const data = await this.group9OvocytesInventoryService.assignOvocyte(body);
    return {
      statusCode: 200,
      message: 'Ovocito asignado correctamente ',
      data,
    };
  }

  /**
   * POST /v1/api/external/grupo9/ovocytes/deallocate
   * Libera una posición específica
   */
  @Post('deallocate')
  async deallocate(
    @Body()
    body: Omit<DeallocateOvocytePayload, 'nro_grupo'>,
  ) {
    const data =
      await this.group9OvocytesInventoryService.deallocateOvocyte(body);
    return {
      statusCode: 200,
      message: 'Ovocito liberado correctamente',
      data,
    };
  }

  /**
   * POST /v1/api/external/grupo9/ovocytes/position
   * Consulta la posición actual de un ovocito
   */
  @Post('position')
  async getPosition(
    @Body()
    body: Omit<GetOvocytePositionPayload, 'nro_grupo'>,
  ) {
    const data =
      await this.group9OvocytesInventoryService.getOvocytePosition(body);
    return {
      statusCode: 200,
      message: 'Posición del ovocito obtenida correctamente',
      data,
    };
  }
}
