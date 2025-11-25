import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeReasonForVisitEnumName1763961469301 implements MigrationInterface {
    name = 'ChangeReasonForVisitEnumName1763961469301'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."reason_for_appointment" RENAME TO "reason_for_appointment_old"`);
        await queryRunner.query(`CREATE TYPE "public"."reason_for_visit" AS ENUM('initial-consultation', 'stimulation-monitoring', 'egg-retrieval', 'embryo-transfer')`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "reason" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "reason" TYPE "public"."reason_for_visit" USING "reason"::"text"::"public"."reason_for_visit"`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "reason" SET DEFAULT 'initial-consultation'`);
        await queryRunner.query(`DROP TYPE "public"."reason_for_appointment_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."reason_for_appointment_old" AS ENUM('initial-consultation', 'stimulation-monitoring', 'egg-retrieval', 'embryo-transfer')`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "reason" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "reason" TYPE "public"."reason_for_appointment_old" USING "reason"::"text"::"public"."reason_for_appointment_old"`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "reason" SET DEFAULT 'initial-consultation'`);
        await queryRunner.query(`DROP TYPE "public"."reason_for_visit"`);
        await queryRunner.query(`ALTER TYPE "public"."reason_for_appointment_old" RENAME TO "reason_for_appointment"`);
    }

}
