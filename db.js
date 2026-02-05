const { Pool } = require('pg');

let pool = null;

async function fetchSecretsFromVault() {
  const addr = process.env.VAULT_ADDR;
  const token = process.env.VAULT_TOKEN;
  const path = process.env.VAULT_SECRET_PATH || 'secret/data/students';
  if (!addr || !token) return null;
  const url = `${addr.replace(/\/$/, '')}/v1/${path}`;

  const maxAttempts = 10;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'X-Vault-Token': token } });
      if (!res.ok) throw new Error(`vault status ${res.status}`);
      const body = await res.json();
      const data = body && body.data && body.data.data ? body.data.data : body.data || {};
      return data;
    } catch (err) {
      const waitMs = 1000 * attempt;
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }
  throw new Error('Unable to retrieve secrets from Vault');
}

async function initPool() {
  if (pool) return pool;

//Fallback to environment variables if vault cannot be used.  
  let config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'studentsdb',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  };

  if (process.env.VAULT_ADDR && process.env.VAULT_TOKEN) {
    const secrets = await fetchSecretsFromVault();
    if (secrets) {
      config.host = secrets.DB_HOST || config.host;
      config.user = secrets.DB_USER || config.user;
      config.password = secrets.DB_PASSWORD || config.password;
      config.database = secrets.DB_NAME || config.database;
      config.port = secrets.DB_PORT ? Number(secrets.DB_PORT) : config.port;
    }
  }

  pool = new Pool(config);
  return pool;
}

function getPool() {
  if (!pool) throw new Error('Pool not initialized. Call initPool() first.');
  return pool;
}

module.exports = { initPool, getPool };
