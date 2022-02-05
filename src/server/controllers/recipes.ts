import { Request, Response } from 'express';
import { PoolClient } from 'pg';
import { dbPool, RecipeModel } from '../models';

export async function index(req: Request, res: Response): Promise<void>
{

}

export async function get(req: Request, res: Response): Promise<void>
{
	if (!req.params.recipeId || !parseInt(req.params.recipeId)) {
		res.sendStatus(400);
		return;
	}

	let db: PoolClient;
	try {
		db = await dbPool.connect();
	}
	catch (e) {
		console.error(e);
		res.sendStatus(500);
		return;
	}

	const recipe = new RecipeModel({ id: parseInt(req.params.recipeId) });
	try {
		await recipe.read(db);
	}
	catch (e) {
		console.error(e);
		db.release();
		res.sendStatus(404);
		return;
	}

	db.release();
	res.status(200).json(recipe.toJSON());
}
