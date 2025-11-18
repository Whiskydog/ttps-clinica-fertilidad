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
  console.log('[DEBUG uploadPDF] Iniciando upload de archivo:', file.name);
  console.log('[DEBUG uploadPDF] Tipo:', type);

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

  console.log('[DEBUG uploadPDF] URL:', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include', // Para enviar cookies de autenticación
    });

    console.log('[DEBUG uploadPDF] Response status:', response.status);
    console.log('[DEBUG uploadPDF] Response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[DEBUG uploadPDF] Error response:', errorData);
      throw new Error(
        errorData.message || `Error al subir archivo: ${response.status}`
      );
    }

    const data = await response.json();
    console.log('[DEBUG uploadPDF] Response data:', data);

    // El backend envuelve la respuesta en { statusCode, message, data }
    const fileUri = data.data?.fileUri || data.fileUri;
    console.log('[DEBUG uploadPDF] fileUri:', fileUri);

    if (!fileUri) {
      throw new Error('No se recibió la URI del archivo del servidor');
    }

    return fileUri;
  } catch (error) {
    console.error('[DEBUG uploadPDF] Error al subir:', error);
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
