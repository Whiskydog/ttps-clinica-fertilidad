import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePatientDetails1761336000000 implements MigrationInterface {
  name = 'CreatePatientDetails1761336000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const has = await queryRunner.hasTable('patient_details');
    if (!has) {
      await queryRunner.createTable(
        new Table({
          name: 'patient_details',
          columns: [
            {
              name: 'id',
              type: 'bigint',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            { name: 'user_id', type: 'bigint', isNullable: false },
            {
              name: 'dni',
              type: 'varchar',
              length: '20',
              isNullable: false,
              isUnique: true,
            },
            { name: 'date_of_birth', type: 'date', isNullable: false },
            {
              name: 'occupation',
              type: 'varchar',
              length: '100',
              isNullable: true,
            },
            {
              name: 'biological_sex',
              type: 'varchar',
              length: '20',
              isNullable: true,
            },
            { name: 'medical_insurance_id', type: 'bigint', isNullable: true },
            {
              name: 'coverage_member_id',
              type: 'varchar',
              length: '100',
              isNullable: true,
            },
          ],
        }),
      );

      // Unique composite index (medical_insurance_id, coverage_member_id)
      await queryRunner.createIndex(
        'patient_details',
        new TableIndex({
          name: 'UQ_patient_details_insurance_member',
          columnNames: ['medical_insurance_id', 'coverage_member_id'],
          isUnique: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const has = await queryRunner.hasTable('patient_details');
    if (has) {
      await queryRunner.dropIndex(
        'patient_details',
        'UQ_patient_details_insurance_member',
      );
      await queryRunner.dropTable('patient_details');
    }
  }
}
