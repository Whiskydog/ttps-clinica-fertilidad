import { MigrationInterface, QueryRunner } from "typeorm";

export class AppointmentExternalIdToNumber1765743518341 implements MigrationInterface {
    name = 'AppointmentExternalIdToNumber1765743518341'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const backups: { id: number; externalId: string }[] = await queryRunner.query(`SELECT "id", "externalId" FROM "appointments"`);

        await queryRunner.query(`DROP INDEX "public"."IDX_ec2d7184611331d760b3673ef3"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "UQ_ec2d7184611331d760b3673ef36"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "externalId"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "externalId" integer`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "UQ_ec2d7184611331d760b3673ef36" UNIQUE ("externalId")`);
        await queryRunner.query(`CREATE INDEX "IDX_ec2d7184611331d760b3673ef3" ON "appointments" ("externalId") `);

        for (const backup of backups) {
            const externalIdNumber = parseInt(backup.externalId, 10);
            if (isNaN(externalIdNumber)) {
                throw new Error(`Cannot convert externalId '${backup.externalId}' to number for appointment id ${backup.id}`);
            }
            await queryRunner.query(`UPDATE "appointments" SET "externalId" = $1 WHERE "id" = $2`, [externalIdNumber, backup.id]);
        }

        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "externalId" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const backups: { id: number; externalId: number }[] = await queryRunner.query(`SELECT "id", "externalId" FROM "appointments"`);

        await queryRunner.query(`DROP INDEX "public"."IDX_ec2d7184611331d760b3673ef3"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "UQ_ec2d7184611331d760b3673ef36"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "externalId"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "externalId" character varying`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "UQ_ec2d7184611331d760b3673ef36" UNIQUE ("externalId")`);
        await queryRunner.query(`CREATE INDEX "IDX_ec2d7184611331d760b3673ef3" ON "appointments" ("externalId") `);

        for (const backup of backups) {
            const externalIdString = backup.externalId.toString();
            await queryRunner.query(`UPDATE "appointments" SET "externalId" = $1 WHERE "id" = $2`, [externalIdString, backup.id]);
        }

        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "externalId" SET NOT NULL`);
    }

}
