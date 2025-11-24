import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '@modules/audit/entities/audit-log.entity';

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
    userId: number,
  ) {
    await this.auditRepo.save({
      tableName: table,
      recordId: String(recordId),
      modifiedField: field,
      oldValue,
      newValue,
      modifiedByUser: { id: Number(userId) },
      modificationTimestamp: new Date(),
    });
  }

  async findByUserId(userId: number) {
    return this.auditRepo.find({
      where: { modifiedByUser: { id: userId } },
      relations: ['modifiedByUser'],
      order: { modificationTimestamp: 'DESC' as const },
    });
  }
}
