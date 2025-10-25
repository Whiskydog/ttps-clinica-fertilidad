import { BaseEntity } from '@common/entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity('audit_logs')
export class AuditLog extends BaseEntity {
  @Column({ name: 'table_name' })
  tableName: string;

  @Column({ type: 'text', name: 'record_id' })
  recordId: string;

  @Column({ name: 'modified_field' })
  modifiedField: string;

  @Column({ type: 'text', nullable: true, name: 'old_value' })
  oldValue: string;

  @Column({ type: 'text', nullable: true, name: 'new_value' })
  newValue: string;

  @Column({ type: 'bigint', nullable: true, name: 'modified_by_user_id' })
  modifiedByUserId: number | null;

  @Column({ name: 'user_role' })
  userRole: string;

  @Column({ type: 'timestamp', name: 'modification_timestamp' })
  modificationTimestamp: Date;
}
