import {OrderCreatedEvent, Publisher, Subjects} from "@frfly_tickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}