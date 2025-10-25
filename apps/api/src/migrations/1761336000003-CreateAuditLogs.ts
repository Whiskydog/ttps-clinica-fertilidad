import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAuditLogs1761336000003 implements MigrationInterface {
  name = 'CreateAuditLogs1761336000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasAudit = await queryRunner.hasTable('audit_logs');
    if (!hasAudit) {
      await queryRunner.createTable(
        new Table({
          name: 'audit_logs',
          columns: [
            {
              name: 'id',
              type: 'bigint',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'table_name',
              type: 'varchar',
              length: '100',
              isNullable: false,
            },
            { name: 'record_id', type: 'bigint', isNullable: false },
            {
              name: 'modified_field',
              type: 'varchar',
              length: '100',
              isNullable: true,
            },
            { name: 'old_value', type: 'text', isNullable: true },
            { name: 'new_value', type: 'text', isNullable: true },
            { name: 'modified_by_user_id', type: 'bigint', isNullable: true },
            {
              name: 'user_role',
              type: 'varchar',
              length: '20',
              isNullable: true,
            },
            {
              name: 'modification_timestamp',
              type: 'timestamp',
              isNullable: false,
            },
          ],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasAudit = await queryRunner.hasTable('audit_logs');
    if (hasAudit) await queryRunner.dropTable('audit_logs');
  }
}
