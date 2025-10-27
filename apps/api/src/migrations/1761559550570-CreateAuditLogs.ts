import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogs1761559550570 implements MigrationInterface {
  name = 'CreateAuditLogs1761559550570';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "audit_logs" (
      "id" SERIAL PRIMARY KEY,
      "table_name" VARCHAR NOT NULL,
      "record_id" TEXT NOT NULL,
      "modified_field" VARCHAR NOT NULL,
      "old_value" TEXT NULL,
      "new_value" TEXT NULL,
      "modified_by_user_id" INTEGER NULL,
      "user_role" VARCHAR NOT NULL,
      "modification_timestamp" TIMESTAMP NOT NULL DEFAULT now(),
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      "deleted_at" TIMESTAMP NULL
    );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "audit_logs"');
  }
}
