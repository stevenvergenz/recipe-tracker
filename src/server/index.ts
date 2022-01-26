import 'dotenv/config';
import express from 'express';
import sessionParser from 'express-session';
import bodyParser from 'body-parser';

import configureRoutes from './routes';

const app = express();
app.use(sessionParser({
	secret: process.env.COOKIE_SECRET ?? 'secret',
	cookie: { maxAge: 60000 }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

configureRoutes(app);

app.use((req: express.Request) => {
	console.log(req.url);
});

const port: number = parseInt(process.env.PORT ?? '3000');
app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
