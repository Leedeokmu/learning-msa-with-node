import express from 'express';
import 'express-async-errors';
import cookieSession from "cookie-session";
import {currentUser, errorHandler, NotFoundError, requireAuth} from "@frfly_tickets/common";
import {deleteOrderRouter} from "./routes/delete";
import {newOrderRouter} from "./routes/new";
import {showOrderRouter} from "./routes/show";
import {indexOrderRouter} from "./routes";

const app = express();
app.set('trust proxy', true)
app.use(express.json());
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
}))

// Authorized routers
app.use(currentUser);
app.use(requireAuth);
app.use(showOrderRouter);
app.use(indexOrderRouter);
app.use(newOrderRouter);
app.use(deleteOrderRouter);

app.all('*', async () => {
    throw new NotFoundError();
})
app.use(errorHandler);

export {app};