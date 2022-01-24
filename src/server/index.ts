import 'dotenv/config';
import * as express from 'express';

import configureRoutes from './routes';

const app = express();
configureRoutes(app);

app.use((req, res, next) => {
	console.log(req.url);
});

const port: number = parseInt(process.env.PORT ?? '3000');
app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
