const request = require('supertest');
const server = require('../getCookie');


let cookie;
afterAll(() => {
  server.close();
});
beforeAll(async () => {
  // const resp = await request(server);
  cookie = '__session_id__=154339717784636451';
});
test('should visit without error', async () => {
  await request(server)
    .get('/')
    .set('Cookie', cookie)
    .expect(200)
    .expect('154339717784636451');
});

test('should visit without error', async () => {
  await request(server)
    .get('/')
    // .set('Cookie', cookie)
    .expect(200);
  // .expect('154339717784636451');
});
