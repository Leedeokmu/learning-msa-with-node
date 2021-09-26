import {Ticket} from "../ticket";

it('implements optimistic concurrency control', async () => {
    // ticket instance 생성
    const ticket = Ticket.build({
        title: 'concert',
        price: 5,
        userId: '123'
    })
    // db 에 ticket 저장
    await ticket.save();
    // ticket 2번 불러오기
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);
    // 각각 수정
    firstInstance!.set({price: 10});
    secondInstance!.set({price: 15});
    // 첫 번째 ticket 저장
    await firstInstance!.save();
    // 두 번째 ticket 저장 -> 에러 발생
    try {
        await secondInstance!.save();
    } catch (err){
        return;
    }
    throw new Error('Should not reach to this line');
});

it('increments the version number on multiple saves', async () => {
    // ticket instance 생성
    const ticket = Ticket.build({
        title: 'concert',
        price: 5,
        userId: '123'
    })
    // db 에 ticket 저장
    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1);
    await ticket.save();
    expect(ticket.version).toEqual(2);
});