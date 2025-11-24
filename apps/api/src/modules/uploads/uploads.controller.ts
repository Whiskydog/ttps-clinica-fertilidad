import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { multerConfig } from './config/multer.config';
import { UploadResponseDto } from './dto/upload-response.dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('pdf')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  uploadPdf(
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type?: string,
  ): UploadResponseDto {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    console.log('[DEBUG] uploadPdf - file.filename:', file.filename);
    console.log('[DEBUG] uploadPdf - file.path:', file.path);
    console.log('[DEBUG] uploadPdf - type:', type);

    const result = this.uploadsService.generateFileUri(file, type);

    console.log('[DEBUG] uploadPdf - result:', JSON.stringify(result));

    return result;
  }
}
