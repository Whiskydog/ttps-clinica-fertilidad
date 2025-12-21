import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDiscardedOocyteState1766280645391 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."oocyte_state_enum" ADD VALUE 'discarded'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Note: PostgreSQL does not support removing values from enums easily.
        // In development, you may need to manually handle this or recreate the enum.
    }

}
