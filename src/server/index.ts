import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';

import configureRoutes from './routes';

const app = express();
app.use(session({
	secret: process.env.COOKIE_SECRET ?? 'secret',
	cookie: { maxAge: 60000 },
	resave: true,
	saveUninitialized: false
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req: express.Request) => {
	console.log(req.url);
});

configureRoutes(app);

const port: number = parseInt(process.env.PORT ?? '3000');
app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
