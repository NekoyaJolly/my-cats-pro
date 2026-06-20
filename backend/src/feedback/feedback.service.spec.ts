import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { EmailService } from '../email/email.service';

import { FeedbackService } from './feedback.service';

describe('FeedbackService', () => {
  let service: FeedbackService;
  const mockEmailService = { sendEmail: jest.fn() };
  const mockConfigService = { get: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        { provide: EmailService, useValue: mockEmailService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();
    service = module.get<FeedbackService>(FeedbackService);
  });

  it('ADMIN_EMAIL が未設定なら sent=false を返し、メールを送らない', async () => {
    mockConfigService.get.mockReturnValue(undefined);

    const result = await service.submit({ message: 'テストフィードバック' });

    expect(result).toEqual({ sent: false });
    expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
  });

  it('ADMIN_EMAIL 設定ありなら ADMIN_EMAIL 宛に sendEmail し、結果を sent に反映する', async () => {
    mockConfigService.get.mockReturnValue('admin@example.com');
    mockEmailService.sendEmail.mockResolvedValue({ success: true });

    const result = await service.submit(
      { message: 'ご意見です' },
      { userId: 'u1', email: 'user@example.com' },
    );

    expect(result).toEqual({ sent: true });
    expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(1);
    const payload = mockEmailService.sendEmail.mock.calls[0][0];
    expect(payload.to).toBe('admin@example.com');
    expect(payload.replyTo).toBe('user@example.com');
    expect(payload.text).toContain('ご意見です');
  });

  it('メール送信が失敗したら sent=false を返す', async () => {
    mockConfigService.get.mockReturnValue('admin@example.com');
    mockEmailService.sendEmail.mockResolvedValue({ success: false });

    const result = await service.submit({ message: 'テスト' });

    expect(result).toEqual({ sent: false });
    expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(1);
  });

  it('HTML 本文はユーザー入力をエスケープする', async () => {
    mockConfigService.get.mockReturnValue('admin@example.com');
    mockEmailService.sendEmail.mockResolvedValue({ success: true });

    await service.submit({ message: '<script>alert(1)</script>' });

    const payload = mockEmailService.sendEmail.mock.calls[0][0];
    expect(payload.html).toContain('&lt;script&gt;');
    expect(payload.html).not.toContain('<script>');
  });
});
