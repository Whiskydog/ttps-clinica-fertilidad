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
    recordId: number,
    field: string,
    oldValue: any,
    newValue: any,
    userId: string | null,
    userRole: string,
  ) {
    await this.auditRepo.save({
      table_name: table,
      record_id: recordId,
      modified_field: field,
      old_value: oldValue,
      new_value: newValue,
      modified_by_user_id: userId,
      user_role: userRole,
      modification_timestamp: new Date(),
    });
  }
}
