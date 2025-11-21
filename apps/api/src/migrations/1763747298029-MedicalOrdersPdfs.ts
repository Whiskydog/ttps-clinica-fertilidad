import { MigrationInterface, QueryRunner } from "typeorm";

export class MedicalOrdersPdfs1763747298029 implements MigrationInterface {
    name = 'MedicalOrdersPdfs1763747298029'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "medical_orders" ADD "pdf_url" text`);
        await queryRunner.query(`ALTER TABLE "medical_orders" ADD "pdf_generated_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "study_results" ADD "study_type" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "study_results" ADD "structured_values" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "study_results" DROP COLUMN "structured_values"`);
        await queryRunner.query(`ALTER TABLE "study_results" DROP COLUMN "study_type"`);
        await queryRunner.query(`ALTER TABLE "medical_orders" DROP COLUMN "pdf_generated_at"`);
        await queryRunner.query(`ALTER TABLE "medical_orders" DROP COLUMN "pdf_url"`);
    }

}
