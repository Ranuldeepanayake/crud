const request = require('supertest');
const express = require('express');
const studentRouter = require('../src/routes/students');

jest.mock('../src/controllers/studentController', () => ({
  getAllStudents: jest.fn((req, res) => res.json([{ id: 1 }])) ,
  getStudentById: jest.fn((req, res) => req.params.id === '1' ? res.json({ id: 1 }) : res.status(404).json({ error: 'Not found' })),
  createStudent: jest.fn((req, res) => res.status(201).json({ ...req.body, id: 2 })),
  updateStudent: jest.fn((req, res) => req.params.id === '1' ? res.json({ ...req.body, id: 1 }) : res.status(404).json({ error: 'Not found' })),
  deleteStudent: jest.fn((req, res) => req.params.id === '1' ? res.json({ message: 'Deleted' }) : res.status(404).json({ error: 'Not found' })),
}));

const ctrl = require('../src/controllers/studentController');

describe('students route', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/students', studentRouter);
  });

  it('GET /students returns all students', async () => {
    const res = await request(app).get('/students');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1 }]);
    expect(ctrl.getAllStudents).toHaveBeenCalled();
  });

  it('GET /students/1 returns a student', async () => {
    const res = await request(app).get('/students/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1 });
    expect(ctrl.getStudentById).toHaveBeenCalled();
  });

  it('GET /students/2 returns 404', async () => {
    const res = await request(app).get('/students/2');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  it('POST /students creates a student', async () => {
    const res = await request(app).post('/students').send({ name: 'A' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ name: 'A', id: 2 });
    expect(ctrl.createStudent).toHaveBeenCalled();
  });

  it('PUT /students/1 updates a student', async () => {
    const res = await request(app).put('/students/1').send({ name: 'B' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ name: 'B', id: 1 });
    expect(ctrl.updateStudent).toHaveBeenCalled();
  });

  it('PUT /students/2 returns 404', async () => {
    const res = await request(app).put('/students/2').send({ name: 'C' });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  it('DELETE /students/1 deletes a student', async () => {
    const res = await request(app).delete('/students/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Deleted' });
    expect(ctrl.deleteStudent).toHaveBeenCalled();
  });

  it('DELETE /students/2 returns 404', async () => {
    const res = await request(app).delete('/students/2');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });
});
