import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePartnerAndGynecologicalTables1761940797304
  implements MigrationInterface
{
  name = 'CreatePartnerAndGynecologicalTables1761940797304';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "partner_data" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "biological_sex" "public"."biological_sex_enum" NOT NULL, "first_name" character varying(100), "last_name" character varying(100), "dni" character varying(20), "birth_date" date, "occupation" character varying(100), "phone" character varying(50), "email" character varying(255), "genital_backgrounds" text, "is_active" boolean NOT NULL DEFAULT true, "medical_history_id" integer NOT NULL, CONSTRAINT "PK_f666ae85a07cf7a5bb197c31334" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."cycle_regularity_enum" AS ENUM('regular', 'irregular')`,
    );
    await queryRunner.query(
      `CREATE TABLE "gynecological_history" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "menarche_age" smallint, "cycle_regularity" "public"."cycle_regularity_enum", "cycle_duration_days" smallint, "bleeding_characteristics" text, "gestations" smallint, "births" smallint, "abortions" smallint, "ectopic_pregnancies" smallint, "medical_history_id" integer NOT NULL, "partner_data_id" integer, CONSTRAINT "PK_a747339cf42e84f59ee731d5f82" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "partner_data" ADD CONSTRAINT "FK_2ce10593ddd7ce77c1c8f0287c2" FOREIGN KEY ("medical_history_id") REFERENCES "medical_histories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gynecological_history" ADD CONSTRAINT "FK_667492033180b45eb4496ccaf42" FOREIGN KEY ("medical_history_id") REFERENCES "medical_histories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gynecological_history" ADD CONSTRAINT "FK_70af7979f633b042ad9e2b17770" FOREIGN KEY ("partner_data_id") REFERENCES "partner_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gynecological_history" DROP CONSTRAINT "FK_70af7979f633b042ad9e2b17770"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gynecological_history" DROP CONSTRAINT "FK_667492033180b45eb4496ccaf42"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partner_data" DROP CONSTRAINT "FK_2ce10593ddd7ce77c1c8f0287c2"`,
    );
    await queryRunner.query(`DROP TABLE "gynecological_history"`);
    await queryRunner.query(`DROP TYPE "public"."cycle_regularity_enum"`);
    await queryRunner.query(`DROP TABLE "partner_data"`);
  }
}
