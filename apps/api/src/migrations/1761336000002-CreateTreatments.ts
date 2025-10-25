import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateTreatments1761336000002 implements MigrationInterface {
  name = 'CreateTreatments1761336000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // enums for treatments
    await queryRunner.query(
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'initial_objective') THEN CREATE TYPE initial_objective AS ENUM ('gametos_propios','couple_female','method_ropa','woman_single','preservation_ovocytes_embryos'); END IF; END $$;`,
    );
    await queryRunner.query(
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'treatment_status') THEN CREATE TYPE treatment_status AS ENUM ('vigente','closed','completed'); END IF; END $$;`,
    );

    const hasT = await queryRunner.hasTable('treatments');
    if (!hasT) {
      await queryRunner.createTable(
        new Table({
          name: 'treatments',
          columns: [
            {
              name: 'id',
              type: 'bigint',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            { name: 'medical_history_id', type: 'bigint', isNullable: false },
            {
              name: 'initial_objective',
              type: 'initial_objective',
              isNullable: false,
            },
            { name: 'start_date', type: 'date', isNullable: true },
            { name: 'initial_doctor_id', type: 'bigint', isNullable: true },
            {
              name: 'status',
              type: 'treatment_status',
              isNullable: false,
              default: `'vigente'`,
            },
            {
              name: 'closure_reason',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            { name: 'closure_date', type: 'date', isNullable: true },
          ],
          foreignKeys: [
            new TableForeignKey({
              columnNames: ['medical_history_id'],
              referencedTableName: 'medical_histories',
              referencedColumnNames: ['id'],
              onDelete: 'CASCADE',
            }),
          ],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasT = await queryRunner.hasTable('treatments');
    if (hasT) await queryRunner.dropTable('treatments');
    await queryRunner.query(
      `DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'treatment_status') THEN DROP TYPE treatment_status; END IF; END $$;`,
    );
    await queryRunner.query(
      `DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'initial_objective') THEN DROP TYPE initial_objective; END IF; END $$;`,
    );
  }
}
