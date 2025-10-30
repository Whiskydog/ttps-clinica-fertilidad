import * as argon2 from 'argon2';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdminUser1761849561332 implements MigrationInterface {
  name = 'CreateAdminUser1761849561332';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Hash de la contraseña: Admin@2025
    const passwordHash = await argon2.hash('Admin@2025');

    await queryRunner.query(
      `INSERT INTO "users" (
        "first_name",
        "last_name",
        "email",
        "phone",
        "password_hash",
        "is_active",
        "role"
      ) VALUES (
        'Administrador',
        'Sistema',
        'admin@clinica.com',
        '+541112345678',
        '${passwordHash}',
        true,
        'admin'
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "users" WHERE "email" = 'admin@clinica.com'`,
    );
  }
}
