import { Request, Response } from 'express';
import { PoolClient } from 'pg';
import { RecipeLike } from '../common';
import { dbPool, RecipeModel } from '../models';

export namespace RecipeController
{
	export async function index(req: Request, res: Response): Promise<void>
	{
		let db: PoolClient;
		try {
			db = await dbPool.connect();
		}
		catch (e) {
			console.error(e);
			res.sendStatus(500);
			return;
		}

		let recipes: RecipeModel[];
		try {
			recipes = await RecipeModel.list(db, req.session?.userId);
		}
		catch (e) {
			console.error(e);
			res.sendStatus(500);
			return;
		}
		finally {
			db.release();
		}

		res.status(200).json(recipes.map(r => r.toPreviewJSON()));
	}

	export async function create(req: Request<any, any, Partial<RecipeLike>>, res: Response)
	{
		if (!req.body.name) {
			res.status(400).send("Creating a recipe requires at least a recipe name");
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

		const recipe = new RecipeModel({
			...req.body,
			owner_id: req.session?.userId
		});

		try {
			await recipe.create(db);
		}
		catch (e) {
			console.error(e);
			res.sendStatus(500);
			return;
		}
		finally {
			db.release();
		}

		res.status(201).json(recipe.toJSON());
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
			res.sendStatus(404);
			return;
		}
		finally {
			db.release();
		}

		res.status(200).json(recipe.toJSON());
	}
}
