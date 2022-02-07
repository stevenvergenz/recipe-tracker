import { Express } from 'express';
import { RecipeController, UserController } from './controllers';

export default function configureRoutes(app: Express)
{
	app.post('/api/users/register', UserController.register);
	app.post('/api/users/authenticate', UserController.authenticate);
	app.post('/api/users/logout', UserController.logOut);
	app.get('/api/users/me', UserController.ensureLogin, UserController.identity);

	app.get('/api/recipes', UserController.ensureLogin, RecipeController.index);
	app.get('/api/recipes/:recipe_id', UserController.ensureLogin, RecipeController.get);
	app.post('/api/recipes', UserController.ensureLogin, RecipeController.create);
}
