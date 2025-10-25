import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePatients1761331500000 implements MigrationInterface {
  name = 'CreatePatients1761331500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'biological_sex_enum') THEN
        CREATE TYPE "public"."biological_sex_enum" AS ENUM('male', 'female', 'intersex');
      END IF; END $$;`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "patient" (
      "id" BIGINT PRIMARY KEY,
      "user_id" BIGINT UNIQUE NOT NULL,
      "dni" VARCHAR UNIQUE NOT NULL,
      "date_of_birth" DATE NOT NULL,
      "occupation" VARCHAR NOT NULL,
      "biological_sex" "public"."biological_sex_enum" NOT NULL,
      "medical_insurance_id" BIGINT NULL,
      "coverage_member_id" VARCHAR(100) NULL,
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "deleted_at" TIMESTAMPTZ NULL,
      CONSTRAINT "FK_patient_user_id_users_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    );`);

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_patient_medins_coverage" ON "patient" ("medical_insurance_id", "coverage_member_id") WHERE medical_insurance_id IS NOT NULL AND coverage_member_id IS NOT NULL;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "UQ_patient_medins_coverage"',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "patient"');
    await queryRunner.query(
      'DROP TYPE IF EXISTS "public"."biological_sex_enum"',
    );
  }
}
