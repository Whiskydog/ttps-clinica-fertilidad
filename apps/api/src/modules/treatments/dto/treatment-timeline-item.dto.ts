export type TreatmentTimelineType =
  | 'treatment'
  | 'monitoring'
  | 'monitoring_plan'
  | 'doctor_note'
  | 'medication_protocol'
  | 'milestone'
  | 'medical_order'
  | 'puncture';

export interface TreatmentTimelineItemDto {
  date: Date;
  type: TreatmentTimelineType;
  label: string;
  description?: string;
  entityId?: number;
}
