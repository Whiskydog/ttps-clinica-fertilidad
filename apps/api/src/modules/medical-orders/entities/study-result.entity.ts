import { BaseEntity } from '@common/entities/base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MedicalOrder } from './medical-order.entity';
import { LabTechnician } from '@users/entities/lab-technician.entity';

@Entity('study_results')
export class StudyResult extends BaseEntity {
  @ManyToOne(() => MedicalOrder, { nullable: false })
  @JoinColumn({ name: 'medical_order_id', referencedColumnName: 'id' })
  medicalOrder: MedicalOrder;

  @Column({ name: 'study_name', type: 'varchar', length: 255, nullable: true })
  studyName?: string | null;

  @Column({
    name: 'determination_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  determinationName?: string | null; // FSH, LH, Estradiol, etc.

  @Column({ name: 'transcription', type: 'text', nullable: true })
  transcription?: string | null;

  @Column({ name: 'original_pdf_uri', type: 'text', nullable: true })
  originalPdfUri?: string | null;

  @ManyToOne(() => LabTechnician, { nullable: true })
  @JoinColumn({
    name: 'transcribed_by_lab_technician_id',
    referencedColumnName: 'id',
  })
  transcribedByLabTechnician?: LabTechnician | null;

  @Column({ name: 'transcription_date', type: 'timestamp', nullable: true })
  transcriptionDate?: Date | null;
}
