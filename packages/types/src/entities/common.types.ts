/**
 * Common types used across all entities
 */

export interface TimestampFields {
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeleteFields {
  deletedAt: Date | null;
}

export interface BaseEntity extends TimestampFields {
  id: string;
}

export interface AuditFields extends TimestampFields {
  createdBy: string;
  updatedBy: string;
}

export type PaginationParams = {
  page: number;
  limit: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type SortOrder = 'asc' | 'desc';

export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
