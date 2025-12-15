import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Treatment } from './treatment.entity';

export enum MonitoringPlanStatus {
  PENDING = 'PENDING', // creado por el médico, sin turno
  RESERVED = 'RESERVED', // el paciente reservó turno
  COMPLETED = 'COMPLETED', // monitoreo ya registrado
  CANCELLED = 'CANCELLED',
}

@Entity('treatment_monitoring_plans')
export class MonitoringPlan extends BaseEntity {
  @Column({ name: 'treatment_id' })
  treatmentId: number;

  @ManyToOne(() => Treatment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'treatment_id' })
  treatment: Treatment;

  // Día estimado del ciclo (ej: día 5, 8, 11)
  @Column({ name: 'planned_day', type: 'int', nullable: true })
  plannedDay?: number | null;

  // Rango permitido para el turno
  @Column({ name: 'min_date', type: 'date' })
  minDate: Date;

  @Column({ name: 'max_date', type: 'date' })
  maxDate: Date;

  // Estado del plan
  @Column({
    type: 'enum',
    enum: MonitoringPlanStatus,
    default: MonitoringPlanStatus.PENDING,
  })
  status: MonitoringPlanStatus;

  // Turno reservado por el paciente (cuando exista)
  @Column({ name: 'appointment_id', type: 'int', nullable: true })
  appointmentId?: number | null;

  // Orden dentro del esquema (1°, 2°, 3° monitoreo)
  @Column({ name: 'sequence', type: 'int' })
  sequence: number;
}
