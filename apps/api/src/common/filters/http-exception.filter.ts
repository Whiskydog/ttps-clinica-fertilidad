import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ZodSerializationException, ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

@Catch(HttpException)
export default class HttpExceptionFilter extends BaseExceptionFilter {
  private logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    // Log all HTTP exceptions for debugging
    this.logger.error(`HttpException: ${exception.message}`);
    this.logger.error(`Response: ${JSON.stringify(exception.getResponse())}`);

    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError();
      this.logger.error(`ZodValidationException errors: ${JSON.stringify(zodError)}`);
    }

    if (exception instanceof ZodSerializationException) {
      const zodError = exception.getZodError();

      if (zodError instanceof ZodError) {
        this.logger.error(`ZodSerializationException: ${zodError.message}`);
      }
    }

    super.catch(exception, host);
  }
}
