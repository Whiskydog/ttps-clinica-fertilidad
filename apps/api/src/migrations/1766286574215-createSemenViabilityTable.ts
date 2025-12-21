import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSemenViabilityTable1766286574215 implements MigrationInterface {
    name = 'CreateSemenViabilityTable1766286574215'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."semen_viability_status_enum" AS ENUM('pending', 'viable', 'not_viable')`);
        await queryRunner.query(`CREATE TABLE "semen_viability" ("partnerDni" character varying(20) NOT NULL, "status" "public"."semen_viability_status_enum" NOT NULL DEFAULT 'pending', "validationDate" TIMESTAMP, "notes" text, "validatedBy" character varying(100), "studyReference" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b550e23c28f0a8aecb7406f8680" PRIMARY KEY ("partnerDni"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "semen_viability"`);
        await queryRunner.query(`DROP TYPE "public"."semen_viability_status_enum"`);
    }

}
