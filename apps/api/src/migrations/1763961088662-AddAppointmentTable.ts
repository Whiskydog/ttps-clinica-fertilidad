import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAppointmentTable1763961088662 implements MigrationInterface {
    name = 'AddAppointmentTable1763961088662'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."reason_for_appointment" AS ENUM('initial-consultation', 'stimulation-monitoring', 'egg-retrieval', 'embryo-transfer')`);
        await queryRunner.query(`CREATE TABLE "appointments" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "externalId" character varying NOT NULL, "reason" "public"."reason_for_appointment" NOT NULL DEFAULT 'initial-consultation', "treatment_id" integer, "doctor_id" integer NOT NULL, CONSTRAINT "UQ_ec2d7184611331d760b3673ef36" UNIQUE ("externalId"), CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ec2d7184611331d760b3673ef3" ON "appointments" ("externalId") `);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_7bb12179740e7574318004c2f89" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_4cf26c3f972d014df5c68d503d2" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_4cf26c3f972d014df5c68d503d2"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_7bb12179740e7574318004c2f89"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ec2d7184611331d760b3673ef3"`);
        await queryRunner.query(`DROP TABLE "appointments"`);
        await queryRunner.query(`DROP TYPE "public"."reason_for_appointment"`);
    }

}
