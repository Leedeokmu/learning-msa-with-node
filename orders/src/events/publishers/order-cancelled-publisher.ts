import {OrderCancelledEvent, Publisher, Subjects} from "@frfly_tickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}