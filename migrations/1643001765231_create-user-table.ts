/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void>
{
	pgm.createTable('Users', {
		id: {
			type: 'integer',
			primaryKey: true,
			sequenceGenerated: {
				start: 1,
				increment: 1,
				precedence: 'ALWAYS'
			}
		},
		email: {
			type: 'varchar(80)',
			notNull: true,
			unique: true
		},
		password: {
			type: 'bytea',
			notNull: true
		},
		salt: {
			type: 'char(40)',
			notNull: true
		},
		name: {
			type: 'varchar(60)',
			notNull: true
		},
		lastLogin: {
			type: 'timestamp'
		}
	});
}
