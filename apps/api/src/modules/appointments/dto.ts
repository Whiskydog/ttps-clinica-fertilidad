import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  AppointmentDetail,
  ConfirmAppointmentSchema,
  PostTurnosSchema,
  TurnoRaw,
} from '@repo/contracts';

export class ConfirmAppointmentDto extends createZodDto(
  ConfirmAppointmentSchema,
) {}

export class PostTurnosDto extends createZodDto(PostTurnosSchema) {}

// Local helper types inferred from schemas (to aid TS types in controllers/services)
export type ConfirmAppointmentDtoType = z.infer<
  typeof ConfirmAppointmentSchema
>;
export type PostTurnosDtoType = z.infer<typeof PostTurnosSchema>;

export function mapRawAppointments(
  appointments: TurnoRaw[],
): AppointmentDetail[] {
  return appointments.map((appointment) => ({
    id: appointment.id,
    doctorId: appointment.id_medico,
    patientId: appointment.id_paciente,
    dateTime: appointment.fecha_hora,
  }));
}
