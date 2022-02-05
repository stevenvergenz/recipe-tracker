import { createHash } from 'crypto';
import { ClientBase as Client, QueryConfig } from 'pg';

import { DatabaseModel } from '.';
import { PrivateUserLike, UserLike } from '../../common';

export class UserModel implements DatabaseModel, PrivateUserLike
{
	public id: number = -1;
	public email: string = '';
	public password: Buffer = Buffer.alloc(0);
	public salt: string = '';
	public name: string = '';

	private created_on: Date = new Date(0);
	public get createdOn(): Date { return this.created_on; }
	public set createdOn(value: Date) { this.created_on = value; }
	
	private last_login: Date = new Date(0);
	public get lastLogin(): Date { return this.last_login; }
	public set lastLogin(value: Date) { this.last_login = value; }

	public constructor(data: Partial<PrivateUserLike>)
	{
		Object.assign(this, data);
	}

	//#region CRUD operations

	public async create(client: Client): Promise<void>
	{
		const query: QueryConfig = {
			text: 'INSERT INTO users (email, password, salt, name) ' +
				'VALUES ($1, $2, $3, $4)',
			values: [this.email, this.password, this.salt, this.name]
		};

		const result = await client.query(query);
		if (result.rowCount === 0) {
			throw new Error("Failed to create new user record");
		}

		// TODO: get the auto-generated values during the INSERT
		await this.read(client);
	}

	public async read(client: Client): Promise<void>
	{
		let query: QueryConfig;
		if (this.id) {
			query = {
				text: 'SELECT email, password, salt, name, created_on, last_login FROM users WHERE id = $1',
				values: [this.id]
			};
		}
		else if (this.email) {
			query = {
				text: 'SELECT id, password, salt, name, created_on, last_login FROM users WHERE email = $1',
				values: [this.email]
			};
		}
		else {
			throw new Error("Cannot read user from database without an identifier");
		}

		const result = await client.query<Partial<PrivateUserLike>>(query);
		if (result.rowCount === 0) {
			throw new Error("No user found with the given id");
		}
		
		Object.assign(this, result.rows[0]);
	}

	public async update(client: Client): Promise<void>
	{
		const query: QueryConfig = {
			text: 'UPDATE users SET email = $2, password = $3, salt = $4, name = $5 ' +
				'WHERE id = $1',
			values: [this.id, this.email, this.password, this.salt, this.name]
		};

		const result = await client.query(query);
		if (result.rowCount === 0) {
			throw new Error("Failed to update user record");
		}
	}

	public async delete(client: Client): Promise<void>
	{
		const query: QueryConfig = {
			text: 'DELETE FROM users WHERE id = $1',
			values: [this.id]
		};

		const result = await client.query(query);
		if (result.rowCount === 0) {
			throw new Error("Failed to delete user record");
		}
	}

	//#endregion CRUD operations

	public async updateLastLogin(client: Client): Promise<void>
	{
		const query: QueryConfig = {
			text: 'UPDATE users SET last_login = NOW() WHERE id = $1',
			values: [this.id]
		};

		const result = await client.query(query);
		if (result.rowCount === 0) {
			throw new Error("Failed to update last login");
		}
	
		// TODO: get real value from DB
		this.last_login = new Date(Date.now());
	}

	public toJSON(): UserLike
	{
		return {
			id: this.id,
			email: this.email,
			name: this.name,
			createdOn: this.createdOn,
			lastLogin: this.lastLogin
		};
	}

	public static getPasswordHash(password: string, salt: string): Buffer
	{
		const saltedPass = Buffer.from(`${salt}++${password}`, 'utf8');
		const hash = createHash('sha256');
		hash.update(saltedPass);
		const passHash = hash.digest();
		return passHash;
	}
}
