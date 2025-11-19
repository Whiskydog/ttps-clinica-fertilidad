import { Injectable, Logger } from '@nestjs/common';
import { UploadResponseDto } from './dto/upload-response.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  generateFileUri(file: Express.Multer.File, type?: string): UploadResponseDto {
    // Construir la URI del archivo
    const folder = type === 'informed-consent'
      ? 'informed-consents'
      : 'study-results';

    // Normalizar el filename para asegurar que usa barras normales
    const normalizedFilename = file.filename.replace(/\\/g, '/');

    const fileUri = `/uploads/${folder}/${normalizedFilename}`;

    this.logger.log(`Generated file URI: ${fileUri}`);

    return {
      fileUri,
      originalName: file.originalname,
      size: file.size,
    };
  }

  /**
   * Delete a file from the filesystem
   * @param fileUri - The file URI to delete (e.g., /uploads/study-results/file.pdf or informed-consents\file.pdf)
   */
  async deleteFile(fileUri: string | null | undefined): Promise<void> {
    if (!fileUri) {
      return;
    }

    try {
      // Normalizar la URI para manejar tanto barras normales como invertidas
      let normalizedUri = fileUri.replace(/\\/g, '/');

      // Remover el prefijo /uploads/ si existe
      if (normalizedUri.startsWith('/uploads/')) {
        normalizedUri = normalizedUri.substring('/uploads/'.length);
      }

      // Construir la ruta absoluta al archivo
      const filePath = join(process.cwd(), 'uploads', normalizedUri);

      this.logger.log(`Intentando eliminar archivo: ${filePath}`);

      // Eliminar el archivo
      await unlink(filePath);

      this.logger.log(`Archivo eliminado exitosamente: ${filePath}`);
    } catch (error) {
      // Si el archivo no existe, no es un error crítico
      this.logger.error(`Error al eliminar archivo ${fileUri}:`, error);
    }
  }
}
