import { ClientBase as Client, QueryConfig } from 'pg';
import { DatabaseModel, RecipeModel } from '.';

export class RecipeTags implements Iterable<string>
{
	private recipe: RecipeModel;
	private tags: Set<string> = new Set<string>();
	public get length() { return this.tags.size; }

	public constructor(recipe: RecipeModel)
	{
		this.recipe = recipe;
	}

	public *[Symbol.iterator]()
	{
		for (const tag of this.tags) {
			yield tag;
		}
	}

	// #region CRUD operations

	public async read(client: Client): Promise<void>
	{
		const query: QueryConfig = {
			text: 'SELECT tag FROM recipe_tags WHERE recipe_id = $1',
			values: [this.recipe.id]
		};

		const result = await client.query<{ tag: string }>(query);
		this.tags.clear();
		for (const r of result.rows) {
			this.tags.add(r.tag);
		}
	}

	public async add(client: Client, tag: string): Promise<void>
	{
		await client.query('INSERT INTO recipe_tags (recipe_id, tag) VALUES $1, $2', [this.recipe.id, tag]);
		this.tags.add(tag);
	}

	public async remove(client: Client, tag: string): Promise<void>
	{
		await client.query('DELETE FROM recipe_tags WHERE recipe_id = $1 AND tag = $2', [this.recipe.id, tag]);
		this.tags.delete(tag);
	}

	// #endregion CRUD operations

	public toJSON(): string[]
	{
		return [...this.tags];
	}

	public setNoUpdate(tags: string[])
	{
		this.tags = new Set(tags);
	}
}
