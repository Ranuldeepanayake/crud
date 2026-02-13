const fs = require('fs');
const { initPool, getPool } = require('../src/db/db');
const { Pool } = require('pg');

jest.mock('fs');
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn().mockResolvedValue({ rows: [{ one: 1 }] }),
    on: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

describe('db.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...process.env };
  });


  it('should use k8s secret as Vault token if present', async () => {
    process.env.SECRETS_TOKEN = 'dbtoken';
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('vault-token-value');
    process.env.VAULT_HOST = 'vault';
    process.env.VAULT_PORT = '8200';
    // Mock fetchSecretsFromVault to return DB secrets
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ data: { data: { DB_HOST: 'vault-host', DB_USER: 'vault-user', DB_PASSWORD: 'vault-pass', DB_NAME: 'vault-db', DB_PORT: 5433 } } })
    });
    const pool = await initPool();
    expect(Pool).toHaveBeenCalledWith(expect.objectContaining({
      host: 'vault-host',
      user: 'vault-user',
      password: 'vault-pass',
      database: 'vault-db',
      port: 5433,
    }));
    expect(pool.query).toHaveBeenCalledWith('SELECT 1');
    global.fetch.mockRestore();
  });


  it('getPool throws if not initialized', () => {
    jest.resetModules();
    const { getPool } = require('../src/db/db');
    expect(() => getPool()).toThrow('Pool not initialized. Call initPool() first.');
  });
});
