import express, {Request, Response} from "express";
import {body} from "express-validator";
import mongoose from "mongoose";
import {Ticket} from "../models/ticket";
import {BadRequestError, NotFoundError, OrderStatus} from "@frfly_tickets/common";
import {Order} from "../models/order";
import {OrderCreatedPublisher} from "../events/publishers/order-created-publisher";
import {natsWrapper} from "../nats-wrapper";

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

const router = express.Router();

router.post('/api/orders', [
    body('ticketId')
        .not()
        .isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('TicketId must be provided ')
], async (req: Request, res: Response) => {
    // 주문을 하려는 티켓을 찾음
    const {ticketId} = req.body;
    const ticket = await Ticket.findById(ticketId);
    if(!ticket){
        throw new NotFoundError();
    }
    // 아직 티켓이 예약되지 않음을 확인
    // run query to loook at all orders.
    // find an order where the ticket is the ticket we just found and the orders status is not cancelled.
    // If we find order from that means the ticket is reserved
    const isReserved = await ticket.isReserved();
    if (isReserved) {
        throw new BadRequestError('Ticket is already reserved');
    }

    // 주문이 언제 만료되는지 계산
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // 주문 데이터를 생성하고 db에 저장
    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expiration,
        ticket
    });
    await order.save();

    // 주문 생성 이벤트를 발생하여 이벤트 버스에 전달
    await new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        version : order.version,
        status: order.status,
        userId: order.userId,
        expiresAt: order.expiresAt.toISOString(),
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    });

    res.status(201).send(order);
})

export {router as newOrderRouter};

