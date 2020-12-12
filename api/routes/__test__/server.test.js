const request = require('supertest');
const app = require('../../../app')

it('Server is running', async () => {
  await request(app).get('/checkServer').send().expect(200);
});