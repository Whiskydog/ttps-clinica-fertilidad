import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentOrderTable1766378170257 implements MigrationInterface {
    name = 'AddPaymentOrderTable1766378170257'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_f200052bd0842d9c8a19cc6d37"`);
        await queryRunner.query(`CREATE TABLE "payment_order" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "external_id" integer NOT NULL, "insurance_due" integer NOT NULL, "patient_due" integer NOT NULL, "treatment_id" integer, "medical_insurance_external_id" integer, "patient_id" integer, CONSTRAINT "UQ_2b0a6d68d65c9b9503f421d0e7f" UNIQUE ("external_id"), CONSTRAINT "REL_8752fcc6631a44f98ef6f3ad3b" UNIQUE ("treatment_id"), CONSTRAINT "PK_f5221735ace059250daac9d9803" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2b0a6d68d65c9b9503f421d0e7" ON "payment_order" ("external_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_5f36e8dbd1b607e096221b2937" ON "medical_insurances" ("external_id") `);
        await queryRunner.query(`ALTER TABLE "payment_order" ADD CONSTRAINT "FK_8752fcc6631a44f98ef6f3ad3b7" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_order" ADD CONSTRAINT "FK_f169e632369f086df4347bdadec" FOREIGN KEY ("medical_insurance_external_id") REFERENCES "medical_insurances"("external_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_order" ADD CONSTRAINT "FK_ccdba3db75c0774cdcf288c5c58" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_order" DROP CONSTRAINT "FK_ccdba3db75c0774cdcf288c5c58"`);
        await queryRunner.query(`ALTER TABLE "payment_order" DROP CONSTRAINT "FK_f169e632369f086df4347bdadec"`);
        await queryRunner.query(`ALTER TABLE "payment_order" DROP CONSTRAINT "FK_8752fcc6631a44f98ef6f3ad3b7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5f36e8dbd1b607e096221b2937"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2b0a6d68d65c9b9503f421d0e7"`);
        await queryRunner.query(`DROP TABLE "payment_order"`);
        await queryRunner.query(`CREATE INDEX "IDX_f200052bd0842d9c8a19cc6d37" ON "medical_insurances" ("external_id") `);
    }

}
