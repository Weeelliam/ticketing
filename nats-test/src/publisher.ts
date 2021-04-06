import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

console.clear();

const stan = nats.connect('ticketing', 'abc', { url: 'http://localhost:4222' });

stan.on('connect', async () => {
  console.log('publisher connected to nats');

  stan.on('close', () => {
    console.log('NATS connection closed');
    process.exit();
  });

  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: '123',
      title: 'titties',
      price: 20,
    });
  } catch (err) {
    console.error(err);
  }
});

process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());
