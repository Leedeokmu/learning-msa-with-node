import {Listener, Subjects, TicketCreatedEvent, TicketUpdatedEvent} from "@frfly_tickets/common";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../models/ticket";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent>{
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName = 'orders-service'

    async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
        const ticket = await Ticket.findByEvent(data);
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        const {title, price} = data;
        ticket.set({title, price});
        await ticket.save();

        msg.ack();
    }
}