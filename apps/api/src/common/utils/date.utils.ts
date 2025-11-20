/**
 * Convierte un string de fecha en formato YYYY-MM-DD a un objeto Date
 * sin problemas de zona horaria.
 *
 * @param dateString - String en formato YYYY-MM-DD
 * @returns Date object con la fecha correcta
 *
 * @example
 * parseDateFromString("2025-11-19") // Devuelve Date con 2025-11-19
 */
export function parseDateFromString(dateString: string | null | undefined | Date): Date | null {
  if (!dateString) return null;

  // Si ya es un objeto Date, devolverlo
  if (dateString instanceof Date) return dateString;

  // Si no es un string, retornar null
  if (typeof dateString !== 'string') return null;

  // Parsear el string YYYY-MM-DD y crear Date en hora local (no UTC)
  // Esto evita problemas de timezone
  const [year, month, day] = dateString.split('T')[0].split('-').map(Number);

  if (!year || !month || !day) return null;

  // Crear fecha en hora local (mediodía para evitar edge cases)
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

/**
 * Convierte un Date object a string en formato YYYY-MM-DD
 *
 * @param date - Date object
 * @returns String en formato YYYY-MM-DD
 */
export function formatDateToString(date: Date | null | undefined): string | null {
  if (!date) return null;

  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
