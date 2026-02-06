require('dotenv').config();
const express = require('express');
const studentsRouter = require('./routes/students');
const { initPool } = require('./db');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

console.log('[SERVER] Starting application...');
console.log('[SERVER] NODE_ENV:', process.env.NODE_ENV || 'development');

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('[REQUEST] Body:', req.body);
  }
  next();
});

app.use(express.json());

app.use('/students', studentsRouter);

app.get('/', (req, res) => {
  console.log('[RESPONSE] GET / - sending home page');
  res.send('Student CRUD API');
});

const port = process.env.PORT || 3000;

(async () => {
	try {
		console.log('[SERVER] Initializing database pool...');
		const pool = await initPool();
		app.locals.pool = pool;
		console.log('[SERVER] Database pool initialized successfully');
		app.listen(port, () => {
			console.log(`[SERVER] Server listening on port ${port}`);
			console.log(`[SERVER] API ready at http://localhost:${port}`);
		});
	} catch (err) {
		console.error('[SERVER] ERROR - Failed to initialize DB pool:', err.message || err);
		console.error('[SERVER] ERROR Stack:', err.stack);
		process.exit(1);
	}
})();
