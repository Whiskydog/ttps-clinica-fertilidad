import { MigrationInterface, QueryRunner } from 'typeorm';

export class BaseUsers1761331019501 implements MigrationInterface {
  name = 'BaseUsers1761331019501';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "users" (
      "id" BIGINT PRIMARY KEY,
      "first_name" VARCHAR(100) NOT NULL,
      "last_name" VARCHAR(100) NOT NULL,
      "phone" VARCHAR(50) NULL,
      "email" VARCHAR(255) UNIQUE NOT NULL,
      "password_hash" VARCHAR(255) NOT NULL,
      "is_active" BOOLEAN NOT NULL DEFAULT true,
      "role_id" BIGINT NOT NULL,
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "deleted_at" TIMESTAMPTZ NULL,
      CONSTRAINT "FK_users_role_id_roles_id" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
