import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type SemenViabilityStatus = 'pending' | 'viable' | 'not_viable';

@Entity('semen_viability')
export class SemenViability {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  partnerDni: string; // DNI de la pareja que proporciona el semen

  @Column({
    type: 'enum',
    enum: ['pending', 'viable', 'not_viable'],
    enumName: 'semen_viability_status_enum',
    default: 'pending',
  })
  status: SemenViabilityStatus;

  @Column({ type: 'timestamp', nullable: true })
  validationDate: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  validatedBy: string | null; // ID o nombre del técnico que validó

  @Column({ type: 'text', nullable: true })
  studyReference: string | null; // Referencia al estudio médico que determinó la viabilidad

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}