import { MigrationInterface, QueryRunner } from "typeorm";

export class EnrichAppointment1765739503381 implements MigrationInterface {
    name = 'EnrichAppointment1765739503381'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" ADD "date" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "medical_history_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_6668a5a122e788621757bd03a4c" FOREIGN KEY ("medical_history_id") REFERENCES "medical_histories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_6668a5a122e788621757bd03a4c"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "medical_history_id"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "date"`);
    }

}
