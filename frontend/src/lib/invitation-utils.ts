/**
 * 招待関連のユーティリティ関数
 */

/**
 * 招待トークンから招待URLを生成する
 * 
 * @param token - 招待トークン
 * @returns 招待URL
 */
export function getInvitationUrl(token: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/accept-invitation?token=${token}`;
  }
  return `/accept-invitation?token=${token}`;
}
