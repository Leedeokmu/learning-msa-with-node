import mongoose from "mongoose";
import {Order} from "../../models/order";
import {OrderStatus} from "@frfly_tickets/common";
import {app} from "../../app";
import request from "supertest";
import {stripe} from "../../stripe";

it('returns a 204 with valid inputs', async() => {
    const userId = mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price,
        status: OrderStatus.Created
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'tok_visa',
            orderId: order.id
        })
        .expect(201);

    const stripeCharges = await stripe.charges.list({limit: 50});
    stripeCharges.data.find(charge => charge.amount === price * 100);
    expect(stripeCharges).toBeDefined();
})