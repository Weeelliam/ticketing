import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { currentUser, errorHandler, NotFoundError } from '@simbatique/common';
import { indexOrdersRouter } from './routes';
import { newOrdersRouter } from './routes/new';
import { showOrdersRouter } from './routes/show';
import { deleteOrdersRouter } from './routes/delete';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

app.use(currentUser);
app.use(indexOrdersRouter);
app.use(newOrdersRouter);
app.use(deleteOrdersRouter);
app.use(showOrdersRouter);

app.all('*', async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
