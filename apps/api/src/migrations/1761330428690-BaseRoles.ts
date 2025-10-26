import { MigrationInterface, QueryRunner } from 'typeorm';

export class BaseRoles1761330428690 implements MigrationInterface {
  name = 'BaseRoles1761330428690';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."role_code_enum" AS ENUM('patient', 'doctor', 'lab_technician', 'director', 'admin')`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "code" "public"."role_code_enum" NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "UQ_f6d54f95c31b73fb1bdd8e91d0c" UNIQUE ("code"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `INSERT INTO "roles" (code, name, description) VALUES ('patient', 'Paciente', 'Rol para pacientes')`,
    );
    await queryRunner.query(
      `INSERT INTO "roles" (code, name, description) VALUES ('doctor', 'Doctor', 'Rol para doctores')`,
    );
    await queryRunner.query(
      `INSERT INTO "roles" (code, name, description) VALUES ('lab_technician', 'Operador de Laboratorio', 'Rol para operadores de laboratorio')`,
    );
    await queryRunner.query(
      `INSERT INTO "roles" (code, name, description) VALUES ('director', 'Director', 'Rol para directores')`,
    );
    await queryRunner.query(
      `INSERT INTO "roles" (code, name, description) VALUES ('admin', 'Admin', 'Rol para administradores')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TYPE "public"."role_code_enum"`);
  }
}
