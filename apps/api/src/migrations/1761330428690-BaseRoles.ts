import { MigrationInterface, QueryRunner } from 'typeorm';

export class BaseRoles1761330428690 implements MigrationInterface {
  name = 'BaseRoles1761330428690';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum for role codes to match entity enumName
    await queryRunner.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_code_enum') THEN
        CREATE TYPE "public"."role_code_enum" AS ENUM('patient','doctor','lab_technician','director','admin');
      END IF; END $$;`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "roles" (
          "id" BIGINT PRIMARY KEY,
          "code" "public"."role_code_enum" UNIQUE NOT NULL,
          "name" VARCHAR(100) NOT NULL,
          "description" TEXT NULL,
          "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "deleted_at" TIMESTAMPTZ NULL
        )`);
    await queryRunner.query(
      `INSERT INTO "roles" (code, name, description) VALUES ('patient', 'Paciente', 'Rol para pacientes') ON CONFLICT DO NOTHING`,
    );
    await queryRunner.query(
      `INSERT INTO "roles" (code, name, description) VALUES ('doctor', 'Doctor', 'Rol para doctores') ON CONFLICT DO NOTHING`,
    );
    await queryRunner.query(
      `INSERT INTO "roles" (code, name, description) VALUES ('lab_technician', 'Operador de Laboratorio', 'Rol para operadores de laboratorio') ON CONFLICT DO NOTHING`,
    );
    await queryRunner.query(
      `INSERT INTO "roles" (code, name, description) VALUES ('director', 'Director', 'Rol para directores') ON CONFLICT DO NOTHING`,
    );
    await queryRunner.query(
      `INSERT INTO "roles" (code, name, description) VALUES ('admin', 'Admin', 'Rol para administradores') ON CONFLICT DO NOTHING`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "roles"`);
    await queryRunner.query('DROP TYPE IF EXISTS "public"."role_code_enum"');
  }
}
