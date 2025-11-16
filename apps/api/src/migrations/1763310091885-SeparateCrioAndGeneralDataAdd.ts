import { MigrationInterface, QueryRunner } from "typeorm";

export class SeparateCrioAndGeneralDataAdd1763310091885 implements MigrationInterface {
    name = 'SeparateCrioAndGeneralDataAdd1763310091885'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "habits" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "cigarettes_per_day" smallint, "years_smoking" smallint, "pack_days_value" numeric(6,2), "alcohol_consumption" text, "recreational_drugs" character varying(255), "medical_history_id" integer NOT NULL, CONSTRAINT "PK_b3ec33c2d7af69d09fcf4af7e39" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "fenotypes" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "eye_color" character varying(50), "hair_color" character varying(50), "hair_type" character varying(50), "height" numeric(5,2), "complexion" character varying(20), "ethnicity" character varying(100), "medical_history_id" integer NOT NULL, "partner_data_id" integer, CONSTRAINT "PK_275ffdfaacd6b2c5397d3b87884" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."background_type_enum" AS ENUM('clinical', 'surgical')`);
        await queryRunner.query(`CREATE TABLE "backgrounds" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "term_code" character varying(50), "background_type" "public"."background_type_enum" NOT NULL, "medical_history_id" integer NOT NULL, CONSTRAINT "PK_a5457d0aae72f18efc3cdf6e6bb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."milestone_type_enum" AS ENUM('beta_test', 'sac_present', 'clinical_pregnancy', 'live_birth')`);
        await queryRunner.query(`CREATE TABLE "post_transfer_milestones" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "milestone_type" "public"."milestone_type_enum" NOT NULL, "result" character varying(20), "milestone_date" date, "treatment_id" integer NOT NULL, "registered_by_doctor_id" integer, CONSTRAINT "PK_3473f6bd4fb6829f50365e33782" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "informed_consent" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "pdf_uri" text, "signature_date" date, "treatment_id" integer NOT NULL, "uploaded_by_user_id" integer, CONSTRAINT "REL_110428e37bebcd24dc8b68c9bd" UNIQUE ("treatment_id"), CONSTRAINT "PK_e31bc97d25e0b777c3ecad696bf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "medical_coverage" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "coverage_percentage" numeric(5,2), "patient_due" numeric(10,2), "insurance_due" numeric(10,2), "medical_insurance_id" integer NOT NULL, "treatment_id" integer NOT NULL, CONSTRAINT "REL_7b7c5600588b74f91eeb813716" UNIQUE ("treatment_id"), CONSTRAINT "PK_4a87bcd14845097ac423b8ce5fd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "study_results" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "study_name" character varying(255), "determination_name" character varying(255), "transcription" text, "original_pdf_uri" text, "transcription_date" TIMESTAMP, "medical_order_id" integer NOT NULL, "transcribed_by_lab_technician_id" integer, CONSTRAINT "PK_bf5d53356b03af9ae3083ba7113" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "puncture_records" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "puncture_date_time" TIMESTAMP, "operating_room_number" bigint, "observations" text, "treatment_id" integer NOT NULL, "lab_technician_id" integer, CONSTRAINT "PK_264ce794e8291e49765426a573e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."oocyte_state_enum" AS ENUM('very_immature', 'immature', 'mature')`);
        await queryRunner.query(`CREATE TABLE "oocytes" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "unique_identifier" character varying(50) NOT NULL, "current_state" "public"."oocyte_state_enum" NOT NULL, "is_cryopreserved" boolean NOT NULL DEFAULT false, "cryo_tank" character varying(50), "cryo_rack" character varying(50), "cryo_tube" character varying(50), "discard_cause" text, "discard_date_time" TIMESTAMP, "puncture_id" integer NOT NULL, CONSTRAINT "UQ_325616ec0efa80bdcd556cf471d" UNIQUE ("unique_identifier"), CONSTRAINT "PK_5ebd4b713ae8dac6241a6b7c581" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "oocyte_state_history" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "previous_state" "public"."oocyte_state_enum", "new_state" "public"."oocyte_state_enum" NOT NULL, "transition_date" TIMESTAMP NOT NULL, "oocyte_id" integer NOT NULL, CONSTRAINT "PK_1286ce9bd4a739c3d58d8f582f8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."fertilization_technique_enum" AS ENUM('FIV', 'ICSI')`);
        await queryRunner.query(`CREATE TYPE "public"."semen_source_enum" AS ENUM('own', 'donated')`);
        await queryRunner.query(`CREATE TYPE "public"."pgt_result_enum" AS ENUM('ok', 'not_ok', 'pending')`);
        await queryRunner.query(`CREATE TYPE "public"."embryo_disposition_enum" AS ENUM('cryopreserved', 'transferred', 'discarded')`);
        await queryRunner.query(`CREATE TABLE "embryos" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "unique_identifier" character varying(50) NOT NULL, "fertilization_date" date, "fertilization_technique" "public"."fertilization_technique_enum", "quality_score" smallint, "semen_source" "public"."semen_source_enum", "donation_id_used" character varying(50), "pgt_decision_suggested" character varying(50), "pgt_result" "public"."pgt_result_enum", "final_disposition" "public"."embryo_disposition_enum", "cryo_tank" character varying(50), "cryo_rack" character varying(50), "cryo_tube" character varying(50), "discard_cause" text, "oocyte_origin_id" integer NOT NULL, "technician_id" integer, CONSTRAINT "UQ_4db5797ac1b94952f40a833c9e7" UNIQUE ("unique_identifier"), CONSTRAINT "PK_b8360c87dde2cec7160309480e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "medical_orders" DROP COLUMN "results"`);
        await queryRunner.query(`ALTER TABLE "habits" ADD CONSTRAINT "FK_185903ed3121e887de2b7735ad1" FOREIGN KEY ("medical_history_id") REFERENCES "medical_histories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fenotypes" ADD CONSTRAINT "FK_942b075a2d2f57f80b9e79a94b8" FOREIGN KEY ("medical_history_id") REFERENCES "medical_histories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fenotypes" ADD CONSTRAINT "FK_64257b46175f32f1aad86e20eb4" FOREIGN KEY ("partner_data_id") REFERENCES "partner_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "backgrounds" ADD CONSTRAINT "FK_845a093efdc2635ee52fa4902d5" FOREIGN KEY ("medical_history_id") REFERENCES "medical_histories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_transfer_milestones" ADD CONSTRAINT "FK_dbdf5b5eaa5470e68002773a777" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_transfer_milestones" ADD CONSTRAINT "FK_9dbaf366e4a14e134d54e7edc5d" FOREIGN KEY ("registered_by_doctor_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "informed_consent" ADD CONSTRAINT "FK_110428e37bebcd24dc8b68c9bdf" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "informed_consent" ADD CONSTRAINT "FK_8fda3a8e48666824b11d2f93133" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_coverage" ADD CONSTRAINT "FK_8e000148698e21ff5adf84f681d" FOREIGN KEY ("medical_insurance_id") REFERENCES "medical_insurances"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_coverage" ADD CONSTRAINT "FK_7b7c5600588b74f91eeb813716b" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "study_results" ADD CONSTRAINT "FK_bb2dae0837fef6c306fb19379bd" FOREIGN KEY ("medical_order_id") REFERENCES "medical_orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "study_results" ADD CONSTRAINT "FK_f93f1aa6962510538f566e9bfcb" FOREIGN KEY ("transcribed_by_lab_technician_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "puncture_records" ADD CONSTRAINT "FK_33ff45edb14736cadcaacb53742" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "puncture_records" ADD CONSTRAINT "FK_3d02e1648b8faf7ebba8fb4948c" FOREIGN KEY ("lab_technician_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "oocytes" ADD CONSTRAINT "FK_b28ef02952ab6b07472dbab695d" FOREIGN KEY ("puncture_id") REFERENCES "puncture_records"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "oocyte_state_history" ADD CONSTRAINT "FK_0c025bba3e8c250b56238c8c479" FOREIGN KEY ("oocyte_id") REFERENCES "oocytes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "embryos" ADD CONSTRAINT "FK_9af292561812f23a2aa1a0fbb6d" FOREIGN KEY ("oocyte_origin_id") REFERENCES "oocytes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "embryos" ADD CONSTRAINT "FK_62d98520587c0059e0e7ee5122f" FOREIGN KEY ("technician_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "embryos" DROP CONSTRAINT "FK_62d98520587c0059e0e7ee5122f"`);
        await queryRunner.query(`ALTER TABLE "embryos" DROP CONSTRAINT "FK_9af292561812f23a2aa1a0fbb6d"`);
        await queryRunner.query(`ALTER TABLE "oocyte_state_history" DROP CONSTRAINT "FK_0c025bba3e8c250b56238c8c479"`);
        await queryRunner.query(`ALTER TABLE "oocytes" DROP CONSTRAINT "FK_b28ef02952ab6b07472dbab695d"`);
        await queryRunner.query(`ALTER TABLE "puncture_records" DROP CONSTRAINT "FK_3d02e1648b8faf7ebba8fb4948c"`);
        await queryRunner.query(`ALTER TABLE "puncture_records" DROP CONSTRAINT "FK_33ff45edb14736cadcaacb53742"`);
        await queryRunner.query(`ALTER TABLE "study_results" DROP CONSTRAINT "FK_f93f1aa6962510538f566e9bfcb"`);
        await queryRunner.query(`ALTER TABLE "study_results" DROP CONSTRAINT "FK_bb2dae0837fef6c306fb19379bd"`);
        await queryRunner.query(`ALTER TABLE "medical_coverage" DROP CONSTRAINT "FK_7b7c5600588b74f91eeb813716b"`);
        await queryRunner.query(`ALTER TABLE "medical_coverage" DROP CONSTRAINT "FK_8e000148698e21ff5adf84f681d"`);
        await queryRunner.query(`ALTER TABLE "informed_consent" DROP CONSTRAINT "FK_8fda3a8e48666824b11d2f93133"`);
        await queryRunner.query(`ALTER TABLE "informed_consent" DROP CONSTRAINT "FK_110428e37bebcd24dc8b68c9bdf"`);
        await queryRunner.query(`ALTER TABLE "post_transfer_milestones" DROP CONSTRAINT "FK_9dbaf366e4a14e134d54e7edc5d"`);
        await queryRunner.query(`ALTER TABLE "post_transfer_milestones" DROP CONSTRAINT "FK_dbdf5b5eaa5470e68002773a777"`);
        await queryRunner.query(`ALTER TABLE "backgrounds" DROP CONSTRAINT "FK_845a093efdc2635ee52fa4902d5"`);
        await queryRunner.query(`ALTER TABLE "fenotypes" DROP CONSTRAINT "FK_64257b46175f32f1aad86e20eb4"`);
        await queryRunner.query(`ALTER TABLE "fenotypes" DROP CONSTRAINT "FK_942b075a2d2f57f80b9e79a94b8"`);
        await queryRunner.query(`ALTER TABLE "habits" DROP CONSTRAINT "FK_185903ed3121e887de2b7735ad1"`);
        await queryRunner.query(`ALTER TABLE "medical_orders" ADD "results" text`);
        await queryRunner.query(`DROP TABLE "embryos"`);
        await queryRunner.query(`DROP TYPE "public"."embryo_disposition_enum"`);
        await queryRunner.query(`DROP TYPE "public"."pgt_result_enum"`);
        await queryRunner.query(`DROP TYPE "public"."semen_source_enum"`);
        await queryRunner.query(`DROP TYPE "public"."fertilization_technique_enum"`);
        await queryRunner.query(`DROP TABLE "oocyte_state_history"`);
        await queryRunner.query(`DROP TYPE "public"."oocyte_state_enum"`);
        await queryRunner.query(`DROP TABLE "oocytes"`);
        await queryRunner.query(`DROP TYPE "public"."oocyte_state_enum"`);
        await queryRunner.query(`DROP TABLE "puncture_records"`);
        await queryRunner.query(`DROP TABLE "study_results"`);
        await queryRunner.query(`DROP TABLE "medical_coverage"`);
        await queryRunner.query(`DROP TABLE "informed_consent"`);
        await queryRunner.query(`DROP TABLE "post_transfer_milestones"`);
        await queryRunner.query(`DROP TYPE "public"."milestone_type_enum"`);
        await queryRunner.query(`DROP TABLE "backgrounds"`);
        await queryRunner.query(`DROP TYPE "public"."background_type_enum"`);
        await queryRunner.query(`DROP TABLE "fenotypes"`);
        await queryRunner.query(`DROP TABLE "habits"`);
    }

}
