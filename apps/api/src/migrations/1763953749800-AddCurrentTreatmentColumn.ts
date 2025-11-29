import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCurrentTreatmentColumn1763953749800 implements MigrationInterface {
    name = 'AddCurrentTreatmentColumn1763953749800'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "medical_histories" ADD "current_treatment_id" integer`);
        await queryRunner.query(`ALTER TABLE "medical_histories" ADD CONSTRAINT "UQ_67c37ba24756b82664482dcbefd" UNIQUE ("current_treatment_id")`);
        await queryRunner.query(`ALTER TABLE "medical_histories" ADD CONSTRAINT "FK_67c37ba24756b82664482dcbefd" FOREIGN KEY ("current_treatment_id") REFERENCES "treatments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "medical_histories" DROP CONSTRAINT "FK_67c37ba24756b82664482dcbefd"`);
        await queryRunner.query(`ALTER TABLE "medical_histories" DROP CONSTRAINT "UQ_67c37ba24756b82664482dcbefd"`);
        await queryRunner.query(`ALTER TABLE "medical_histories" DROP COLUMN "current_treatment_id"`);
    }

}
