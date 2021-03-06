import express from 'express';
import 'express-async-errors';
import cookieSession from "cookie-session";
import {currentUser, errorHandler, NotFoundError, requireAuth} from "@frfly_tickets/common";
import {createChargeRouter} from "./routes/new";

const app = express();
app.set('trust proxy', true)
app.use(express.json());
app.use(cookieSession({
    signed: false,
    secure: false
}))

app.use(currentUser);
// Authorized routers
app.use(requireAuth);

app.use(createChargeRouter);

app.all('*', async () => {
    throw new NotFoundError();
})
app.use(errorHandler);

export {app};