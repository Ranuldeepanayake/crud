const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/studentController');

console.log('[ROUTES] Initializing students routes');

router.get('/', ctrl.getAllStudents);
router.get('/:id', ctrl.getStudentById);
router.post('/', ctrl.createStudent);
router.put('/:id', ctrl.updateStudent);
router.delete('/:id', ctrl.deleteStudent);

console.log('[ROUTES] Students routes initialized successfully');

module.exports = router;
