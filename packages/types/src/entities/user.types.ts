import { UserRole } from '../enums';
import { BaseEntity, AuditFields } from './common.types';

/**
 * User entity types for the fertility clinic system
 */

export interface User extends BaseEntity, AuditFields {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
}