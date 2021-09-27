import {natsWrapper} from "../../../nats-wrapper";
import {ExpirationCompleteEvent, OrderStatus} from "@frfly_tickets/common";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import {ExpirationCompleteListener} from "../expiration-complete-listener";
import {Ticket} from "../../../models/ticket";
import {Order} from "../../../models/order";

const setup = async () => {
    // 인스턴스 생성
    const listener = new ExpirationCompleteListener(natsWrapper.client);
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();
    const order = Order.build({
        status: OrderStatus.Created,
        userId: 'adfadsf',
        expiresAt: new Date(),
        ticket,
    })
    await order.save();

    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {listener, order, ticket, data, msg};
}

it('updates the order status to cancelled', async () => {
    const {listener, order, ticket, data, msg} = await setup();
    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
})

it('emit an OrderCancelled event', async () => {
    const {listener, order, ticket, data, msg} = await setup();
    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(eventData.id).toEqual(order.id);
})

it('ack the message', async () => {
    const {listener, order, ticket, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
})