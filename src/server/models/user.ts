import { createHash } from 'crypto';
import { Client, QueryConfig } from 'pg';

import { DatabaseModel } from 'dbModel';

export interface UserLike
{
	id: string;
	password: Buffer;
	salt: string;
	name: string;
	lastLogin: Date;
};

export class UserModel implements DatabaseModel, UserLike
{
	public id: string = '';
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
			text: 'INSERT INTO Users(id, password, salt, name, lastLogin) ' +
				'VALUES ($1, $2, $3, $4, $5)',
			values: [this.id, this.password, this.salt, this.name, this.lastLogin]
		};

		const result = await client.query(query);
		if (result.rowCount === 0)
		{
			throw new Error("Failed to create new user record");
		}
	}

	public async read(client: Client): Promise<void>
	{
		const query: QueryConfig = {
			text: 'SELECT password, salt, name, lastLogin FROM Users WHERE id = $1',
			values: [this.id]
		};

		const result = await client.query<UserLike>(query);
		if (result.rowCount === 0)
		{
			throw new Error("No user found with the given id");
		}
		
		Object.assign(this, result.rows[0]);
	}

	public async update(client: Client): Promise<void>
	{
		const query: QueryConfig = {
			text: 'UPDATE Users SET password = $2, salt = $3, name = $4, lastLogin = $5 ' +
				'WHERE id = $1',
			values: [this.id, this.password, this.salt, this.name, this.lastLogin]
		};

		const result = await client.query(query);
		if (result.rowCount === 0)
		{
			throw new Error("Failed to update user record");
		}
	}

	public async delete(client: Client): Promise<void>
	{
		const query: QueryConfig = {
			text: 'DELETE FROM Users WHERE id = $1',
			values: [this.id]
		};

		const result = await client.query(query);
		if (result.rowCount === 0)
		{
			throw new Error("Failed to delete user record");
		}
	}
	
	//#endregion CRUD operations

	public static async logIn(client: Client, email: string, password: string): Promise<UserModel>
	{
		const user = new UserModel({ id: email });
		await user.read(client);

		const saltedPass = Buffer.from(user.salt + '++' + password, 'utf8');
		const hash = createHash('sha256');
		hash.update(saltedPass);
		const passHash = hash.digest();

		if (!user.password.equals(passHash))
		{
			throw new Error("Password invalid");
		}

		user.lastLogin = new Date();
		await user.update(client);

		return user;
	}
}
