import { MigrationInterface, QueryRunner } from "typeorm";

export class SemenSourceUpdate1766285691212 implements MigrationInterface {
    name = 'SemenSourceUpdate1766285691212'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."semen_source_enum" RENAME TO "semen_source_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."semen_source_enum" AS ENUM('own', 'donated', 'cryopreserved')`);
        await queryRunner.query(`ALTER TABLE "embryos" ALTER COLUMN "semen_source" TYPE "public"."semen_source_enum" USING "semen_source"::"text"::"public"."semen_source_enum"`);
        await queryRunner.query(`DROP TYPE "public"."semen_source_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."semen_source_enum_old" AS ENUM('own', 'donated')`);
        await queryRunner.query(`ALTER TABLE "embryos" ALTER COLUMN "semen_source" TYPE "public"."semen_source_enum_old" USING "semen_source"::"text"::"public"."semen_source_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."semen_source_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."semen_source_enum_old" RENAME TO "semen_source_enum"`);
    }

}
