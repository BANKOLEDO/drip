export function shortAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars)}\u2026${address.slice(-chars)}`;
}