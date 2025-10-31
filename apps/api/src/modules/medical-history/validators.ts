import { BadRequestException } from '@nestjs/common';
import { PartnerDataUpsertDto } from './dto';
import { hasAnyGynecologicalField } from './utils';

/**
 * Validadores para el módulo medical-history
 */
export class MedicalHistoryValidators {
  /**
   * Valida que una pareja femenina incluya datos ginecológicos válidos
   */
  static validateFemalePartnerData(dto: PartnerDataUpsertDto): void {
    if (!dto.gynecologicalHistory) {
      throw new BadRequestException(
        'Si la pareja es femenina, debe incluir antecedentes ginecológicos',
      );
    }

    if (
      !hasAnyGynecologicalField(
        dto.gynecologicalHistory as Record<string, unknown>,
      )
    ) {
      throw new BadRequestException(
        'Los antecedentes ginecológicos están vacíos. Ingrese al menos un campo válido.',
      );
    }
  }
}
