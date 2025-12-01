import { MigrationInterface, QueryRunner } from "typeorm";

export class CultivatedState1764453101595 implements MigrationInterface {
    name = 'CultivatedState1764453101595'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."oocyte_state_enum" ADD VALUE 'cultivated'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Note: PostgreSQL does not support removing values from enums easily.
        // In development, you may need to manually handle this or recreate the enum.
    }

}
