import { ClientBase as Client, QueryConfig } from 'pg';
import { RecipeLike, RecipePreview } from '../../common';
import { DatabaseModel, RecipeTags, UserModel } from '.';

export class RecipeModel implements DatabaseModel, RecipeLike
{
	public id: number = -1;
	public name: string = '';
	public body: string = '';

	private owner_id: number = -1;
	public get ownerId() { return this.owner_id; }
	public set ownerId(value: number) { this.owner_id = value; }
	public ownerModel?: UserModel;

	private thumbnail_id: string = '';
	public get thumbnailId(): string { return this.thumbnail_id; }
	public set thumbnailId(value: string) { this.thumbnail_id = value; }

	private created_on: Date = new Date(0);
	public get createdOn() { return this.created_on; }
	public set createdOn(value: Date) { this.created_on = value; }

	private updated_on: Date = new Date(0);
	public get updatedOn() { return this.updated_on; }
	public set updatedOn(value: Date) { this.updated_on = value; }

	private _tagsModel = new RecipeTags(this);
	public get tagsModel() { return this._tagsModel; }
	public get tags(): string[] { return this._tagsModel.toJSON(); }
	public set tags(value: string[]) { this._tagsModel.setNoUpdate(value); }

	public constructor(data: Partial<RecipeLike>)
	{
		if (data?.id) { this.id = data.id; }
		if (data?.name) { this.name = data.name; }
		if (data?.body) { this.body = data.body; }
		if (data?.ownerId) { this.ownerId = data.ownerId; }
		if (data?.thumbnailId) { this.thumbnailId = data.thumbnailId; }
		if (data?.createdOn) { this.createdOn = data.createdOn; }
		if (data?.updatedOn) { this.updatedOn = data.updatedOn; }
		if (data?.tags) { this.tags = data.tags; }
	}

	//#region CRUD operations

	public async create(client: Client): Promise<void>
	{
		const query: QueryConfig = {
			text: 'INSERT INTO recipes (name, owner_id, body, thumbnail_id) VALUES $1, $2, $3, $4',
			values: [this.name, this.ownerId, this.body, this.thumbnailId]
		};

		const result = await client.query(query);
		if (result.rowCount === 0) {
			throw new Error("Failed to create new recipe");
		}

		// TODO: get default values in-line from INSERT
		await this.read(client);
	}

	public async read(client: Client): Promise<void>
	{
		const query: QueryConfig = {
			text: 'SELECT name, owner_id, body, thumbnail_id, created_on, updated_on FROM recipes WHERE id = $1',
			values: [this.id]
		};

		const result = await client.query(query);
		if (result.rowCount === 0) {
			throw new Error("No recipe found with given id");
		}

		this.name = result.rows[0].name;
		this.ownerId = result.rows[0].owner_id;
		this.body = result.rows[0].body;
		this.thumbnailId = result.rows[0].thumbnail_id;
		this.createdOn = result.rows[0].created_on;
		this.updatedOn = result.rows[0].updated_on;

		if (this.ownerId > 0) {
			this.ownerModel = new UserModel({ id: this.ownerId });
			await this.ownerModel.read(client);
		}

		await this.tagsModel.read(client);
	}

	public async update(client: Client): Promise<void>
	{
		const query: QueryConfig = {
			text: 'UPDATE recipes SET name = $2, owner_id = $3, body = $4, thumbnail_id = $5, updated_on = NOW() ' +
				'WHERE id = $1',
			values: [this.id, this.name, this.ownerId, this.body, this.thumbnailId]
		};

		const result = await client.query(query);
		if (result.rowCount === 0) {
			throw new Error("No recipe with the given ID found to update");
		}

		// TODO: get the real updated_on value from the query
		this.updated_on = new Date(Date.now());
	}

	public async delete(client: Client): Promise<void>
	{
		const query: QueryConfig = {
			text: 'DELETE FROM recipes WHERE id = $1',
			values: [this.id]
		};

		const result = await client.query(query);
		if (result.rowCount === 0) {
			throw new Error("No recipe with the given ID found to delete");
		}
	}

	// #endregion CRUD operations

	public toJSON(): RecipeLike
	{
		return {
			id: this.id,
			name: this.name,
			ownerId: this.ownerId,
			owner: this.ownerModel?.toJSON(),
			body: this.body,
			thumbnailId: this.thumbnailId,
			createdOn: this.createdOn,
			updatedOn: this.updatedOn,

			tags: this.tagsModel.toJSON()
		};
	}

	public toPreviewJSON(): RecipePreview
	{
		return {
			id: this.id,
			name: this.name,
			tags: this.tagsModel.toJSON()
		};
	}

	public static async list(client: Client): Promise<RecipeModel[]>
	{
		const result = await client.query<Partial<RecipeLike>>('SELECT id, name FROM recipes ORDER BY created_on');
		return result.rows.map(r => new RecipeModel(r));
	}
}
