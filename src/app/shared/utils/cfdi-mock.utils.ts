export function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateDivision(): string {
  const num = Math.floor(Math.random() * 9999999)
    .toString()
    .padStart(7, '0');
  const suffix = Math.floor(Math.random() * 9);
  return `R_${num}_${suffix}`;
}

export function generateMonto(): string {
  const amount = Math.random() * 50000 + 500;
  return amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

export function generateTrackId(length = 20): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}