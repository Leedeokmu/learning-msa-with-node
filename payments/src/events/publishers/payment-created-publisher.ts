import {PaymentCreatedEvent, Publisher, Subjects} from "@frfly_tickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}