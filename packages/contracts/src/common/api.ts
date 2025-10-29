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

export const ApiResponseSchema = <T>(dataSchema: z.ZodType<T>) => {
  return z.object({
    statusCode: z.number(),
    message: z.string(),
    data: dataSchema,
  });
};
