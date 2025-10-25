import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMedicalHistories1761336000001 implements MigrationInterface {
  name = 'CreateMedicalHistories1761336000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
            {
              name: 'patient_id',
              type: 'bigint',
              isUnique: true,
              isNullable: false,
            },
            {
              name: 'creation_date',
              type: 'timestamptz',
              isNullable: false,
              default: 'CURRENT_TIMESTAMP',
            },
            { name: 'physical_exam_notes', type: 'text', isNullable: true },
            { name: 'family_backgrounds', type: 'text', isNullable: true },
          ],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasMH = await queryRunner.hasTable('medical_histories');
    if (hasMH) await queryRunner.dropTable('medical_histories');
  }
}
