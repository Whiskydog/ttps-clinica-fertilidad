import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  table_name: string;

  @Column()
  record_id: number;

  @Column()
  modified_field: string;

  @Column({ type: 'text', nullable: true })
  old_value: string;

  @Column({ type: 'text', nullable: true })
  new_value: string;

  @Column({ type: 'uuid', nullable: true })
  modified_by_user_id: string | null;

  @Column()
  user_role: string;

  @Column({ type: 'timestamp' })
  modification_timestamp: Date;
}
