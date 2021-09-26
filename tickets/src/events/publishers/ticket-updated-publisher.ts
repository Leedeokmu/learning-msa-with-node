import {Publisher, Subjects, TicketUpdatedEvent} from "@frfly_tickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}