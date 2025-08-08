import express from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';
import cors from 'cors';
import helmet from 'helmet';
import testRoutes from './routes/test-routes';
import cookies from 'cookie-parser';

const app = express();
const port = 3000;

app.use(
  cors({
    origin: process.env.FRONT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use(helmet());

app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());
app.use(cookies());

app.use('/test', testRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`);
});
