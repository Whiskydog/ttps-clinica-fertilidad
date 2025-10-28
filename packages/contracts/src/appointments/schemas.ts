import { z } from "zod";

export const ConfirmAppointmentSchema = z.object({
  id_turno: z.number().int().positive(),
});

export const PostTurnosSchema = z.object({
  id_medico: z.number().int().positive(),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM
  hora_fin: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM
  dia_semana: z.number().int().min(0).max(6),
});

export type ConfirmAppointment = z.infer<typeof ConfirmAppointmentSchema>;
export type PostTurnos = z.infer<typeof PostTurnosSchema>;

export const TurnoSchema = z.object({
  id: z.number(),
  id_grupo: z.number(),
  id_medico: z.number(),
  id_paciente: z.number(),
  fecha_hora: z.preprocess((val) => new Date(val as string), z.date()),
});

export const ReservaSchema = z.object({
  message: z.string(),
  turno: TurnoSchema,
});

export const ReservaResponseSchema = z
  .object({
    reserva: ReservaSchema,
  })
  .transform((data) => data.reserva);
