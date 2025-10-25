import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTreatments1761332000002 implements MigrationInterface {
  name = 'CreateTreatments1761332000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasMH = await queryRunner.hasTable('medical_histories');
    if (!hasMH)
      throw new Error('medical_histories must exist before treatments');

    await queryRunner.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'initial_objective') THEN
        CREATE TYPE "public"."initial_objective" AS ENUM ('gametos_propios', 'couple_female', 'method_ropa', 'woman_single', 'preservation_ovocytes_embryos');
      END IF; END $$;`);
    await queryRunner.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'treatment_status') THEN
        CREATE TYPE "public"."treatment_status" AS ENUM ('vigente', 'closed', 'completed');
      END IF; END $$;`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "treatments" (
      "id" BIGINT PRIMARY KEY,
      "medical_history_id" BIGINT NOT NULL,
      "initial_objective" "public"."initial_objective" NOT NULL,
      "start_date" DATE NULL,
      "initial_doctor_id" BIGINT NULL,
      "status" "public"."treatment_status" NOT NULL DEFAULT 'vigente',
      "closure_reason" VARCHAR(255) NULL,
      "closure_date" DATE NULL,
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "deleted_at" TIMESTAMPTZ NULL,
      CONSTRAINT "FK_treatments_medical_history_id" FOREIGN KEY ("medical_history_id") REFERENCES "medical_histories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "treatments"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."treatment_status"');
    await queryRunner.query('DROP TYPE IF EXISTS "public"."initial_objective"');
  }
}
