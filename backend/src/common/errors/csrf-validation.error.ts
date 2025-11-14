import { ForbiddenException } from '@nestjs/common';

export class CsrfValidationError extends ForbiddenException {
  constructor(message = 'Invalid or missing CSRF token') {
    super(message);
    this.name = 'CsrfValidationError';
  }
}
