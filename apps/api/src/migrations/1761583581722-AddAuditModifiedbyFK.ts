import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuditModifiedbyFk1761583581722 implements MigrationInterface {
    name = 'AddAuditModifiedbyFk1761583581722'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP COLUMN "user_role"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ALTER COLUMN "modified_by_user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_b70d1d8250d4119d41a3048c571" FOREIGN KEY ("modified_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_b70d1d8250d4119d41a3048c571"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ALTER COLUMN "modified_by_user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD "user_role" character varying NOT NULL`);
    }

}
