import { MigrationInterface, QueryRunner } from "typeorm";

export class MedicalInsuranceAddAcronymAndExternalIdToMedicalInsurance1766345790827 implements MigrationInterface {
    name = 'MedicalInsuranceAddAcronymAndExternalIdToMedicalInsurance1766345790827'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "medical_insurances" ADD "acronym" character varying`);
        await queryRunner.query(`ALTER TABLE "medical_insurances" ADD "external_id" integer`);
        await queryRunner.query(`ALTER TABLE "medical_insurances" ADD CONSTRAINT "UQ_f200052bd0842d9c8a19cc6d379" UNIQUE ("external_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_f200052bd0842d9c8a19cc6d37" ON "medical_insurances" ("external_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_f200052bd0842d9c8a19cc6d37"`);
        await queryRunner.query(`ALTER TABLE "medical_insurances" DROP CONSTRAINT "UQ_f200052bd0842d9c8a19cc6d379"`);
        await queryRunner.query(`ALTER TABLE "medical_insurances" DROP COLUMN "external_id"`);
        await queryRunner.query(`ALTER TABLE "medical_insurances" DROP COLUMN "acronym"`);
    }

}
