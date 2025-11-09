import { customAlphabet } from 'nanoid';

export const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 22);

export function newQrToken() {
  return 'qr_' + nanoid();
}
