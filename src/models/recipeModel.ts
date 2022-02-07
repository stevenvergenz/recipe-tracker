import { ClientBase as Client, QueryConfig } from 'pg';
import { RecipeLike, RecipePreview } from '../common';
import { DatabaseModel, RecipeTags, UserModel } from '.';
import { stringify } from 'querystring';

type RowType = { id: number, name: string, tag: string };

export class RecipeModel implements DatabaseModel, RecipeLike
{
	public id: number = -1;
	public name: string = '';
	public body: string = '';

	public owner_id: number = -1;
	public ownerModel?: UserModel;

	public thumbnail_id: string = '';
	public created_on: Date = new Date(0);
	public updated_on: Date = new Date(0);

	private _tagsModel = new RecipeTags(this);
	public get tagsModel() { return this._tagsModel; }
	public get tags(): string[] { return this._tagsModel.toJSON(); }
	public set tags(value: string[]) { this._tagsModel.set(value); }

	public constructor(data?: Partial<RecipeLike>)
	{
		Object.assign(this, data);

		if (data?.tags) {
			this.tagsModel.add(data.tags);
		}
	}

	//#region CRUD operations

	public async create(client: Client): Promise<void>
	{
		const query: QueryConfig = {
			text: 'INSERT INTO recipes (name, owner_id, body, thumbnail_id) VALUES ($1, $2, $3, $4) ' +
				'RETURNING id, created_on, updated_on',
			values: [this.name, this.owner_id, this.body, this.thumbnail_id]
		};

		const result = await client.query<Partial<RecipeLike>>(query);
		if (result.rowCount === 0) {
			throw new Error("Failed to create new recipe");
		}

		await this.tagsModel.update(client);
		
		Object.assign(this, result.rows[0]);
	}

	public async read(client: Client): Promise<void>
	{
		if (this.id === -1) {
			throw new Error("Cannot read a recipe without an ID");
		}

		const query: QueryConfig = {
			text: 'SELECT name, owner_id, body, thumbnail_id, created_on, updated_on FROM recipes WHERE id = $1',
			values: [this.id]
		};

		const result = await client.query(query);
		if (result.rowCount === 0) {
			throw new Error("No recipe found with given id");
		}

		Object.assign(this, result.rows[0]);

		if (this.owner_id > 0) {
			this.ownerModel = new UserModel({ id: this.owner_id });
			await this.ownerModel.read(client);
		}

		await this.tagsModel.read(client);
	}

	public async update(client: Client): Promise<void>
	{
		const query: QueryConfig = {
			text: 'UPDATE recipes SET name = $2, owner_id = $3, body = $4, thumbnail_id = $5, updated_on = NOW() ' +
				'WHERE id = $1 RETURNING updated_on',
			values: [this.id, this.name, this.owner_id, this.body, this.thumbnail_id]
		};

		const result = await client.query<Partial<RecipeLike>>(query);
		if (result.rowCount === 0) {
			throw new Error("No recipe with the given ID found to update");
		}

		Object.assign(this, result.rows[0]);

		await this.tagsModel.update(client);
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
			owner_id: this.owner_id,
			owner: this.ownerModel?.toJSON(),
			body: this.body,
			thumbnail_id: this.thumbnail_id,
			created_on: this.created_on,
			updated_on: this.updated_on,

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

	private static queryToIdMap(map: {[id: number]: RecipeModel}, row: RowType)
	{
		if (!map[row.id]) {
			map[row.id] = new RecipeModel({
				id: row.id,
				name: row.name,
				tags: [row.tag]
			});
		}
		else {
			map[row.id].tagsModel.add(row.tag);
		}

		return map;
	}

	public static async list(client: Client, ownerId: number): Promise<RecipeModel[]>
	{
		/*const result = await client.query<RowType>(
			'SELECT recipes.id AS id, recipes.name AS name, recipe_tags.tag AS tag ' +
			'FROM recipe_tags LEFT JOIN recipes ON recipe_tags.recipe_id = recipes.id ' +
			'WHERE recipes.id = $1',
			[ownerId]);
		console.log(result);
		const recipes = result.rows.reduce(RecipeModel.queryToIdMap, {});*/
		const result = await client.query<Partial<RecipeLike>>('SELECT * FROM recipes WHERE id = $1', [ownerId]);
		const recipes = result.rows.map(row => new RecipeModel(row));
		return Object.values(recipes);
	}
}
