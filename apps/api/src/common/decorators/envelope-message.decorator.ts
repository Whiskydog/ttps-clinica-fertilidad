import { SetMetadata } from '@nestjs/common';

export const ENVELOPE_MESSAGE = 'envelope:message';
export const EnvelopeMessage = (message: string) =>
  SetMetadata(ENVELOPE_MESSAGE, message);
