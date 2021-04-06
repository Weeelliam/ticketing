import request from 'supertest';
import { app } from '../../app';

it('clears the cookie after sign out', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'haha@hihi.be', password: 'pass' })
    .expect(201);
  await request(app)
    .post('/api/users/signin')
    .send({ email: 'haha@hihi.be', password: 'pass' })
    .expect(200);
  const response2 = await request(app)
    .post('/api/users/signout')
    .send({ email: 'haha@hihi.be', password: 'pass' })
    .expect(200);
  expect(response2.get('Set-Cookie')).toBeDefined();
});
