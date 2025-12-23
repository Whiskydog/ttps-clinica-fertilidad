import { MigrationInterface, QueryRunner } from 'typeorm';
export class AddPlannedToMonitoringPlanStatus1799886565656
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "public"."treatment_monitoring_plans_status_enum"
      ADD VALUE IF NOT EXISTS 'PLANNED'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No es posible eliminar un valor de un enum en PostgreSQL
  }
}
