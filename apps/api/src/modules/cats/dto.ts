import { createZodDto } from "nestjs-zod";

import { CatCreateSchema, CatUpdateSchema, CatResponseSchema, CatsListResponseSchema } from "@repo/contracts";

export class CatCreateDto extends createZodDto(CatCreateSchema) {}
export class CatUpdateDto extends createZodDto(CatUpdateSchema) {}
export class CatResponseDto extends createZodDto(CatResponseSchema) {}
export class CatsListResponseDto extends createZodDto(CatsListResponseSchema) {}