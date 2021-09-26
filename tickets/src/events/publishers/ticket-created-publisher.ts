import {Publisher, Subjects, TicketCreatedEvent} from "@frfly_tickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}