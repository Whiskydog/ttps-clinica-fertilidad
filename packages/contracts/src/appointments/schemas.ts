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
  fecha_hora: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/
    ),
});

export type TurnoRaw = z.infer<typeof TurnoSchema>;

export type AppointmentDetail = {
  id: number;
  doctorId: number;
  patientId: number | null;
  dateTime: string;
}

export const ReservaSchema = z.object({
  message: z.string(),
  turno: TurnoSchema,
});

export const ReservaResponseSchema = z
  .object({
    reserva: ReservaSchema,
  })
  .transform((data) => data.reserva);
