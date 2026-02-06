const { Pool } = require('pg');

let pool = null;

const maskConfig = (cfg) => ({ ...cfg, password: cfg.password ? '****' : cfg.password });

async function fetchSecretsFromVault() {
  const addr = process.env.VAULT_ADDR;
  const token = process.env.VAULT_TOKEN;
  const path = process.env.VAULT_SECRET_PATH || 'secret/data/students';
  if (!addr || !token) {
    console.log('Vault not configured (VAULT_ADDR/VAULT_TOKEN missing)');
    return null;
  }
  const url = `${addr.replace(/\/$/, '')}/v1/${path}`;
  console.log(`Fetching secrets from Vault: ${url}`);

  const maxAttempts = 10;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'X-Vault-Token': token } });
      if (!res.ok) throw new Error(`vault status ${res.status}`);
      const body = await res.json();
      const data = body && body.data && body.data.data ? body.data.data : body.data || {};
      console.log('Successfully fetched secrets from Vault');
      return data;
    } catch (err) {
      console.error(`Vault fetch attempt ${attempt} failed:`, err && err.message ? err.message : err);
      const waitMs = 1000 * attempt;
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }
  console.error('Unable to retrieve secrets from Vault after attempts');
  throw new Error('Unable to retrieve secrets from Vault');
}

async function initPool() {
  if (pool) return pool;

  let config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'studentsdb',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  };

  console.log('Initial DB config (masked):', maskConfig(config));

  if (process.env.VAULT_ADDR && process.env.VAULT_TOKEN) {
    try {
      const secrets = await fetchSecretsFromVault();
      if (secrets) {
        config.host = secrets.DB_HOST || config.host;
        config.user = secrets.DB_USER || config.user;
        config.password = secrets.DB_PASSWORD || config.password;
        config.database = secrets.DB_NAME || config.database;
        config.port = secrets.DB_PORT ? Number(secrets.DB_PORT) : config.port;
      }
    } catch (err) {
      console.error('Error fetching secrets from Vault, falling back to environment vars:', err && err.message ? err.message : err);
    }
  }

  console.log('Final DB config (masked):', maskConfig(config));

  pool = new Pool(config);

  pool.on('error', (err) => {
    console.error('Unexpected idle client error:', err);
  });

  try {
    await pool.query('SELECT 1');
    console.log('DB pool initialized and test query succeeded');
  } catch (err) {
    console.error('DB pool test query failed:', err);
  }

  return pool;
}

function getPool() {
  if (!pool) throw new Error('Pool not initialized. Call initPool() first.');
  return pool;
}

module.exports = { initPool, getPool };
