import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateMedicalHistories1761332000001 implements MigrationInterface {
  name = 'CreateMedicalHistories1761332000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasPatients = await queryRunner.hasTable('patient');
    if (!hasPatients)
      throw new Error(
        'patient table must exist before creating medical_histories',
      );

    const hasMH = await queryRunner.hasTable('medical_histories');
    if (!hasMH) {
      await queryRunner.createTable(
        new Table({
          name: 'medical_histories',
          columns: [
            {
              name: 'id',
              type: 'bigint',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            { name: 'patient_id', type: 'bigint', isNullable: false },
            {
              name: 'creation_date',
              type: 'timestamptz',
              default: 'CURRENT_TIMESTAMP',
            },
            { name: 'physical_exam_notes', type: 'text', isNullable: true },
            { name: 'family_backgrounds', type: 'text', isNullable: true },
            {
              name: 'created_at',
              type: 'timestamptz',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'updated_at',
              type: 'timestamptz',
              default: 'CURRENT_TIMESTAMP',
            },
            { name: 'deleted_at', type: 'timestamptz', isNullable: true },
          ],
          uniques: [
            {
              name: 'UQ_medical_histories_patient_id',
              columnNames: ['patient_id'],
            },
          ],
        }),
      );

      await queryRunner.createForeignKey(
        'medical_histories',
        new TableForeignKey({
          name: 'FK_medical_histories_patient_id_patient_id',
          columnNames: ['patient_id'],
          referencedTableName: 'patient',
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
      (fk) => fk.name === 'FK_medical_histories_patient_id_patient_id',
    );
    if (fk) await queryRunner.dropForeignKey('medical_histories', fk);
    await queryRunner.dropTable('medical_histories');
  }
}
