import { Express } from 'express';

import * as User from './controllers/user';

export default function configureRoutes(app: Express)
{
	app.get('/api/users/:id', User.get);
}
