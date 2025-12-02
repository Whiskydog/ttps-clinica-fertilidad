import { MigrationInterface, QueryRunner } from 'typeorm';

export class OocyteState1763952571007 implements MigrationInterface {
  name = 'OocyteState1763952571007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "oocyte_state_history" ADD "cause" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "oocyte_state_history" DROP COLUMN "cause"`,
    );
  }
}
