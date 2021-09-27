import {ExpirationCompleteEvent, Publisher, Subjects} from "@frfly_tickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}