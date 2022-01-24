import { createHash } from 'crypto';
import { ClientBase as Client, QueryConfig } from 'pg';

import { DatabaseModel } from './dbModel';
import { UserLike } from '../../common';

export class UserModel implements DatabaseModel, UserLike
{
	public id: number = -1;
	public email: string = '';
	public password: Buffer = Buffer.alloc(0);
	public salt: string = '';
	public name: string = '';
	public lastLogin: Date = new Date(0);

	public constructor(data: Partial<UserLike>)
	{
		Object.assign(this, data);
	}

	//#region CRUD operations

	public async create(client: Client): Promise<void>
	{
		const query: QueryConfig = {
			text: 'INSERT INTO users (email, password, salt, name, last_login) ' +
				'VALUES ($1, $2, $3, $4, $5)',
			values: [this.email, this.password, this.salt, this.name, this.lastLogin]
		};

		const result = await client.query(query);
		if (result.rowCount === 0) {
			throw new Error("Failed to create new user record");
		}
	}

	public async read(client: Client): Promise<void>
	{
		let query: QueryConfig;
		if (this.id) {
			query = {
				text: 'SELECT email, password, salt, name, last_login FROM users WHERE id = $1',
				values: [this.id]
			};
		}
		else if (this.email) {
			query = {
				text: 'SELECT id, password, salt, name, last_login FROM users WHERE email = $1',
				values: [this.email]
			};
		}
		else {
			throw new Error("Cannot read user from database without an identifier");
		}

		const result = await client.query<UserLike>(query);
		if (result.rowCount === 0) {
			throw new Error("No user found with the given id");
		}
		
		Object.assign(this, result.rows[0]);
	}

	public async update(client: Client): Promise<void>
	{
		const query: QueryConfig = {
			text: 'UPDATE users SET email = $2, password = $3, salt = $4, name = $5, last_login = $6 ' +
				'WHERE id = $1',
			values: [this.id, this.email, this.password, this.salt, this.name, this.lastLogin]
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

	public static getPasswordHash(password: string, salt: string): Buffer
	{
		const saltedPass = Buffer.from(`${salt}++${password}`, 'utf8');
		const hash = createHash('sha256');
		hash.update(saltedPass);
		const passHash = hash.digest();
		return passHash;
	}

	public static async logIn(client: Client, email: string, password: string): Promise<UserModel>
	{
		const user = new UserModel({ email });
		await user.read(client);

		const passHash = UserModel.getPasswordHash(password, user.salt);

		if (!user.password.equals(passHash)) {
			throw new Error("Password invalid");
		}

		user.lastLogin = new Date(Date.now());
		await user.update(client);

		return user;
	}
}
