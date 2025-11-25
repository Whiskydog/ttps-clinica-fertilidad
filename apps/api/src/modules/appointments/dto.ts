import {
  AppointmentDetail,
  BookAppointmentSchema,
  PostTurnosSchema,
  TurnoRaw,
} from '@repo/contracts';
import { createZodDto } from 'nestjs-zod';

export class BookAppointmentDto extends createZodDto(BookAppointmentSchema) {}

export class PostTurnosDto extends createZodDto(PostTurnosSchema) {}

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
