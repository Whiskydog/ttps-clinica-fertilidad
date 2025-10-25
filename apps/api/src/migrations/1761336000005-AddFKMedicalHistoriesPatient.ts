import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class AddFKMedicalHistoriesPatient1761336000005
  implements MigrationInterface
{
  name = 'AddFKMedicalHistoriesPatient1761336000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasMH = await queryRunner.hasTable('medical_histories');
    const hasPD = await queryRunner.hasTable('patient_details');
    if (!hasMH || !hasPD) return;
    const table = await queryRunner.getTable('medical_histories');
    const existingFk = table?.foreignKeys.find((fk) =>
      fk.columnNames.includes('patient_id'),
    );
    if (!existingFk) {
      await queryRunner.createForeignKey(
        'medical_histories',
        new TableForeignKey({
          name: 'FK_medical_histories_patient_id_patient_details_id',
          columnNames: ['patient_id'],
          referencedTableName: 'patient_details',
          referencedColumnNames: ['id'],
          onDelete: 'RESTRICT',
          onUpdate: 'NO ACTION',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasMH = await queryRunner.hasTable('medical_histories');
    if (!hasMH) return;
    const table = await queryRunner.getTable('medical_histories');
    const fk = table?.foreignKeys.find(
      (fk) => fk.name === 'FK_medical_histories_patient_id_patient_details_id',
    );
    if (fk) {
      await queryRunner.dropForeignKey('medical_histories', fk);
    }
  }
}
