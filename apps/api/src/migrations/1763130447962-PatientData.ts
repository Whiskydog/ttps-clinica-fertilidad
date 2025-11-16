import { MigrationInterface, QueryRunner } from "typeorm";

export class PatientData1763130447962 implements MigrationInterface {
    name = 'PatientData1763130447962'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "treatment_monitorings" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "treatment_id" integer NOT NULL, "monitoring_date" date NOT NULL, "day_number" integer, "follicle_count" integer, "follicle_size" character varying(50), "estradiol_level" numeric(10,2), "observations" text, CONSTRAINT "PK_78e6b9a4136ff1955c78788b24f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "medication_protocols" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "treatment_id" integer NOT NULL, "protocol_type" character varying(100) NOT NULL, "drug_name" character varying(255) NOT NULL, "dose" character varying(100) NOT NULL, "administration_route" character varying(50) NOT NULL, "duration" character varying(100), "start_date" date, "additional_medication" jsonb, "consent_signed" boolean NOT NULL DEFAULT false, "consent_date" date, CONSTRAINT "UQ_f62e3113ab4ba1b13156da0594f" UNIQUE ("treatment_id"), CONSTRAINT "REL_f62e3113ab4ba1b13156da0594" UNIQUE ("treatment_id"), CONSTRAINT "PK_23a022b089ac93e04ec91320881" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "doctor_notes" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "treatment_id" integer NOT NULL, "doctor_id" integer NOT NULL, "note_date" date NOT NULL, "note" text NOT NULL, CONSTRAINT "PK_3715445b9f7982ed2dd01f9fd17" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "medical_orders" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "code" character varying(50) NOT NULL, "issue_date" date NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'pending', "category" character varying(100) NOT NULL, "description" text, "studies" jsonb, "diagnosis" character varying(255), "justification" text, "completed_date" date, "results" text, "patient_id" integer NOT NULL, "doctor_id" integer NOT NULL, "treatment_id" integer, CONSTRAINT "UQ_1fa9f4560b0dc16ad60e3d2bb4a" UNIQUE ("code"), CONSTRAINT "PK_e08861432070346df2069a66f97" PRIMARY KEY ("id"))`);
        
        await queryRunner.query(`ALTER TABLE "treatment_monitorings" ADD CONSTRAINT "FK_724f29bce51cd919ec32ceea582" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medication_protocols" ADD CONSTRAINT "FK_f62e3113ab4ba1b13156da0594f" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctor_notes" ADD CONSTRAINT "FK_e5259544007b84d7d76625693b4" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctor_notes" ADD CONSTRAINT "FK_61934aa96c1ccea6b0e8c7ccbb8" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_orders" ADD CONSTRAINT "FK_72abf7249acb437e5805faf5acc" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_orders" ADD CONSTRAINT "FK_c00049106c06d23dbe197ed30f7" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_orders" ADD CONSTRAINT "FK_f9105d817bd9eb4accfa4840153" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.query(`ALTER TABLE "medical_orders" DROP CONSTRAINT "FK_f9105d817bd9eb4accfa4840153"`);
        await queryRunner.query(`ALTER TABLE "medical_orders" DROP CONSTRAINT "FK_c00049106c06d23dbe197ed30f7"`);
        await queryRunner.query(`ALTER TABLE "medical_orders" DROP CONSTRAINT "FK_72abf7249acb437e5805faf5acc"`);
        await queryRunner.query(`ALTER TABLE "doctor_notes" DROP CONSTRAINT "FK_61934aa96c1ccea6b0e8c7ccbb8"`);
        await queryRunner.query(`ALTER TABLE "doctor_notes" DROP CONSTRAINT "FK_e5259544007b84d7d76625693b4"`);
        await queryRunner.query(`ALTER TABLE "medication_protocols" DROP CONSTRAINT "FK_f62e3113ab4ba1b13156da0594f"`);
        await queryRunner.query(`ALTER TABLE "treatment_monitorings" DROP CONSTRAINT "FK_724f29bce51cd919ec32ceea582"`);
        
        await queryRunner.query(`DROP TABLE "medical_orders"`);
        await queryRunner.query(`DROP TABLE "doctor_notes"`);
        await queryRunner.query(`DROP TABLE "medication_protocols"`);
        await queryRunner.query(`DROP TABLE "treatment_monitorings"`);
    }

}
