const db = require('../db/db');

const getAllStudents = async (req, res) => {
  try {
    console.log('[CONTROLLER] getAllStudents - fetching all students');
    const pool = db.getPool();
    const { rows } = await pool.query('SELECT * FROM student ORDER BY id');
    console.log(`[CONTROLLER] getAllStudents - retrieved ${rows.length} students`);
    res.json(rows);
  } catch (err) {
    console.error('[CONTROLLER] ERROR in getAllStudents:', err.message || err);
    console.error('[CONTROLLER] ERROR Stack:', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getStudentById = async (req, res) => {
  const id = Number(req.params.id);
  try {
    console.log(`[CONTROLLER] getStudentById - fetching student ID: ${id}`);
    const pool = db.getPool();
    const { rows } = await pool.query('SELECT * FROM student WHERE id = $1', [id]);
    if (rows.length === 0) {
      console.log(`[CONTROLLER] getStudentById - student ID ${id} not found`);
      return res.status(404).json({ error: 'Not found' });
    }
    console.log(`[CONTROLLER] getStudentById - student ID ${id} found`);
    res.json(rows[0]);
  } catch (err) {
    console.error(`[CONTROLLER] ERROR in getStudentById (ID: ${id}):`, err.message || err);
    console.error('[CONTROLLER] ERROR Stack:', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createStudent = async (req, res) => {
  const { name, email, age, course } = req.body;
  try {
    console.log('[CONTROLLER] createStudent - creating new student:', { name, email, age, course });
    const pool = db.getPool();
    const { rows } = await pool.query(
      'INSERT INTO student(name, email, age, course) VALUES($1, $2, $3, $4) RETURNING *',
      [name, email, age, course]
    );
    console.log(`[CONTROLLER] createStudent - student created with ID: ${rows[0].id}`);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[CONTROLLER] ERROR in createStudent:', err.message || err);
    console.error('[CONTROLLER] ERROR Stack:', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateStudent = async (req, res) => {
  const id = Number(req.params.id);
  const { name, email, age, course } = req.body;
  try {
    console.log(`[CONTROLLER] updateStudent - updating student ID ${id} with:`, { name, email, age, course });
    const pool = db.getPool();
    const { rows } = await pool.query(
      'UPDATE student SET name=$1, email=$2, age=$3, course=$4 WHERE id=$5 RETURNING *',
      [name, email, age, course, id]
    );
    if (rows.length === 0) {
      console.log(`[CONTROLLER] updateStudent - student ID ${id} not found`);
      return res.status(404).json({ error: 'Not found' });
    }
    console.log(`[CONTROLLER] updateStudent - student ID ${id} updated successfully`);
    res.json(rows[0]);
  } catch (err) {
    console.error(`[CONTROLLER] ERROR in updateStudent (ID: ${id}):`, err.message || err);
    console.error('[CONTROLLER] ERROR Stack:', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteStudent = async (req, res) => {
  const id = Number(req.params.id);
  try {
    console.log(`[CONTROLLER] deleteStudent - deleting student ID: ${id}`);
    const pool = db.getPool();
    const { rows } = await pool.query('DELETE FROM student WHERE id=$1 RETURNING *', [id]);
    if (rows.length === 0) {
      console.log(`[CONTROLLER] deleteStudent - student ID ${id} not found`);
      return res.status(404).json({ error: 'Not found' });
    }
    console.log(`[CONTROLLER] deleteStudent - student ID ${id} deleted successfully`);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(`[CONTROLLER] ERROR in deleteStudent (ID: ${id}):`, err.message || err);
    console.error('[CONTROLLER] ERROR Stack:', err.stack);
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
