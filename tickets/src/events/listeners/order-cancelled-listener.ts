import {Listener, OrderCancelledEvent, Subjects} from "@frfly_tickets/common";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../models/ticket";
import {natsWrapper} from "../../nats-wrapper";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = 'tickets-service';

    async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id);

        if(!ticket){
            throw new Error('Ticket not found');
        }

        ticket.set({orderId: undefined});
        await ticket.save();
        await new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            orderId: ticket.orderId,
            version: ticket.version
        });

        msg.ack();
    }
}