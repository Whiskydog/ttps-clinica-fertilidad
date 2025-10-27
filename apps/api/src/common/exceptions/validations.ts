import { ValidationError } from '@repo/contracts';
import { ZodValidationException } from 'nestjs-zod';

export class ValidationException extends ZodValidationException {
  constructor(issue: { fieldName: string; message: string }) {
    super(new ValidationError(issue));
    this.name = 'ValidationException';
  }
}
