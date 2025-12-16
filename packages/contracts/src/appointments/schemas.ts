import { z } from "zod";
import { ReasonForVisit } from "./enums";
import { ApiResponseSchema } from "../common/api";

export const BookAppointmentSchema = z.object({
  doctorId: z.number().int().positive(),
  reason: z.enum(ReasonForVisit),
  appointment: z.object({
    id: z.number().int().positive(),
    dateTime: z.iso.datetime({ offset: true }).optional(),
  }),
});

export const AppointmentEntitySchema = z.object({
  id: z.number(),
  externalId: z.number(),
  doctor: z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    specialty: z.string(),
    licenseNumber: z.string(),
  }),
  date: z.date().transform((date) => date.toISOString()),
  reason: z.enum(ReasonForVisit),
});

export const AppointmentResponseSchema = ApiResponseSchema(AppointmentEntitySchema);
export const AppointmentsResponseSchema = ApiResponseSchema(AppointmentEntitySchema.array());

export type Appointment = z.infer<typeof AppointmentEntitySchema>;

export type AppointmentResponse = z.infer<typeof AppointmentResponseSchema>;
export type AppointmentsResponse = z.infer<typeof AppointmentsResponseSchema>;

export const PostTurnosSchema = z.object({
  id_medico: z.number().int().positive(),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM
  hora_fin: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM
  dia_semana: z.number().int().min(0).max(6),
});

export type BookAppointment = z.infer<typeof BookAppointmentSchema>;
export type PostTurnos = z.infer<typeof PostTurnosSchema>;

export const TurnoSchema = z.object({
  id: z.number(),
  id_grupo: z.number(),
  id_medico: z.number(),
  id_paciente: z.number(),
  fecha_hora: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/
    ),
});

export type TurnoRaw = z.infer<typeof TurnoSchema>;

export type ExternalAppointmentsResponse = {
  data: TurnoRaw[];
};

export type AppointmentDetail = {
  id: number;
  doctorId: number;
  patientId: number | null;
  dateTime: string;
};

export const ExternalBookingResponseSchema = z.object({
  message: z.string(),
  turno: TurnoSchema,
});

export type ExternalBookingResponse = z.infer<typeof ExternalBookingResponseSchema>;