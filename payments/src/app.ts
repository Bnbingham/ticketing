import express, { Request, Response, NextFunction } from 'express';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

// Common
import { currentUser, errorHandler, NotFoundError } from '@bnbtickets/common';

// Routes
import { createPaymentRouter } from './routes/new';

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

app.use(createPaymentRouter);

// Add catch-all route for unhandled routes
app.all('*path', async (req: Request, res: Response, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
