import * as z from "zod";
import { ValidationError } from "../validations/errors";

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

export interface ApiValidationErrorResponse {
  statusCode: number;
  message: string;
  errors: ValidationError["issues"];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const ApiResponseSchema = <T>(dataSchema: z.ZodType<T>) => {
  return z.object({
    statusCode: z.number(),
    message: z.string(),
    data: dataSchema,
  });
};

export const PaginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export const PaginatedResponseSchema = <T>(dataSchema: z.ZodType<T>) => {
  return z.object({
    statusCode: z.number(),
    message: z.string(),
    data: z.array(dataSchema),
    pagination: PaginationSchema,
  });
};
