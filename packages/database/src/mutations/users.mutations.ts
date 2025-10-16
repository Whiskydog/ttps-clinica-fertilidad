import { eq } from 'drizzle-orm';
import type { Database } from '../client';
import { users, type NewUser } from '../schema';
import { UserStatus } from '@repo/types';

/**
 * User mutations
 */

export class UserMutations {
  constructor(private db: Database) {}

  /**
   * Create a new user
   */
  async create(data: NewUser) {
    const [user] = await this.db
      .insert(users)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  /**
   * Update user by ID
   */
  async update(id: string, data: Partial<NewUser>) {
    const [user] = await this.db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  /**
   * Delete user by ID (soft delete by setting status to inactive)
   */
  async softDelete(id: string) {
    const [user] = await this.db
      .update(users)
      .set({
        status: UserStatus.INACTIVE,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  /**
   * Hard delete user by ID
   */
  async delete(id: string) {
    await this.db.delete(users).where(eq(users.id, id));
  }

  /**
   * Update user avatar URL
   */
  async updateAvatar(id: string, avatarUrl: string) {
    const [user] = await this.db
      .update(users)
      .set({
        avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  /**
   * Update user status
   */
  async updateStatus(id: string, status: UserStatus) {
    const [user] = await this.db
      .update(users)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  /**
   * Update user medical history
   */
  async updateMedicalInfo(
    id: string,
    data: {
      medicalHistory?: string;
      allergies?: string;
      currentMedications?: string;
    }
  ) {
    const [user] = await this.db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }
}
