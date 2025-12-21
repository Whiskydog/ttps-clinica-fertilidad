import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class DoctorSignature1765729237911 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'signature_uri',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'signature_uri');
  }
}
