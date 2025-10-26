import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '@modules/users/entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(
    table: string,
    recordId: string | number,
    field: string,
    oldValue: any,
    newValue: any,
    userId: string | null,
    userRole: string,
  ) {
    await this.auditRepo.save({
      tableName: table,
      recordId: String(recordId),
      modifiedField: field,
      oldValue,
      newValue,
      modifiedByUserId: userId,
      userRole,
      modificationTimestamp: new Date(),
    });
  }
}
