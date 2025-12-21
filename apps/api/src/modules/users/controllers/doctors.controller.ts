import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Doctor } from '@users/entities/doctor.entity';
import { DoctorsService } from '@users/services/doctors.service';
import { UsersService } from '@users/services/users.service';
import { ZodSerializerDto } from 'nestjs-zod';
import { DoctorsResponseDto } from '../dto';
import { RolesGuard } from '@auth/guards/role-auth.guard';
import { RequireRoles } from '@auth/decorators/require-roles.decorator';
import { RoleCode } from '@repo/contracts';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { User } from '@users/entities/user.entity';

@Controller('doctors')
export class DoctorsController {
  constructor(
    private doctorsService: DoctorsService,
    private usersService: UsersService,
  ) {}

  @Post()
  async createDoctor(@Body() dto): Promise<Doctor> {
    return this.doctorsService.createDoctor(dto);
  }

  @Get()
  @ZodSerializerDto(DoctorsResponseDto)
  async getDoctors(): Promise<Doctor[]> {
    return this.doctorsService.getDoctors();
  }

  @Post('me/signature')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR, RoleCode.DIRECTOR)
  @UseInterceptors(FileInterceptor('signature'))
  async uploadSignature(
    @CurrentUser() user: User,
    @UploadedFile() signature: Express.Multer.File,
  ) {
    if (!signature) {
      throw new BadRequestException('Se requiere una imagen de firma');
    }

    if (
      !signature.mimetype.includes('png') &&
      !signature.mimetype.includes('jpeg') &&
      !signature.mimetype.includes('jpg') &&
      !signature.mimetype.includes('image')
    ) {
      throw new BadRequestException(
        'La firma debe ser un archivo de imagen (PNG/JPG)',
      );
    }

    const signatureUri = await this.usersService.uploadDoctorSignature(
      user.id,
      signature,
    );

    return {
      message: 'Firma cargada correctamente',
      data: { signatureUri },
    };
  }

  @Get('me/signature')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR, RoleCode.DIRECTOR)
  async getSignature(@CurrentUser() user: User) {
    const signatureUri = await this.usersService.getDoctorSignature(user.id);

    return {
      data: { signatureUri },
    };
  }

  @Delete('me/signature')
  @UseGuards(RolesGuard)
  @RequireRoles(RoleCode.DOCTOR, RoleCode.DIRECTOR)
  async deleteSignature(@CurrentUser() user: User) {
    await this.usersService.deleteDoctorSignature(user.id);

    return {
      message: 'Firma eliminada correctamente',
    };
  }
}
