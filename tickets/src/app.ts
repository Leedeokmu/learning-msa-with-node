import express from 'express';
import 'express-async-errors';
import cookieSession from "cookie-session";
import {currentUser, errorHandler, NotFoundError, requireAuth} from "@frfly_tickets/common";
import {createTicketRouter} from "./routes/new";
import {showTicketRouter} from "./routes/show";
import {indexTicketRouter} from "./routes";
import {updateTicketRouter} from "./routes/update";

const app = express();
app.set('trust proxy', true)
app.use(express.json());
app.use(cookieSession({
    signed: false,
    secure: false
}))

app.use(currentUser);
app.use(showTicketRouter);
app.use(indexTicketRouter);

// Authorized routers
app.use(requireAuth);
app.use(createTicketRouter);
app.use(updateTicketRouter);

app.all('*', async () => {
    throw new NotFoundError();
})
app.use(errorHandler);

export {app};