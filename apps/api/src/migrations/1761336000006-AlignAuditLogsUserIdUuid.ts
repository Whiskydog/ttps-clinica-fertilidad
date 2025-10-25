import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AlignAuditLogsUserIdUuid1761336000006
  implements MigrationInterface
{
  name = 'AlignAuditLogsUserIdUuid1761336000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const has = await queryRunner.hasTable('audit_logs');
    if (!has) return;
    const table = await queryRunner.getTable('audit_logs');
    const col = table?.findColumnByName('modified_by_user_id');
    if (col && col.type !== 'uuid') {
      await queryRunner.dropColumn('audit_logs', 'modified_by_user_id');
      await queryRunner.addColumn(
        'audit_logs',
        new TableColumn({
          name: 'modified_by_user_id',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }
    // Add FK to users(id)
    const fkName = 'FK_audit_logs_modified_by_user_id_users_id';
    const existingFk = table?.foreignKeys.find((fk) => fk.name === fkName);
    if (!existingFk) {
      await queryRunner.createForeignKey(
        'audit_logs',
        new TableForeignKey({
          name: fkName,
          columnNames: ['modified_by_user_id'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
          onUpdate: 'NO ACTION',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const has = await queryRunner.hasTable('audit_logs');
    if (!has) return;
    const table = await queryRunner.getTable('audit_logs');
    const fk = table?.foreignKeys.find(
      (fk) => fk.name === 'FK_audit_logs_modified_by_user_id_users_id',
    );
    if (fk) {
      await queryRunner.dropForeignKey('audit_logs', fk);
    }
    const col = table?.findColumnByName('modified_by_user_id');
    if (col && col.type === 'uuid') {
      await queryRunner.dropColumn('audit_logs', 'modified_by_user_id');
      await queryRunner.addColumn(
        'audit_logs',
        new TableColumn({
          name: 'modified_by_user_id',
          type: 'bigint',
          isNullable: true,
        }),
      );
    }
  }
}
