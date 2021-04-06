import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on succesful signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'bleep@blub.com',
      password: 'passswd',
    })
    .expect(201);
});

it('returns a 400 on invalid email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'bleep',
      password: 'passswd',
    })
    .expect(400);
});

it('returns a 400 on too short password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'bleep@blub.com',
      password: 'pwd',
    })
    .expect(400);
});

it('returns a 400 on too long password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'bleep@blub.com',
      password: 'pwdahahahahahahahahahahahahahah',
    })
    .expect(400);
});

it('returns a 400 on absent email/pwd', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'haha@hihi.be' })
    .expect(400);
  await request(app)
    .post('/api/users/signup')
    .send({ password: 'blubb' })
    .expect(400);
});

it('disallows duplicate emails', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'haha@hihi.be', password: 'paswoord' })
    .expect(201);
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'haha@hihi.be', password: 'paswoord' })
    .expect(400);
});

it('sets a cookie after succesfull signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({ email: 'haha@hihi.be', password: 'paswoord' })
    .expect(201);
  expect(response.get('Set-Cookie')).toBeDefined();
});
