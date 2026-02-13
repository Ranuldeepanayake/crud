const { Pool } = require('pg');

let pool = null;

const maskConfig = (cfg) => ({ ...cfg, password: cfg.password ? '****' : cfg.password });

async function fetchSecretsFromVault() {
  const host = process.env.VAULT_HOST;
  const port = process.env.VAULT_PORT;
  const addr = host && port ? `https://${host}:${port}` : process.env.VAULT_ADDR;
  const token = arguments[0] || process.env.VAULT_TOKEN;
  const path = process.env.VAULT_SECRET_PATH || 'secret/data/crud/database';

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

  // Check for Kubernetes mounted secret token
  const k8sTokenName = process.env.SECRETS_TOKEN;
  let vaultToken = null;

  if (k8sTokenName) {
    const secretPath = `/etc/secrets/${k8sTokenName}`;
    const fs = require('fs');
    try {
      if (fs.existsSync(secretPath)) {
        const secretValue = fs.readFileSync(secretPath, 'utf8').trim();
        if (secretValue) {
          vaultToken = secretValue;
          console.log(`Loaded Vault token from Kubernetes secret: ${secretPath}`);
        } else {
          console.warn(`Kubernetes secret file ${secretPath} is empty.`);
        }
      } else {
        console.warn(`Kubernetes secret file ${secretPath} does not exist.`);
      }
    } catch (err) {
      console.error(`Error reading Kubernetes secret file ${secretPath}:`, err.message || err);
    }
  }

  // Try to load DB config from Vault using the k8s token
  let config = {
    host: '',
    user: '',
    password: '',
    database: '',
    port: 0,
  };

  try {
    const secrets = await fetchSecretsFromVault(vaultToken);
    if (secrets) {
      config.host = secrets.DB_HOST || config.host;
      config.user = secrets.DB_USER || config.user;
      config.password = secrets.DB_PASSWORD || config.password;
      config.database = secrets.DB_NAME || config.database;
      config.port = secrets.DB_PORT ? Number(secrets.DB_PORT) : config.port;
      console.log('Loaded secrets from Vault');
    } else {
      console.log('Could not load secrets from the vault. Vault empty!');
    }

  } catch (err) {
    console.error('Error fetching secrets from Vault!', err && err.message ? err.message : err);
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
