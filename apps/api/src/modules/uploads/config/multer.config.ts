import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      // Determinar la carpeta según el contexto (por defecto study-results)
      const folder = req.query.type === 'informed-consent'
        ? './uploads/informed-consents'
        : './uploads/study-results';
      cb(null, folder);
    },
    filename: (req, file, cb) => {
      // Generar nombre único: timestamp-random-extension
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      cb(null, `${Date.now()}-${randomName}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Solo permitir PDFs
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(
        new BadRequestException('Solo se permiten archivos PDF'),
        false,
      );
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB en bytes
  },
};
