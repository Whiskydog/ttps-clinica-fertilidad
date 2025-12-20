import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  MethodNotAllowedException,
  NotAcceptableException,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { AxiosError } from 'axios';

export function getHttpExceptionFromAxiosError(
  error: AxiosError,
): HttpException {
  const status = error.response?.status || error.status || 500;
  const data = error?.response?.data as any;
  const message =
    typeof data === 'string'
      ? data
      : data?.error || data?.message || error.message || 'HTTP Error';

  if (status === 400) {
    return new BadRequestException(message);
  }
  if (status === 401) {
    return new UnauthorizedException(message);
  }
  if (status === 403) {
    return new ForbiddenException(message);
  }
  if (status === 404) {
    return new NotFoundException(message);
  }
  if (status === 405) {
    return new MethodNotAllowedException(message);
  }
  if (status === 406) {
    return new NotAcceptableException(message);
  }
  if (status === 408) {
    return new RequestTimeoutException(message);
  }
  if (status === 409) {
    return new ConflictException(message);
  }

  return new HttpException(error, status);
}
