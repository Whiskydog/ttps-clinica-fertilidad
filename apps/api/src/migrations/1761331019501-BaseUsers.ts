import { MigrationInterface, QueryRunner } from 'typeorm';

export class BaseUsers1761331019501 implements MigrationInterface {
  name = 'BaseUsers1761331019501';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."biological_sex_enum" AS ENUM('male', 'female', 'intersex')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "password_hash" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "dni" character varying, "date_of_birth" TIMESTAMP, "occupation" character varying, "biological_sex" "public"."biological_sex_enum", "lab_area" character varying, "specialty" character varying, "license_number" character varying, "role" "public"."role_code_enum" NOT NULL, CONSTRAINT "UQ_5fe9cfa518b76c96518a206b350" UNIQUE ("dni"), CONSTRAINT "UQ_b3c519df62273e4b1dab7f7d6e5" UNIQUE ("license_number"), CONSTRAINT "UQ_b3c519df62273e4b1dab7f7d6e5" UNIQUE ("license_number"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ace513fa30d485cfd25c11a9e4" ON "users" ("role") `,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_ace513fa30d485cfd25c11a9e4a" FOREIGN KEY ("role") REFERENCES "roles"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_ace513fa30d485cfd25c11a9e4a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ace513fa30d485cfd25c11a9e4"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."biological_sex_enum"`);
  }
}
