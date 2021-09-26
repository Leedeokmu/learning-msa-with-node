import {TicketCreatedListener} from "../ticket-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {TicketCreatedEvent, TicketUpdatedEvent} from "@frfly_tickets/common";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../../models/ticket";
import {TicketUpdatedListener} from "../ticket-updated-listener";

const setup = async () => {
    // 인스턴스 생성
    const listener = new TicketUpdatedListener(natsWrapper.client);
    // 임시 데이터 생성
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })

    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'new concert',
        price: 999,
        userId: 'sdfsdf'
    }
    // 임시 메시지 생성
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {listener, data, msg, ticket}
}

it('finds, updates, and saves a ticket', async () => {
    const {listener, data, msg, ticket} = await setup();
    // onMessage 함수 호출
    await listener.onMessage(data, msg);
    // 티켓 생성 확인
    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
    const {listener, data, msg} = await setup();
    // onMessage 함수 호출
    await listener.onMessage(data, msg);

    // 티켓 생성 확인
    expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version number', async () => {
    const {listener, data, msg} = await setup();
    // onMessage 함수 호출
    data.version = 10;
    try {
        await listener.onMessage(data, msg);
    } catch (err) {}
    expect(msg.ack).not.toHaveBeenCalled();
});
