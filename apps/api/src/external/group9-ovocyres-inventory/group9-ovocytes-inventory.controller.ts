import { Body, Controller, Post } from '@nestjs/common';
import type {
  AssignOvocytePayload,
  DeallocateOvocytePayload,
  GetOvocytePositionPayload,
} from './group9-ovocytes-inventory.service';
import { OvocytesInventoryApiService } from './group9-ovocytes-inventory.service';

@Controller('external/grupo9/ovocytes')
export class OvocytesInventoryApiController {
  constructor(
    private readonly ovocytesInventoryApiService: OvocytesInventoryApiService,
  ) {}

  /**
   * POST /v1/api/external/grupo9/ovocytes/assign
   * Asigna un ovocito a la primera posición libre
   */
  @Post('assign')
  async assign(@Body() body: AssignOvocytePayload) {
    const data = await this.ovocytesInventoryApiService.assignOvocyte(body);
    return {
      statusCode: 200,
      message: 'Ovocito asignado correctamente (grupo 9)',
      data,
    };
  }

  /**
   * POST /v1/api/external/grupo9/ovocytes/deallocate
   * Libera una posición específica
   */
  @Post('deallocate')
  async deallocate(@Body() body: DeallocateOvocytePayload) {
    const data = await this.ovocytesInventoryApiService.deallocateOvocyte(body);
    return {
      statusCode: 200,
      message: 'Ovocito liberado correctamente (grupo 9)',
      data,
    };
  }

  /**
   * POST /v1/api/external/grupo9/ovocytes/position
   * Consulta la posición actual de un ovocito
   */
  @Post('position')
  async getPosition(@Body() body: GetOvocytePositionPayload) {
    const data =
      await this.ovocytesInventoryApiService.getOvocytePosition(body);
    return {
      statusCode: 200,
      message: 'Posición del ovocito obtenida (grupo 9)',
      data,
    };
  }
}
