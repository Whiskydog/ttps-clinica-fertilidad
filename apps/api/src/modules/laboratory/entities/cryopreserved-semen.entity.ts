import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cryopreserved_semen')
export class CryopreservedSemen {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  patientDni: string; // DNI del paciente que dona

  @Column({ type: 'jsonb', nullable: true })
  phenotype: {
    height?: number;
    ethnicity?: string;
    eye_color?: string;
    hair_type?: string;
    complexion?: string;
    hair_color?: string;
  };

  @Column({ type: 'varchar', length: 50, nullable: true })
  cryoTank: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cryoRack: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cryoTube: string;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean; // Si está disponible para uso

  @Column({ type: 'timestamp', nullable: true })
  cryopreservationDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}