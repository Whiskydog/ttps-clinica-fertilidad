import { Injectable } from '@nestjs/common';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class MedicalHistoryAuditService {
  constructor(private readonly auditService: AuditService) {}

  async logFieldChange(
    tableName: string,
    recordId: number | string,
    fieldName: string,
    oldValue: any,
    newValue: any,
    doctorId: number,
  ): Promise<void> {
    if (oldValue !== newValue) {
      await this.auditService.log(
        tableName,
        recordId,
        fieldName,
        oldValue,
        newValue,
        doctorId,
      );
    }
  }

  async logCreation(
    tableName: string,
    recordId: number | string,
    doctorId: number,
  ): Promise<void> {
    await this.auditService.log(
      tableName,
      recordId,
      'creation',
      null,
      'created',
      doctorId,
    );
  }

  async logMultipleFieldChanges(
    tableName: string,
    recordId: number | string,
    fieldMap: Record<string, string>,
    entity: Record<string, any>,
    dto: Record<string, any>,
    doctorId: number,
  ): Promise<void> {
    for (const [dtoField, columnName] of Object.entries(fieldMap)) {
      if (dto[dtoField] !== undefined) {
        const oldValue = entity[dtoField];
        const newValue = dto[dtoField];
        await this.logFieldChange(
          tableName,
          recordId,
          columnName,
          oldValue,
          newValue,
          doctorId,
        );
      }
    }
  }

  async logAllNonNullFields(
    tableName: string,
    recordId: number | string,
    fieldMap: Record<string, string>,
    entity: Record<string, any>,
    doctorId: number,
  ): Promise<void> {
    for (const [entityField, columnName] of Object.entries(fieldMap)) {
      const value = entity[entityField];
      if (value != null) {
        await this.auditService.log(
          tableName,
          recordId,
          columnName,
          null,
          value,
          doctorId,
        );
      }
    }
  }
}
