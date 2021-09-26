import request from "supertest";
import {app} from "../../app";
import mongoose from 'mongoose';

const createTicket = () => {
    return request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'asdfsdfj',
            price: 20
        });
}

it('returns a 404 if the provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'asdfasdf',
            price: 20
        })
        .expect(404);
});
it('returns a 401 if user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'asdfasdf',
            price: 20
        })
        .expect(401);
});
it('return s  401 if the user does not own the ticket', async () => {
    const response = await createTicket();

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'asdfhsdf',
            price: 1000
        })
        .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'asdfsdfj',
            price: 20
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 10
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'asdkahsd',
            price: -10
        })
        .expect(400);
});

it('updates the ticket provides valid inputs', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'asdf',
            price: 20
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'qwer',
            price: 100
        })
        .expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)

    expect(ticketResponse.body.title).toEqual('qwer');
    expect(ticketResponse.body.price).toEqual(100);
});