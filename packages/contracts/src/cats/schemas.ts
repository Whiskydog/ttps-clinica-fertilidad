import { z } from 'zod';

export const CatCreateSchema = z.object({
  name: z.string().min(2).max(100),
  age: z.number().min(0).max(50),
  breed: z.string().min(2).max(100),
});

export const CatUpdateSchema = CatCreateSchema.partial();

export const CatResponseSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(2).max(100),
  age: z.number().min(0).max(50),
  breed: z.string().min(2).max(100),
});

export const CatsListResponseSchema = z.array(CatResponseSchema);
