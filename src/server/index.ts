import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';

import configureRoutes from './routes';

const app = express();
app.use(bodyParser.json());

configureRoutes(app);

app.use((req: express.Request) => {
	console.log(req.url);
});

const port: number = parseInt(process.env.PORT ?? '3000');
app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
