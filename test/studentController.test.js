const studentController = require('../src/controllers/studentController');
const db = require('../src/db/db');

jest.mock('../src/db/db');

describe('studentController', () => {
  let req, res, pool;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    pool = { query: jest.fn() };
    db.getPool.mockReturnValue(pool);
  });

  describe('getAllStudents', () => {
    it('should return all students', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1 }, { id: 2 }] });
      await studentController.getAllStudents(req, res);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM student ORDER BY id');
      expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
    });
    it('should handle errors', async () => {
      pool.query.mockRejectedValue(new Error('fail'));
      await studentController.getAllStudents(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('getStudentById', () => {
    it('should return a student by id', async () => {
      req.params.id = 1;
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
      await studentController.getStudentById(req, res);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM student WHERE id = $1', [1]);
      expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });
    it('should return 404 if not found', async () => {
      req.params.id = 2;
      pool.query.mockResolvedValue({ rows: [] });
      await studentController.getStudentById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
    });
    it('should handle errors', async () => {
      req.params.id = 3;
      pool.query.mockRejectedValue(new Error('fail'));
      await studentController.getStudentById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('createStudent', () => {
    it('should create a student', async () => {
      req.body = { name: 'A', email: 'a@b.com', age: 20, course: 'CS' };
      pool.query.mockResolvedValue({ rows: [{ id: 1, ...req.body }] });
      await studentController.createStudent(req, res);
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO student(name, email, age, course) VALUES($1, $2, $3, $4) RETURNING *',
        ['A', 'a@b.com', 20, 'CS']
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1, ...req.body });
    });
    it('should handle errors', async () => {
      req.body = { name: 'B' };
      pool.query.mockRejectedValue(new Error('fail'));
      await studentController.createStudent(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('updateStudent', () => {
    it('should update a student', async () => {
      req.params.id = 1;
      req.body = { name: 'A', email: 'a@b.com', age: 21, course: 'Math' };
      pool.query.mockResolvedValue({ rows: [{ id: 1, ...req.body }] });
      await studentController.updateStudent(req, res);
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE student SET name=$1, email=$2, age=$3, course=$4 WHERE id=$5 RETURNING *',
        ['A', 'a@b.com', 21, 'Math', 1]
      );
      expect(res.json).toHaveBeenCalledWith({ id: 1, ...req.body });
    });
    it('should return 404 if not found', async () => {
      req.params.id = 2;
      req.body = { name: 'B' };
      pool.query.mockResolvedValue({ rows: [] });
      await studentController.updateStudent(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
    });
    it('should handle errors', async () => {
      req.params.id = 3;
      req.body = { name: 'C' };
      pool.query.mockRejectedValue(new Error('fail'));
      await studentController.updateStudent(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('deleteStudent', () => {
    it('should delete a student', async () => {
      req.params.id = 1;
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
      await studentController.deleteStudent(req, res);
      expect(pool.query).toHaveBeenCalledWith('DELETE FROM student WHERE id=$1 RETURNING *', [1]);
      expect(res.json).toHaveBeenCalledWith({ message: 'Deleted' });
    });
    it('should return 404 if not found', async () => {
      req.params.id = 2;
      pool.query.mockResolvedValue({ rows: [] });
      await studentController.deleteStudent(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
    });
    it('should handle errors', async () => {
      req.params.id = 3;
      pool.query.mockRejectedValue(new Error('fail'));
      await studentController.deleteStudent(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});
