import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMonitoringPlan1765838257899 implements MigrationInterface {
  name = 'CreateMonitoringPlan1765838257899';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."treatment_monitoring_plans_status_enum" AS ENUM('PENDING', 'RESERVED', 'COMPLETED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "treatment_monitoring_plans" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "treatment_id" integer NOT NULL, "planned_day" integer, "min_date" date NOT NULL, "max_date" date NOT NULL, "status" "public"."treatment_monitoring_plans_status_enum" NOT NULL DEFAULT 'PENDING', "appointment_id" integer, "sequence" integer NOT NULL, CONSTRAINT "PK_56d107a8afadab2c7f8b16d39a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "treatment_monitoring_plans" ADD CONSTRAINT "FK_be6b611943bcfdd4af0ffb810a2" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "treatment_monitoring_plans" DROP CONSTRAINT "FK_be6b611943bcfdd4af0ffb810a2"`,
    );
    await queryRunner.query(`DROP TABLE "treatment_monitoring_plans"`);
    await queryRunner.query(
      `DROP TYPE "public"."treatment_monitoring_plans_status_enum"`,
    );
  }
}
