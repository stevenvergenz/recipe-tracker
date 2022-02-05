/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions, PgLiteral } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions = {
	id: { type: 'integer', primaryKey: true, sequenceGenerated: { start: 1, increment: 1, precedence: 'ALWAYS' }},
	timestampNow: { type: 'timestamp', default: PgLiteral.create('NOW()') }
};

export async function up(pgm: MigrationBuilder): Promise<void>
{
	pgm.createTable('users', {
		id: shorthands.id,
		email: { type: 'varchar(80)', notNull: true, unique: true },
		password: { type: 'bytea', notNull: true },
		salt: { type: 'char(40)', notNull: true },
		name: { type: 'varchar(60)', notNull: true },
		created_on: shorthands.timestampNow,
		last_login: shorthands.timestampNow
	},
	{ ifNotExists: true });

	pgm.createTable('recipes', {
		id: shorthands.id,
		name: 'varchar(80)',
		owner_id: { type: 'integer', notNull: true },
		body: 'text' ,
		thumbnail_id: 'char(40)',
		created_on: shorthands.timestampNow,
		updated_on: shorthands.timestampNow
	}, {
		ifNotExists: true,
		constraints: {
			foreignKeys: {
				columns: 'owner_id',
				references: 'users (id)'
			}
		}
	});

	pgm.createTable('recipe_tags', {
		recipe_id: { type: 'integer', notNull: true},
		tag: { type: 'varchar(30)', notNull: true }
	}, {
		ifNotExists: true,
		constraints: {
			unique: ['recipe_id', 'tag'],
			foreignKeys: {
				columns: 'recipe_id',
				references: 'recipes (id)'
			}
		}
	});
}

export async function down(pgm: MigrationBuilder): Promise<void> {
}
