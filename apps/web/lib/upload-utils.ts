/**
 * Upload a PDF file to the backend
 * @param file - The PDF file to upload
 * @param type - The type of upload ('study-result' or 'informed-consent')
 * @returns Promise with the file URI
 */
export async function uploadPDF(
  file: File,
  type: 'study-result' | 'informed-consent' = 'study-result'
): Promise<string> {
  // Validar que sea un PDF
  if (file.type !== 'application/pdf') {
    throw new Error('Solo se permiten archivos PDF');
  }

  // Validar tamaño máximo (10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB en bytes
  if (file.size > maxSize) {
    throw new Error('El archivo no debe superar los 10MB');
  }

  const formData = new FormData();
  formData.append('file', file);

  const queryParam = type === 'informed-consent' ? '?type=informed-consent' : '';
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const url = `${backendUrl}/v1/api/uploads/pdf${queryParam}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Error al subir archivo: ${response.status}`
      );
    }

    const data = await response.json();

    // El backend envuelve la respuesta en { statusCode, message, data }
    const fileUri = data.data?.fileUri || data.fileUri;

    if (!fileUri) {
      throw new Error('No se recibió la URI del archivo del servidor');
    }

    return fileUri;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error desconocido al subir el archivo');
  }
}

/**
 * Get the full URL of an uploaded file
 * @param fileUri - The file URI (e.g. /uploads/study-results/file.pdf)
 * @returns Full URL to access the file
 */
export function getFileUrl(fileUri: string | null | undefined): string | null {
  if (!fileUri) return null;

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Normalizar barras invertidas de Windows a barras normales para URLs
  let normalizedUri = fileUri.replace(/\\/g, '/');

  // Si la URI ya tiene el protocolo, devolverla tal cual
  if (normalizedUri.startsWith('http://') || normalizedUri.startsWith('https://')) {
    return normalizedUri;
  }

  // Si empieza con /uploads, agregarle la URL base
  if (normalizedUri.startsWith('/uploads')) {
    return `${backendUrl}${normalizedUri}`;
  }

  // Si no tiene el prefijo, agregarlo
  return `${backendUrl}/uploads/${normalizedUri}`;
}

/**
 * Normaliza una fecha recibida del backend a formato YYYY-MM-DD
 * evitando problemas de timezone
 * @param dateString - String de fecha del backend (puede ser ISO string o YYYY-MM-DD)
 * @returns String en formato YYYY-MM-DD para usar en input type="date"
 */
export function normalizeDateForInput(dateString: string | null | undefined): string | null {
  if (!dateString) return null;

  // Si ya es una fecha en formato YYYY-MM-DD, devolverla
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // Si es un ISO string (con T y timezone), extraer solo la parte de la fecha
  // Esto evita problemas de timezone al parsear
  if (dateString.includes('T')) {
    return dateString.split('T')[0];
  }

  // Fallback: intentar parsear la fecha
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;

    // Usar toISOString y extraer la parte de la fecha
    return date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

/**
 * Formatea una fecha para mostrar en la UI evitando problemas de timezone
 * @param dateString - String de fecha del backend (puede ser ISO string o YYYY-MM-DD)
 * @returns Fecha formateada en formato local (ej: "19/11/2025")
 */
export function formatDateForDisplay(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';

  // Primero normalizar a YYYY-MM-DD para evitar timezone issues
  const normalized = normalizeDateForInput(dateString);
  if (!normalized) return 'N/A';

  // Parsear manualmente para evitar problemas de timezone
  const [year, month, day] = normalized.split('-').map(Number);

  // Crear fecha en hora local
  const date = new Date(year, month - 1, day);

  // Formatear usando toLocaleDateString
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}
