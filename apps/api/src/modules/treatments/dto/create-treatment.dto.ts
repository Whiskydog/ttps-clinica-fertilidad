import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const InitialObjectiveEnum = z.enum([
  'gametos_propios',
  'couple_female',
  'method_ropa',
  'woman_single',
  'preservation_ovocytes_embryos',
]);

const TreatmentStatusEnum = z.enum(['vigente', 'closed', 'completed']);

export const CreateTreatmentSchema = z
  .object({
    initial_objective: InitialObjectiveEnum,
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    initial_doctor_id: z.string().uuid().optional(),
    status: TreatmentStatusEnum.default('vigente'),
    closure_reason: z.string().max(255).optional(),
    closure_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  })
  .refine((d) => d.status !== 'closed' || !!d.closure_reason, {
    message: 'closure_reason es obligatorio si status = closed',
    path: ['closure_reason'],
  });

export class CreateTreatmentDto extends createZodDto(CreateTreatmentSchema) {}
