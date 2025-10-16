import { eq, and, ilike, inArray, or } from 'drizzle-orm';
import type { Database } from '../client';
import { users } from '../schema';
import { UserRole, UserStatus, type UserRole as UserRoleType, type UserStatus as UserStatusType } from '@repo/types';

/**
 * User queries
 */

export class UserQueries {
  constructor(private db: Database) {}

  /**
   * Find user by ID
   */
  async findById(id: string) {
    const [user] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return user || null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user || null;
  }

  /**
   * Find user by Supabase Auth ID
   */
  async findByAuthId(authId: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.authId, authId))
      .limit(1);
    return user || null;
  }

  /**
   * Find users by role
   */
  async findByRole(role: UserRoleType) {
    return this.db.select().from(users).where(eq(users.role, role));
  }

  /**
   * Find users by status
   */
  async findByStatus(status: UserStatusType) {
    return this.db.select().from(users).where(eq(users.status, status));
  }

  /**
   * Find users by multiple roles
   */
  async findByRoles(roles: UserRoleType[]) {
    return this.db.select().from(users).where(inArray(users.role, roles));
  }

  /**
   * Search users by name or email
   */
  async search(query: string) {
    const searchPattern = `%${query}%`;
    return this.db
      .select()
      .from(users)
      .where(
        or(
          ilike(users.firstName, searchPattern),
          ilike(users.lastName, searchPattern),
          ilike(users.email, searchPattern)
        )
      );
  }

  /**
   * Get all active doctors
   */
  async getActiveDoctors() {
    return this.db
      .select()
      .from(users)
      .where(and(eq(users.role, UserRole.DOCTOR), eq(users.status, UserStatus.ACTIVE)));
  }

  /**
   * Get all active patients
   */
  async getActivePatients() {
    return this.db
      .select()
      .from(users)
      .where(and(eq(users.role, UserRole.PATIENT), eq(users.status, UserStatus.ACTIVE)));
  }

  /**
   * Count users by role
   */
  async countByRole(role: UserRoleType) {
    const result = await this.db
      .select({ count: users.id })
      .from(users)
      .where(eq(users.role, role));
    return result.length;
  }
}
