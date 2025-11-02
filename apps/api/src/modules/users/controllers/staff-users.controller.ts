import { EnvelopeMessage } from '@common/decorators/envelope-message.decorator';
import { RequireRoles } from '@modules/auth/decorators/require-roles.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RoleCode } from '@repo/contracts';
import {
  AdminUserCreateDto,
  GetStaffUsersQueryDto,
  ToggleUserStatusDto,
  UserResponseDto,
  UsersListResponseDto,
} from '@users/dto';
import { User } from '@users/entities/user.entity';
import { StaffUsersService } from '@users/services/staff-users.service';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('admin/users')
@RequireRoles(RoleCode.ADMIN)
export class StaffUsersController {
  constructor(private staffUsersService: StaffUsersService) {}

  @Get()
  @EnvelopeMessage('Usuarios obtenidos exitosamente')
  @ZodSerializerDto(UsersListResponseDto)
  async getAllStaffUsers(@Query() query: GetStaffUsersQueryDto) {
    return this.staffUsersService.getAllStaffUsers(query.page, query.perPage);
  }

  @Post()
  @EnvelopeMessage('Usuario creado exitosamente')
  @ZodSerializerDto(UserResponseDto)
  async createStaffUser(@Body() dto: AdminUserCreateDto): Promise<User> {
    return this.staffUsersService.createStaffUser(dto);
  }

  @Patch(':id/toggle-status')
  @EnvelopeMessage('Estado del usuario actualizado exitosamente')
  @ZodSerializerDto(UserResponseDto)
  async toggleUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ToggleUserStatusDto,
  ): Promise<User> {
    return this.staffUsersService.toggleUserStatus(id, dto.isActive);
  }

  @Delete(':id')
  @EnvelopeMessage('Usuario eliminado exitosamente')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.staffUsersService.deleteUser(id);
  }
}
