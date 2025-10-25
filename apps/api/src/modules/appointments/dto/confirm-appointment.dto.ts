import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ConfirmAppointmentSchema = z.object({
  id_paciente: z.number().int().positive(),
  id_turno: z.number().int().positive(),
});

export class ConfirmAppointmentDto extends createZodDto(
  ConfirmAppointmentSchema,
) {}
