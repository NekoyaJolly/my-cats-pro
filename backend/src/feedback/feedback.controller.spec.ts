import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

describe('FeedbackController', () => {
  let controller: FeedbackController;
  const mockFeedbackService = { submit: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackController],
      providers: [{ provide: FeedbackService, useValue: mockFeedbackService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get<FeedbackController>(FeedbackController);
  });

  it('service.submit に委譲し、結果を ApiResponse.success で包んで返す', async () => {
    mockFeedbackService.submit.mockResolvedValue({ sent: true });

    const user = { userId: 'u1', email: 'user@example.com' };
    const res = await controller.submit({ message: 'テスト' }, user);

    expect(mockFeedbackService.submit).toHaveBeenCalledWith({ message: 'テスト' }, user);
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ sent: true });
  });
});
