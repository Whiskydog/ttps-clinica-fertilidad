import { ValidationError } from '@repo/contracts';
import { ZodValidationException } from 'nestjs-zod';

export class ValidationException extends ZodValidationException {
  constructor(error: ValidationError) {
    super(error);
    this.name = 'ValidationException';
  }
}
