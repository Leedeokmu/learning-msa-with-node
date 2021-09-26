import {TicketCreatedListener} from "../ticket-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {TicketCreatedEvent} from "@frfly_tickets/common";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../../models/ticket";

const setup = async () => {
    // 인스턴스 생성
    const listener = new TicketCreatedListener(natsWrapper.client);
    // 임시 데이터 생성
    const data: TicketCreatedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'freeefly',
        price: 10,
        userId: new mongoose.Types.ObjectId().toHexString()
    }
    // 임시 메시지 생성
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {listener, data, msg}
}

it('creates and saves a ticket', async () => {
    const {listener, data, msg} = await setup();
    // onMessage 함수 호출
    await listener.onMessage(data, msg);
    // 티켓 생성 확인
    const ticket = await Ticket.findById(data.id);
    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {
    const {listener, data, msg} = await setup();
    // onMessage 함수 호출
    await listener.onMessage(data, msg);

    // 티켓 생성 확인
    expect(msg.ack).toHaveBeenCalled();
});