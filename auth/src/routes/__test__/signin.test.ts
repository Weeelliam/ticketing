import request from 'supertest';
import { app } from '../../app';

it('returns a 400 on absent email/pwd', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({ email: 'haha@hihi.be' })
    .expect(400);
  await request(app)
    .post('/api/users/signin')
    .send({ password: 'blubb' })
    .expect(400);
});

it('fails when an unknown email is supplied', async () => {
  return request(app)
    .post('/api/users/signin')
    .send({
      email: 'bleepidy@blub.com',
      password: 'passswd',
    })
    .expect(400);
});

it('fails when an incorrect pass is supplied', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'bleepidy@blub.com',
      password: 'passswd',
    })
    .expect(201);
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'bleepidy@blub.com',
      password: 'passssswd',
    })
    .expect(400);
});

it('returns a cookie on getting valid credentials', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'bleepidy@blub.com',
      password: 'passswd',
    })
    .expect(201);
  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'bleepidy@blub.com',
      password: 'passswd',
    })
    .expect(200);
  expect(response.get('Set-Cookie')).toBeDefined();
});
