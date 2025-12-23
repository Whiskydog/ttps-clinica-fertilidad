import { MigrationInterface, QueryRunner } from "typeorm";

export class MonitoringMigrations1766522170565 implements MigrationInterface {
    name = 'MonitoringMigrations1766522170565'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_ec2d7184611331d760b3673ef3"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "UQ_ec2d7184611331d760b3673ef36"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "externalId"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "externalId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "UQ_ec2d7184611331d760b3673ef36" UNIQUE ("externalId")`);
        await queryRunner.query(`ALTER TYPE "public"."treatment_monitoring_plans_status_enum" RENAME TO "treatment_monitoring_plans_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."treatment_monitoring_plans_status_enum" AS ENUM('PLANNED', 'RESERVED', 'COMPLETED', 'CANCELLED')`);
        await queryRunner.query(`ALTER TABLE "treatment_monitoring_plans" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "treatment_monitoring_plans" ALTER COLUMN "status" TYPE "public"."treatment_monitoring_plans_status_enum" USING "status"::"text"::"public"."treatment_monitoring_plans_status_enum"`);
        await queryRunner.query(`ALTER TABLE "treatment_monitoring_plans" ALTER COLUMN "status" SET DEFAULT 'RESERVED'`);
        await queryRunner.query(`DROP TYPE "public"."treatment_monitoring_plans_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "treatment_monitoring_plans" ADD CONSTRAINT "UQ_5606a15e3a6bce1e59b5829d654" UNIQUE ("appointment_id")`);
        await queryRunner.query(`ALTER TYPE "public"."semen_viability_status_enum" RENAME TO "semen_viability_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."semen_viability_status_enum" AS ENUM('pending', 'viable', 'not_viable')`);
        await queryRunner.query(`ALTER TABLE "semen_viability" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "semen_viability" ALTER COLUMN "status" TYPE "public"."semen_viability_status_enum" USING "status"::"text"::"public"."semen_viability_status_enum"`);
        await queryRunner.query(`ALTER TABLE "semen_viability" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."semen_viability_status_enum_old"`);
        await queryRunner.query(`CREATE INDEX "IDX_ec2d7184611331d760b3673ef3" ON "appointments" ("externalId") `);
        await queryRunner.query(`ALTER TABLE "treatment_monitoring_plans" ADD CONSTRAINT "FK_5606a15e3a6bce1e59b5829d654" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "treatment_monitoring_plans" DROP CONSTRAINT "FK_5606a15e3a6bce1e59b5829d654"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ec2d7184611331d760b3673ef3"`);
        await queryRunner.query(`CREATE TYPE "public"."semen_viability_status_enum_old" AS ENUM('pending', 'viable', 'not_viable')`);
        await queryRunner.query(`ALTER TABLE "semen_viability" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "semen_viability" ALTER COLUMN "status" TYPE "public"."semen_viability_status_enum_old" USING "status"::"text"::"public"."semen_viability_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "semen_viability" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."semen_viability_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."semen_viability_status_enum_old" RENAME TO "semen_viability_status_enum"`);
        await queryRunner.query(`ALTER TABLE "treatment_monitoring_plans" DROP CONSTRAINT "UQ_5606a15e3a6bce1e59b5829d654"`);
        await queryRunner.query(`CREATE TYPE "public"."treatment_monitoring_plans_status_enum_old" AS ENUM('PENDING', 'RESERVED', 'COMPLETED', 'CANCELLED', 'PLANNED')`);
        await queryRunner.query(`ALTER TABLE "treatment_monitoring_plans" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "treatment_monitoring_plans" ALTER COLUMN "status" TYPE "public"."treatment_monitoring_plans_status_enum_old" USING "status"::"text"::"public"."treatment_monitoring_plans_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "treatment_monitoring_plans" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."treatment_monitoring_plans_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."treatment_monitoring_plans_status_enum_old" RENAME TO "treatment_monitoring_plans_status_enum"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "UQ_ec2d7184611331d760b3673ef36"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "externalId"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "externalId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "UQ_ec2d7184611331d760b3673ef36" UNIQUE ("externalId")`);
        await queryRunner.query(`CREATE INDEX "IDX_ec2d7184611331d760b3673ef3" ON "appointments" ("externalId") `);
    }

}
