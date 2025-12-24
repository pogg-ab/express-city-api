const request = require('supertest');
const { app } = require('../src/app');

describe('City CRUD API', () => {
  test('full CRUD flow and validation', async () => {
    // Start with empty list
    let res = await request(app).get('/cities');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    // Create
    res = await request(app)
      .post('/cities')
      .send({ name: 'Addis Ababa', country: 'Ethiopia', population: 5000000 });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Addis Ababa');
    const id = res.body.id;

    // List shows new item
    res = await request(app).get('/cities');
    expect(res.status).toBe(200);
    expect(res.body.length >= 1).toBe(true);

    // Read by id
    res = await request(app).get(`/cities/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Addis Ababa');

    // Update via PUT
    res = await request(app)
      .put(`/cities/${id}`)
      .send({ name: 'Addis', country: 'ET', population: 6000000 });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Addis');

    // Partial update via PATCH
    res = await request(app)
      .patch(`/cities/${id}`)
      .send({ population: 6100000 });
    expect(res.status).toBe(200);
    expect(res.body.population).toBe(6100000);

    // Delete
    res = await request(app).delete(`/cities/${id}`);
    expect(res.status).toBe(204);

    // Not found after delete
    res = await request(app).get(`/cities/${id}`);
    expect(res.status).toBe(404);

    // Validation error: missing name on POST
    res = await request(app).post('/cities').send({ country: 'X' });
    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
  });
});
