import { Request, Response, NextFunction } from 'express';
import { PoolClient } from 'pg';
import { randomBytes } from 'crypto';

import { dbPool, UserModel } from '../models';

export async function authenticate(req: Request, res: Response): Promise<void>
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

	user.lastLogin = new Date(Date.now());
	await user.update(db);
	db.release();
	req.session['userId'] = user.id;
	req.session.save();
	res.cookie('username', user.name, { maxAge: 3600000 });
	res.sendStatus(200);

}

export function logOut(req: Request, res: Response)
{
	req.session.destroy(() => res.sendStatus(200));
}

export async function ensureLogin(req: Request, res: Response, next: NextFunction): Promise<void>
{
	const userId: string = req.session['userId'];
	if (!userId) {
		res.sendStatus(401);
		return;
	}
	else {
		return next();
	}
}

export async function create(req: Request, res: Response): Promise<void>
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
	user.lastLogin = new Date(Date.now());

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
		await user.read(db);
	} catch (e) {
		console.error(e);
		res.sendStatus(403);
		return;
	} finally {
		db.release();
	}

	res.status(204).json({
		id: user.id,
		email: user.email,
		name: user.name,
		lastLogin: user.lastLogin
	});
}

export async function get(req: Request, res: Response): Promise<void>
{
	if (!req.params.id || !parseInt(req.params.id)) {
		res.sendStatus(400);
		return;
	}

	const user = new UserModel({ id: parseInt(req.params.id) });
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

	res.json({
		id: user.id,
		email: user.email,
		name: user.name,
		lastLogin: user.lastLogin
	});
}
