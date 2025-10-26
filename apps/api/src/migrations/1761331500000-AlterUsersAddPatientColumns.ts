import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUsersAddPatientColumns1761331500000
  implements MigrationInterface
{
  name = 'AlterUsersAddPatientColumns1761331500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Move patient-specific columns into the single "users" table (STI)
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "medical_insurance_id" INTEGER NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "coverage_member_id" VARCHAR(100) NULL`,
    );
    // Add FK to medical_insurances if not exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints tc
          WHERE tc.constraint_name = 'FK_users_medical_insurance_id'
        ) THEN
          ALTER TABLE "users"
          ADD CONSTRAINT "FK_users_medical_insurance_id"
          FOREIGN KEY ("medical_insurance_id")
          REFERENCES "medical_insurances"("id")
          ON DELETE SET NULL
          ON UPDATE NO ACTION;
        END IF;
      END
      $$;
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_user_medins_coverage" ON "users" ("medical_insurance_id", "coverage_member_id") WHERE medical_insurance_id IS NOT NULL AND coverage_member_id IS NOT NULL;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "UQ_user_medins_coverage"');
    await queryRunner.query(
      'ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_medical_insurance_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "users" DROP COLUMN IF EXISTS "coverage_member_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "users" DROP COLUMN IF EXISTS "medical_insurance_id"',
    );
  }
}
