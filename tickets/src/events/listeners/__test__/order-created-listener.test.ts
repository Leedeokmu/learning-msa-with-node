import mongoose from "mongoose";
import {OrderCreatedListener} from "../order-created-listener";
import {OrderCreatedEvent, OrderStatus} from "@frfly_tickets/common";
import {natsWrapper} from "../../../nats-wrapper";
import {Ticket} from "../../../models/ticket";

const setup = async () => {
    // 인스턴스 생성
    const listener = new OrderCreatedListener(natsWrapper.client);
    // 임시 데이터 생성
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: 'asdf'
    });
    await ticket.save();

    const data: OrderCreatedEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: 'sdfsdf',
        expiresAt: 'asdf',
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }
    // 임시 메시지 생성
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {listener, data, msg, ticket}
}

it('sets the userId of the ticket', async () => {
    const {listener, ticket, data, msg} = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
    const {listener, ticket, data, msg} = await setup();

    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async() => {
    const {listener, ticket, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const ticketUpdatedData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );
    expect(data.id).toEqual(ticketUpdatedData.orderId);
})