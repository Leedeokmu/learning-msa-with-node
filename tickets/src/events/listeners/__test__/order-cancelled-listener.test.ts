import {natsWrapper} from "../../../nats-wrapper";
import {Ticket} from "../../../models/ticket";
import {OrderCancelledEvent, OrderStatus} from "@frfly_tickets/common";
import mongoose from "mongoose";
import {OrderCancelledListener} from "../order-cancelled-listener";

const setup = async () => {
    // 인스턴스 생성
    const listener = new OrderCancelledListener(natsWrapper.client);
    // 임시 데이터 생성
    const orderId = mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: 'asdf',
    });
    ticket.set({orderId});
    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id,
        }
    }
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {listener, data, msg, ticket, orderId}
}

it('updates the ticket, publishes an event, and acks the message', async () => {
    const {listener, ticket, data, msg, orderId} = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
