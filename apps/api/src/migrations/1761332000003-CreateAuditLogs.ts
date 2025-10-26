import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogs1761332000003 implements MigrationInterface {
  name = 'CreateAuditLogs1761332000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "audit_logs" (
      "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      "table_name" VARCHAR NOT NULL,
      "record_id" TEXT NOT NULL,
      "modified_field" VARCHAR NOT NULL,
      "old_value" TEXT NULL,
      "new_value" TEXT NULL,
      "modified_by_user_id" uuid NULL,
      "user_role" VARCHAR NOT NULL,
      "modification_timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "deleted_at" TIMESTAMPTZ NULL
    );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "audit_logs"');
  }
}
