import { Request, Response, NextFunction } from 'express';
import { PoolClient } from 'pg';
import { randomBytes } from 'crypto';

import { dbPool, UserModel } from '../models';

export namespace UserController
{
	export type AuthRequest = Request<any, any, {email: string, password: string}>;
	export async function authenticate(req: AuthRequest, res: Response): Promise<void>
	{
		if (!req.body.email || !req.body.password) {
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

		const user = new UserModel({ email: req.body.email });
		try {
			await user.read(db);
		}
		catch (e) {
			db.release();
			res.sendStatus(401);
			return;
		}

		const attemptPass = UserModel.getPasswordHash(req.body.password, user.salt);
		if (!user.password.equals(attemptPass)) {
			db.release();
			res.sendStatus(401);
			return;
		}

		await user.updateLastLogin(db);
		db.release();

		if (!req.session) {
			res.sendStatus(500);
			return;
		}
		
		req.session.userId = user.id;
		req.session.save(() =>
			res.status(200).json(user.toJSON()));
	}

	export function logOut(req: Request, res: Response)
	{
		if (req.session) {
			req.session.destroy(() => 
				res.sendStatus(200));
		}
		else {
			res.sendStatus(200);
		}
	}

	export async function ensureLogin(req: Request, res: Response, next: NextFunction): Promise<void>
	{
		if (!req.session?.userId) {
			res.sendStatus(401);
			return;
		}
		else {
			return next();
		}
	}

	export type RegisterRequest = Request<any, any, {email: string, password: string, name: string}>;
	export async function register(req: RegisterRequest, res: Response): Promise<void>
	{
		if (!req.body?.email || !req.body?.password || !req.body?.name) {
			res.sendStatus(400);
			return;
		}

		const user = new UserModel({
			email: req.body.email,
			name: req.body.name
		});

		user.salt = randomBytes(20).toString('hex');
		user.password = UserModel.getPasswordHash(req.body.password, user.salt);

		let db: PoolClient;
		try {
			db = await dbPool.connect();
		} catch (e) {
			console.error(e);
			res.sendStatus(500);
			return;
		}

		try {
			await user.create(db);
		} catch (e) {
			console.error(e);
			res.sendStatus(403);
			return;
		} finally {
			db.release();
		}

		if (!req.session) {
			res.sendStatus(500);
			return;
		}
		
		req.session.userId = user.id;
		req.session.save(() =>
			res.status(201).json(user.toJSON()));
	}

	export async function identity(req: Request, res: Response): Promise<void>
	{
		const user = new UserModel({ id: parseInt(req.session?.userId) });
		let db: PoolClient;
		try {
			db = await dbPool.connect();
		} catch (e) {
			console.error(e);
			res.sendStatus(500);
			return;
		}

		try {
			await user.read(db);
		} catch (e) {
			console.error(e);
			res.sendStatus(404);
			return;
		}
		finally
		{
			db.release();
		}

		res.json(user.toJSON());
	}
}
