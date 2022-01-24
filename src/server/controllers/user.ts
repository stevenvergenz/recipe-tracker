import { Request, Response, NextFunction } from 'express';
import { PoolClient } from 'pg';

import { UserLike } from '../../common';
import { dbPool, UserModel } from '../models';

export async function get(req: Request, res: Response, next: NextFunction): Promise<void>
{
	if (!req.params.id) {
		return next();
	}

	const user = new UserModel({ id: req.params.id });
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
