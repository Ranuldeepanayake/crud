require('dotenv').config();
const express = require('express');
const studentsRouter = require('./routes/students');
const { initPool } = require('./db');

const app = express();
app.use(express.json());

app.use('/students', studentsRouter);

app.get('/', (req, res) => res.send('Student CRUD API'));

const port = process.env.PORT || 3000;

(async () => {
	try {
		const pool = await initPool();
		app.locals.pool = pool;
		app.listen(port, () => console.log(`Server listening on ${port}`));
	} catch (err) {
		console.error('Failed to initialize DB pool:', err);
		process.exit(1);
	}
})();
