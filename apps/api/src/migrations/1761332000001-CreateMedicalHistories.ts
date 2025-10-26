import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMedicalHistories1761332000001 implements MigrationInterface {
  name = 'CreateMedicalHistories1761332000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasMH = await queryRunner.hasTable('medical_histories');
    if (!hasMH) {
      await queryRunner.query(`CREATE TABLE IF NOT EXISTS "medical_histories" (
        "id" SERIAL PRIMARY KEY,
        "patient_id" INTEGER NOT NULL,
        "creation_date" TIMESTAMP NOT NULL DEFAULT now(),
        "physical_exam_notes" TEXT NULL,
        "family_backgrounds" TEXT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP NULL,
        CONSTRAINT "UQ_medical_histories_patient_id" UNIQUE ("patient_id"),
        CONSTRAINT "FK_medical_histories_patient_id_users_id" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      );`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "medical_histories"');
  }
}
