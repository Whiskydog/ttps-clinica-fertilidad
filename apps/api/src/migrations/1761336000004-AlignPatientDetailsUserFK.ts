import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AlignPatientDetailsUserFK1761336000004
  implements MigrationInterface
{
  name = 'AlignPatientDetailsUserFK1761336000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const has = await queryRunner.hasTable('patient_details');
    if (!has) return;

    // Change user_id to uuid (dev-friendly: drop and add)
    const table = await queryRunner.getTable('patient_details');
    const userIdCol = table?.findColumnByName('user_id');
    if (userIdCol && userIdCol.type !== 'uuid') {
      await queryRunner.dropColumn('patient_details', 'user_id');
      await queryRunner.addColumn(
        'patient_details',
        new TableColumn({ name: 'user_id', type: 'uuid', isNullable: false }),
      );
    }

    // Add FK to users(id)
    const fkName = 'FK_patient_details_user_id_users_id';
    const existingFk = table?.foreignKeys.find((fk) => fk.name === fkName);
    if (!existingFk) {
      await queryRunner.createForeignKey(
        'patient_details',
        new TableForeignKey({
          name: fkName,
          columnNames: ['user_id'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
          onUpdate: 'NO ACTION',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const has = await queryRunner.hasTable('patient_details');
    if (!has) return;
    const table = await queryRunner.getTable('patient_details');
    const fk = table?.foreignKeys.find(
      (fk) => fk.name === 'FK_patient_details_user_id_users_id',
    );
    if (fk) {
      await queryRunner.dropForeignKey('patient_details', fk);
    }
    // revert user_id to bigint (dev-only)
    const userIdCol = table?.findColumnByName('user_id');
    if (userIdCol && userIdCol.type === 'uuid') {
      await queryRunner.dropColumn('patient_details', 'user_id');
      await queryRunner.addColumn(
        'patient_details',
        new TableColumn({ name: 'user_id', type: 'bigint', isNullable: false }),
      );
    }
  }
}
