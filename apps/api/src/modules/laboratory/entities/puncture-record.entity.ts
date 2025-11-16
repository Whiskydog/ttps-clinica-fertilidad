import { BaseEntity } from '@common/entities/base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Treatment } from '@modules/treatments/entities/treatment.entity';
import { LabTechnician } from '@users/entities/lab-technician.entity';

@Entity('puncture_records')
export class PunctureRecord extends BaseEntity {
  @ManyToOne(() => Treatment, { nullable: false })
  @JoinColumn({ name: 'treatment_id', referencedColumnName: 'id' })
  treatment: Treatment;

  @Column({ name: 'puncture_date_time', type: 'timestamp', nullable: true })
  punctureDateTime?: Date | null;

  @Column({ name: 'operating_room_number', type: 'bigint', nullable: true })
  operatingRoomNumber?: number | null;

  @Column({ name: 'observations', type: 'text', nullable: true })
  observations?: string | null;

  @ManyToOne(() => LabTechnician, { nullable: true })
  @JoinColumn({ name: 'lab_technician_id', referencedColumnName: 'id' })
  labTechnician?: LabTechnician | null;
}
