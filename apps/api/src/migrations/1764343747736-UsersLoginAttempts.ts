import { MigrationInterface, QueryRunner } from "typeorm";

export class UsersLoginAttempts1764343747736 implements MigrationInterface {
    name = 'UsersLoginAttempts1764343747736'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "failed_login_attempts" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "locked_until" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "last_failed_login" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_failed_login"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "locked_until"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "failed_login_attempts"`);
    }

}
