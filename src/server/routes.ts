import { Express } from 'express';

import * as User from './controllers/user';

export default function configureRoutes(app: Express)
{
	app.post('/api/users/authenticate', User.authenticate);
	app.post('/api/users/logout', User.logOut);
	app.post('/api/users/register', User.register);

	app.get('/authtest', User.ensureLogin, (req, res) => {
		res.send("Hello world");
	});
}
