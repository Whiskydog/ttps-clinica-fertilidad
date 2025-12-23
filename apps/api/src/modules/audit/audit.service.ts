import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual, And, FindOptionsWhere } from 'typeorm';
import { AuditLog } from '@modules/audit/entities/audit-log.entity';

export interface AuditQueryParams {
  page?: number;
  limit?: number;
  userId?: number;
  tableName?: string;
  dateFrom?: string;
  dateTo?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(
    table: string,
    recordId: string | number,
    field: string,
    oldValue: any,
    newValue: any,
    userId: number,
  ) {
    await this.auditRepo.save({
      tableName: table,
      recordId: String(recordId),
      modifiedField: field,
      oldValue,
      newValue,
      modifiedByUser: { id: Number(userId) },
      modificationTimestamp: new Date(),
    });
  }

  async findByUserId(userId: number) {
    return this.auditRepo.find({
      where: { modifiedByUser: { id: userId } },
      relations: ['modifiedByUser'],
      order: { modificationTimestamp: 'DESC' },
    });
  }

  /**
   * Obtiene logs de auditoría con filtros y paginación
   */
  async findAll(params: AuditQueryParams) {
    const { page = 1, limit = 20, userId, tableName, dateFrom, dateTo } = params;
    const skip = (page - 1) * limit;

    // Construir condiciones de búsqueda
    const where: FindOptionsWhere<AuditLog> = {};

    if (userId) {
      where.modifiedByUser = { id: userId };
    }

    if (tableName) {
      where.tableName = tableName;
    }

    // Para fechas, usamos una lógica más simple
    let dateConditions: FindOptionsWhere<AuditLog>[] | undefined;

    if (dateFrom && dateTo) {
      const startDate = new Date(dateFrom);
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      where.modificationTimestamp = And(
        MoreThanOrEqual(startDate),
        LessThanOrEqual(endDate),
      );
    } else if (dateFrom) {
      where.modificationTimestamp = MoreThanOrEqual(new Date(dateFrom));
    } else if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      where.modificationTimestamp = LessThanOrEqual(endDate);
    }

    const [data, total] = await this.auditRepo.findAndCount({
      where,
      relations: ['modifiedByUser'],
      order: { modificationTimestamp: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Obtiene lista de tablas únicas que han sido auditadas
   */
  async getDistinctTables(): Promise<string[]> {
    // Usar query raw para DISTINCT
    const result = await this.auditRepo
      .createQueryBuilder('audit')
      .select('DISTINCT audit.table_name', 'tableName')
      .orderBy('audit.table_name', 'ASC')
      .getRawMany();

    return result.map((r) => r.tableName).filter(Boolean);
  }

  /**
   * Obtiene lista de usuarios que han realizado modificaciones
   */
  async getDistinctUsers() {
    const logs = await this.auditRepo.find({
      relations: ['modifiedByUser'],
    });

    // Eliminar duplicados
    const usersMap = new Map();
    logs.forEach((log) => {
      const user = log.modifiedByUser;
      if (user && !usersMap.has(user.id)) {
        usersMap.set(user.id, {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        });
      }
    });

    return Array.from(usersMap.values());
  }
}
