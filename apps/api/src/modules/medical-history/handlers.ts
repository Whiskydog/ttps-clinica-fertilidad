import { PartnerDataUpsertDto } from './dto';
import { MedicalHistoryService } from './services/medical-history.service';
import { User } from '@users/entities/user.entity';
import { parseBirthDate } from './utils';

/**
 * Handlers para operaciones del módulo medical-history
 */
export class MedicalHistoryHandlers {
  constructor(private readonly medicalHistoryService: MedicalHistoryService) {}

  /**
   * Maneja el upsert de pareja femenina (caso ROPA)
   */
  async handleFemalePartnerUpsert(dto: PartnerDataUpsertDto, user: User) {
    const gyneDto = {
      ...dto.gynecologicalHistory,
      partnerData: dto.partnerData,
    };

    const savedGyne =
      await this.medicalHistoryService.upsertGynecologicalHistory(
        dto.medicalHistoryId,
        gyneDto,
        user.id,
      );

    return {
      message:
        'Datos de la pareja y antecedentes ginecológicos guardados (ROPA)',
      gynecologicalHistoryId: savedGyne.id,
      partnerId: savedGyne.partnerData?.id ?? null,
    };
  }

  /**
   * Maneja el upsert de pareja estándar (no femenina)
   */
  async handleStandardPartnerUpsert(dto: PartnerDataUpsertDto, user: User) {
    const partnerDataToUpsert = {
      ...dto.partnerData,
      birthDate: parseBirthDate(dto.partnerData?.birthDate),
    };

    const saved = await this.medicalHistoryService.upsertPartnerData(
      dto.medicalHistoryId,
      partnerDataToUpsert,
      user.id,
    );

    return {
      message: 'Datos de la pareja guardados',
      id: saved.id,
    };
  }
}
