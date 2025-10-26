import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMedicalInsurances1761331499000
  implements MigrationInterface
{
  name = 'CreateMedicalInsurances1761331499000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('medical_insurances');
    if (!hasTable) {
      await queryRunner.query(`CREATE TABLE IF NOT EXISTS "medical_insurances" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(150) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP NULL
      );`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "medical_insurances"');
  }
}
