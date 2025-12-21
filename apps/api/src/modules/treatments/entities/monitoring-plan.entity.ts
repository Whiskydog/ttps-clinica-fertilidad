import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Treatment } from './treatment.entity';
import { Appointment } from '@modules/appointments/appointment.entity';

export enum MonitoringPlanStatus {
  PLANNED = 'PLANNED', // creado por médico
  RESERVED = 'RESERVED', // tiene appointment asignado
  COMPLETED = 'COMPLETED', // monitoreo registrado
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
    default: MonitoringPlanStatus.RESERVED,
  })
  status: MonitoringPlanStatus;

  // Turno reservado por el paciente (cuando exista)
  @OneToOne(() => Appointment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'appointment_id' })
  appointment?: Appointment | null;

  // Orden dentro del esquema (1°, 2°, 3° monitoreo)
  @Column({ name: 'sequence', type: 'int' })
  sequence: number;
}
