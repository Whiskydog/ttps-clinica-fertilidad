import { MigrationInterface, QueryRunner } from "typeorm";

export class UsedState1764453712165 implements MigrationInterface {
    name = 'UsedState1764453712165'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."oocyte_state_enum" ADD VALUE 'used'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Note: PostgreSQL does not support removing values from enums easily.
        // In development, you may need to manually handle this or recreate the enum.
    }

}
