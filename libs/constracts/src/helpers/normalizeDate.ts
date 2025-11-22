export function normalizeDate(date: Date): string {
  return date.toISOString().split('T')[0]; // trả về 'YYYY-MM-DD'
}
