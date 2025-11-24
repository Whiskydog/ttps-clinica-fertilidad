import { Controller, Get, Query } from '@nestjs/common';
import { Group2MedicalTermsService } from './group2-medical-terms.service';
import { Public } from '@common/decorators/public.decorator';
@Public()
@Controller('external/group2-medical-terms')
export class Group2MedicalTermsController {
  constructor(private readonly service: Group2MedicalTermsService) {}

  @Get('search')
  search(
    @Query('q') q: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.service.searchTerms(q, page, limit);
  }
}
