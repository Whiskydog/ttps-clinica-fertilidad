import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsOvertimeToAppointments1766000000000
  implements MigrationInterface
{
  name = 'AddIsOvertimeToAppointments1766000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "appointments"
      ADD COLUMN "is_overtime" boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "appointments"
      DROP COLUMN "is_overtime"
    `);
  }
}
