import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let mockResendSend: jest.Mock;

  // Resendインスタンスのモック
  const mockResendInstance = {
    emails: {
      send: jest.fn(),
    },
  };

  const mockConfigServiceEnabled = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const config: Record<string, string> = {
        RESEND_API_KEY: 're_test_api_key',
        EMAIL_FROM: 'test@example.com',
        EMAIL_FROM_NAME: 'Test Sender',
        FRONTEND_URL: 'https://test.example.com',
      };
      return config[key] || defaultValue;
    }),
  };

  const mockConfigServiceDisabled = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const config: Record<string, string> = {
        EMAIL_FROM: 'test@example.com',
        EMAIL_FROM_NAME: 'Test Sender',
        FRONTEND_URL: 'https://test.example.com',
      };
      return config[key] || defaultValue;
    }),
  };

  describe('when email is enabled', () => {
    beforeEach(async () => {
      // Resendのモックをリセット
      mockResendInstance.emails.send = jest.fn();
      mockResendSend = mockResendInstance.emails.send;

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigServiceEnabled,
          },
        ],
      }).compile();

      service = module.get<EmailService>(EmailService);

      // サービス内部のresendインスタンスを置き換え
      (service as unknown as { resend: typeof mockResendInstance }).resend = mockResendInstance;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    describe('sendEmail', () => {
      it('メール送信が成功すること', async () => {
        mockResendSend.mockResolvedValue({
          data: { id: 'test-message-id' },
          error: null,
        });

        const result = await service.sendEmail({
          to: 'recipient@example.com',
          subject: 'テストメール',
          html: '<p>テスト本文</p>',
        });

        expect(result.success).toBe(true);
        expect(result.messageId).toBe('test-message-id');
        expect(mockResendSend).toHaveBeenCalledWith(
          expect.objectContaining({
            from: 'Test Sender <test@example.com>',
            to: 'recipient@example.com',
            subject: 'テストメール',
            html: '<p>テスト本文</p>',
          })
        );
      });

      it('Resend APIがエラーを返した場合、失敗を返すこと', async () => {
        mockResendSend.mockResolvedValue({
          data: null,
          error: { message: 'API Error' },
        });

        const result = await service.sendEmail({
          to: 'recipient@example.com',
          subject: 'テストメール',
          text: 'テスト本文',
        });

        expect(result.success).toBe(false);
        expect(result.messageId).toBeUndefined();
      });

      it('例外が発生した場合、失敗を返すこと', async () => {
        mockResendSend.mockRejectedValue(new Error('Network error'));

        const result = await service.sendEmail({
          to: 'recipient@example.com',
          subject: 'テストメール',
          text: 'テスト本文',
        });

        expect(result.success).toBe(false);
      });

      it('replyToオプションが正しく設定されること', async () => {
        mockResendSend.mockResolvedValue({
          data: { id: 'test-id' },
          error: null,
        });

        await service.sendEmail({
          to: 'recipient@example.com',
          subject: 'テスト',
          text: 'テスト',
          replyTo: 'reply@example.com',
        });

        expect(mockResendSend).toHaveBeenCalledWith(
          expect.objectContaining({
            replyTo: 'reply@example.com',
          })
        );
      });

      it('複数の宛先に送信できること', async () => {
        mockResendSend.mockResolvedValue({
          data: { id: 'test-id' },
          error: null,
        });

        await service.sendEmail({
          to: ['user1@example.com', 'user2@example.com'],
          subject: 'テスト',
          text: 'テスト',
        });

        expect(mockResendSend).toHaveBeenCalledWith(
          expect.objectContaining({
            to: ['user1@example.com', 'user2@example.com'],
          })
        );
      });
    });

    describe('sendPasswordResetEmail', () => {
      it('パスワードリセットメールが正しいパラメータで送信されること', async () => {
        mockResendSend.mockResolvedValue({
          data: { id: 'reset-message-id' },
          error: null,
        });

        const result = await service.sendPasswordResetEmail(
          'user@example.com',
          'test-reset-token'
        );

        expect(result).toBe(true);
        expect(mockResendSend).toHaveBeenCalledWith(
          expect.objectContaining({
            to: 'user@example.com',
            subject: 'パスワードリセットのご案内',
          })
        );

        // URLにフロントエンドURLとトークンが含まれていることを確認
        const callArgs = mockResendSend.mock.calls[0][0];
        expect(callArgs.html).toContain('https://test.example.com/reset-password?token=test-reset-token');
        expect(callArgs.text).toContain('https://test.example.com/reset-password?token=test-reset-token');
      });

      it('メール送信が失敗した場合、falseを返すこと', async () => {
        mockResendSend.mockResolvedValue({
          data: null,
          error: { message: 'Failed' },
        });

        const result = await service.sendPasswordResetEmail(
          'user@example.com',
          'test-token'
        );

        expect(result).toBe(false);
      });
    });

    describe('sendWelcomeEmail', () => {
      it('ウェルカムメールが正しいパラメータで送信されること', async () => {
        mockResendSend.mockResolvedValue({
          data: { id: 'welcome-message-id' },
          error: null,
        });

        const result = await service.sendWelcomeEmail(
          'newuser@example.com',
          'テストユーザー'
        );

        expect(result).toBe(true);
        expect(mockResendSend).toHaveBeenCalledWith(
          expect.objectContaining({
            to: 'newuser@example.com',
            subject: 'MyCats Pro へようこそ!',
          })
        );

        // HTMLにユーザー名とフロントエンドURLが含まれていることを確認
        const callArgs = mockResendSend.mock.calls[0][0];
        expect(callArgs.html).toContain('テストユーザー');
        expect(callArgs.html).toContain('https://test.example.com/cats/new');
        expect(callArgs.html).toContain('https://test.example.com');
      });

      it('メール送信が失敗した場合、falseを返すこと', async () => {
        mockResendSend.mockResolvedValue({
          data: null,
          error: { message: 'Failed' },
        });

        const result = await service.sendWelcomeEmail(
          'user@example.com',
          'ユーザー'
        );

        expect(result).toBe(false);
      });
    });

    describe('sendCatRegistrationEmail', () => {
      it('猫登録確認メールが正しいパラメータで送信されること', async () => {
        mockResendSend.mockResolvedValue({
          data: { id: 'cat-reg-message-id' },
          error: null,
        });

        const result = await service.sendCatRegistrationEmail(
          'owner@example.com',
          'タマ',
          'CAT-12345'
        );

        expect(result).toBe(true);
        expect(mockResendSend).toHaveBeenCalledWith(
          expect.objectContaining({
            to: 'owner@example.com',
            subject: '【登録完了】タマ の登録が完了しました',
          })
        );

        // HTMLに猫の名前、登録番号、フロントエンドURLが含まれていることを確認
        const callArgs = mockResendSend.mock.calls[0][0];
        expect(callArgs.html).toContain('タマ');
        expect(callArgs.html).toContain('CAT-12345');
        expect(callArgs.html).toContain('https://test.example.com/cats/CAT-12345');
        expect(callArgs.html).toContain('https://test.example.com');
      });

      it('メール送信が失敗した場合、falseを返すこと', async () => {
        mockResendSend.mockResolvedValue({
          data: null,
          error: { message: 'Failed' },
        });

        const result = await service.sendCatRegistrationEmail(
          'owner@example.com',
          'タマ',
          'CAT-12345'
        );

        expect(result).toBe(false);
      });
    });
  });

  describe('when email is disabled', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigServiceDisabled,
          },
        ],
      }).compile();

      service = module.get<EmailService>(EmailService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('isEnabled が false の場合、メール送信がスキップされること', async () => {
      const result = await service.sendEmail({
        to: 'recipient@example.com',
        subject: 'テスト',
        text: 'テスト',
      });

      expect(result.success).toBe(false);
      expect(result.messageId).toBeUndefined();
    });

    it('sendPasswordResetEmail が false を返すこと', async () => {
      const result = await service.sendPasswordResetEmail(
        'user@example.com',
        'token'
      );

      expect(result).toBe(false);
    });

    it('sendWelcomeEmail が false を返すこと', async () => {
      const result = await service.sendWelcomeEmail(
        'user@example.com',
        'ユーザー'
      );

      expect(result).toBe(false);
    });

    it('sendCatRegistrationEmail が false を返すこと', async () => {
      const result = await service.sendCatRegistrationEmail(
        'owner@example.com',
        'タマ',
        'CAT-123'
      );

      expect(result).toBe(false);
    });
  });
});
