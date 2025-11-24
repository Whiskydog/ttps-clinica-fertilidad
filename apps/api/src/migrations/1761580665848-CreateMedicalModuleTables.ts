import { MigrationInterface, QueryRunner } from "typeorm";

export class General1761580665848 implements MigrationInterface {
    name = 'General1761580665848'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "medical_insurances" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(150) NOT NULL, CONSTRAINT "PK_56af71f23aa4bcd2ab1bf10c00b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "medical_histories" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "creation_date" TIMESTAMP NOT NULL DEFAULT now(), "physical_exam_notes" text, "family_backgrounds" text, "patient_id" integer NOT NULL, CONSTRAINT "UQ_346f79a689d013533a8b6f1c7dd" UNIQUE ("patient_id"), CONSTRAINT "PK_8b0170de8abb52639e20c046533" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."initial_objective" AS ENUM('gametos_propios', 'couple_female', 'method_ropa', 'woman_single', 'preservation_ovocytes_embryos')`);
        await queryRunner.query(`CREATE TYPE "public"."treatment_status" AS ENUM('vigente', 'closed', 'completed')`);
        await queryRunner.query(`CREATE TABLE "treatments" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "initial_objective" "public"."initial_objective" NOT NULL, "start_date" date, "status" "public"."treatment_status" NOT NULL DEFAULT 'vigente', "closure_reason" character varying(255), "closure_date" date, "medical_history_id" integer, "initial_doctor_id" integer, CONSTRAINT "PK_133f26d52c70b9fa3c2dbb3c89e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "table_name" character varying NOT NULL, "record_id" text NOT NULL, "modified_field" character varying NOT NULL, "old_value" text, "new_value" text, "modified_by_user_id" integer, "user_role" character varying NOT NULL, "modification_timestamp" TIMESTAMP NOT NULL, CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "coverage_member_id" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "medical_insurance_id" integer`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_ed301d1106038265c22dfc5e8bb" FOREIGN KEY ("medical_insurance_id") REFERENCES "medical_insurances"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_histories" ADD CONSTRAINT "FK_346f79a689d013533a8b6f1c7dd" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "treatments" ADD CONSTRAINT "FK_ef7e9a7f04666dd58df19c67e14" FOREIGN KEY ("medical_history_id") REFERENCES "medical_histories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "treatments" ADD CONSTRAINT "FK_02094d7cf5c4f643866907a218c" FOREIGN KEY ("initial_doctor_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "treatments" DROP CONSTRAINT "FK_02094d7cf5c4f643866907a218c"`);
        await queryRunner.query(`ALTER TABLE "treatments" DROP CONSTRAINT "FK_ef7e9a7f04666dd58df19c67e14"`);
        await queryRunner.query(`ALTER TABLE "medical_histories" DROP CONSTRAINT "FK_346f79a689d013533a8b6f1c7dd"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_ed301d1106038265c22dfc5e8bb"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "medical_insurance_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "coverage_member_id"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TABLE "treatments"`);
        await queryRunner.query(`DROP TYPE "public"."treatment_status"`);
        await queryRunner.query(`DROP TYPE "public"."initial_objective"`);
        await queryRunner.query(`DROP TABLE "medical_histories"`);
        await queryRunner.query(`DROP TABLE "medical_insurances"`);
    }

}
