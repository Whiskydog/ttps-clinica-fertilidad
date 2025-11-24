import { BaseEntity } from '@common/entities/base.entity';
import { Entity, Column, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { Treatment } from './treatment.entity';
import { User } from '@users/entities/user.entity';

@Entity('informed_consent')
export class InformedConsent extends BaseEntity {
  @OneToOne(() => Treatment, (treatment) => treatment.informedConsent, { nullable: false })
  @JoinColumn({ name: 'treatment_id', referencedColumnName: 'id' })
  treatment: Treatment;

  @Column({ name: 'pdf_uri', type: 'text', nullable: true })
  pdfUri?: string | null;

  @Column({ name: 'signature_date', type: 'date', nullable: true })
  signatureDate?: Date | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'uploaded_by_user_id', referencedColumnName: 'id' })
  uploadedByUser?: User | null;
}
