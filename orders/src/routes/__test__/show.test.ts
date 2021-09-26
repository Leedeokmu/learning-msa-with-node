import request from "supertest";
import {app} from "../../app";
import {Ticket} from "../../models/ticket";
import mongoose from "mongoose";

it('fetches the order', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();
    const user = global.signin();

    const response = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ticketId: ticket.id})
        .expect(201);

    const responseOrder = await request(app)
        .get(`/api/orders/${response.body.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);
    expect(responseOrder.body.id).toEqual(response.body.id)
});

it('returns an error if one user tries to fetch another users order', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();
    const user = global.signin();

    const response = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ticketId: ticket.id})
        .expect(201);

    await request(app)
        .get(`/api/orders/${response.body.id}`)
        .set('Cookie', global.signin())
        .send()
        .expect(401);
});
