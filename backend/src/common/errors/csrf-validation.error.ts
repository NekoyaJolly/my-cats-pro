import { ForbiddenException } from '@nestjs/common';

export class CsrfValidationError extends ForbiddenException {
  constructor(message = 'CSRFトークンが不正または不足しています') {
    super(message);
    this.name = 'CsrfValidationError';
  }
}
