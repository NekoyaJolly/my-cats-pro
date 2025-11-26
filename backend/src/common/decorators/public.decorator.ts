import { SetMetadata } from '@nestjs/common';

/**
 * Public デコレータ
 * 
 * 認証不要のエンドポイント（招待完了APIなど）に使用します。
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
