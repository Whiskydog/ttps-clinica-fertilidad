import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPatientAddress1761700737194 implements MigrationInterface {
  name = 'AddPatientAddress1761700737194';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "address" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
  }
}
