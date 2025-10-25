import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const PostTurnosSchema = z.object({
  id_medico: z.number().int().positive(),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM
  hora_fin: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM
  dia_semana: z.number().int().min(0).max(6),
});

export class PostTurnosDto extends createZodDto(PostTurnosSchema) {}
export type PostTurnos = z.infer<typeof PostTurnosSchema>;
