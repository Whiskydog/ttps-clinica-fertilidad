import { MigrationInterface, QueryRunner } from "typeorm";

export class MedicationPdfs1764709557548 implements MigrationInterface {
    name = 'MedicationPdfs1764709557548'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Solo agregar campos de PDF al protocolo de medicación
        await queryRunner.query(`ALTER TABLE "medication_protocols" ADD IF NOT EXISTS "pdf_url" text`);
        await queryRunner.query(`ALTER TABLE "medication_protocols" ADD IF NOT EXISTS "pdf_generated_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "medication_protocols" DROP COLUMN IF EXISTS "pdf_generated_at"`);
        await queryRunner.query(`ALTER TABLE "medication_protocols" DROP COLUMN IF EXISTS "pdf_url"`);
    }

}
