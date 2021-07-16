const charset =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const toBase62 = (integer: number): string => {
  if (integer === 0) {
    return '0';
  }
  let s: string[] = [];
  while (integer > 0) {
    s = [charset[integer % 62], ...s];
    integer = Math.floor(integer / 62);
  }
  return s.join('');
};

export const fromBase62 = (chars: string): number => {
  return chars
    .split('')
    .reverse()
    .reduce((prev, curr, i) => prev + charset.indexOf(curr) * 62 ** i, 0);
};
