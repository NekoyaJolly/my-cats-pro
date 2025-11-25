import { isSecureEnv, getRefreshCookieSameSite } from './auth.constants';

describe('Auth Constants', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    // Restore original NODE_ENV after each test
    process.env.NODE_ENV = originalEnv;
  });

  describe('isSecureEnv', () => {
    it('should return true when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      expect(isSecureEnv()).toBe(true);
    });

    it('should return false when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development';
      expect(isSecureEnv()).toBe(false);
    });

    it('should return false when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test';
      expect(isSecureEnv()).toBe(false);
    });

    it('should return false when NODE_ENV is undefined', () => {
      delete process.env.NODE_ENV;
      expect(isSecureEnv()).toBe(false);
    });
  });

  describe('getRefreshCookieSameSite', () => {
    it('should return "none" when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      expect(getRefreshCookieSameSite()).toBe('none');
    });

    it('should return "lax" when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development';
      expect(getRefreshCookieSameSite()).toBe('lax');
    });

    it('should return "lax" when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test';
      expect(getRefreshCookieSameSite()).toBe('lax');
    });

    it('should return "lax" when NODE_ENV is undefined', () => {
      delete process.env.NODE_ENV;
      expect(getRefreshCookieSameSite()).toBe('lax');
    });
  });
});
