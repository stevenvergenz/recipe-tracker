import { ClientBase as Client, QueryConfig } from 'pg';
import { DatabaseModel, RecipeModel } from '.';

export class RecipeTags implements Iterable<string>
{
	private recipe: RecipeModel;
	private tagsAtLastSync: Set<string> = new Set<string>();
	private updates: Set<string> = new Set<string>();

	public get length() { return this.updates.size; }

	public constructor(recipe: RecipeModel)
	{
		this.recipe = recipe;
	}

	public *[Symbol.iterator]()
	{
		for (const tag of this.tagsAtLastSync) {
			yield tag;
		}
	}

	public add(tags: string | string[])
	{
		if (!Array.isArray(tags)) {
			tags = [tags];
		}

		for (const t of tags) {
			this.updates.add(t);
		}
	}

	public remove(tags: string | string[])
	{
		if (!Array.isArray(tags)) {
			tags = [tags];
		}

		for (const t of tags) {
			this.updates.delete(t);
		}
	}

	public clear()
	{
		this.updates = new Set<string>();
	}

	public async read(client: Client): Promise<void>
	{
		const query: QueryConfig = {
			text: 'SELECT tag FROM recipe_tags WHERE recipe_id = $1',
			values: [this.recipe.id]
		};

		const result = await client.query<{tag: string}>(query);
		const tags = result.rows.map(r => r.tag);
		this.tagsAtLastSync = new Set<string>(tags);
		this.updates = new Set<string>(tags);
	}

	public async update(client: Client): Promise<void>
	{
		const adds = [...this.updates].filter(t => !this.tagsAtLastSync.has(t))
			.map(t => { return [this.recipe.id, t]; });
		await client.query('INSERT INTO recipe_tags (recipe_id, tag) VALUES $1', [adds]);

		const deletes = [...this.tagsAtLastSync].filter(t => !this.updates.has(t));
		await client.query('DELETE FROM recipe_tags WHERE recipe_id = $1 AND tag IN $2', [this.recipe.id, deletes]);
	}

	public toJSON(): string[]
	{
		return [...this.updates];
	}

	public set(tags: string[])
	{
		this.updates = new Set(tags);
	}
}
