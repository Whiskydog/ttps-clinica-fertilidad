import { z } from "zod";

export const ConfirmAppointmentSchema = z.object({
  id_paciente: z.number().int().positive(),
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
