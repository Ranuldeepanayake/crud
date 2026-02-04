const db = require('../db');

const getAllStudents = async (req, res) => {
  try {
    const pool = db.getPool();
    const { rows } = await pool.query('SELECT * FROM students ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getStudentById = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const pool = db.getPool();
    const { rows } = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createStudent = async (req, res) => {
  const { name, email, age, course } = req.body;
  try {
    const pool = db.getPool();
    const { rows } = await pool.query(
      'INSERT INTO students(name, email, age, course) VALUES($1, $2, $3, $4) RETURNING *',
      [name, email, age, course]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateStudent = async (req, res) => {
  const id = Number(req.params.id);
  const { name, email, age, course } = req.body;
  try {
    const pool = db.getPool();
    const { rows } = await pool.query(
      'UPDATE students SET name=$1, email=$2, age=$3, course=$4 WHERE id=$5 RETURNING *',
      [name, email, age, course, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteStudent = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const pool = db.getPool();
    const { rows } = await pool.query('DELETE FROM students WHERE id=$1 RETURNING *', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
