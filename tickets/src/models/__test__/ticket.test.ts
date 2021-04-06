import { Ticket } from "../ticket";

it('implements optimistic concurrency control', async (done) => {
   const ticket = Ticket.build({ title: 'tetten', price: 29, userId: 'blabla'});
   await ticket.save();

   const firstinstance = await Ticket.findById(ticket.id);
   const secondInstance = await Ticket.findById(ticket.id);

   firstinstance!.set({price: 10});
   secondInstance!.set({price: 15});

   await firstinstance!.save();

   try {
     await secondInstance!.save();
   } catch (err) {
     return done();
   }
   throw new Error('we shouldn not reach this point');
});

it('implements the version number for every save', async () => {
  const ticket = Ticket.build({ title: 'tetten', price: 69, userId: 'blabla'});
  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);
  
});