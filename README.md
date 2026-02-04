# Student CRUD (Node.js + Express + Postgres)

Simple CRUD API for student data. The app uses Express and Postgres and is containerized with Docker Compose.

Run with Docker Compose:

```bash
docker compose up --build
```

The API will be available at http://localhost:3000

Endpoints:

- `GET /students` — list all students
- `GET /students/:id` — get a student
- `POST /students` — create a student (JSON body: `name`, `email`, `age`, `course`)
- `PUT /students/:id` — update a student
- `DELETE /students/:id` — delete a student

Example curl create:

```bash
curl -X POST http://localhost:3000/students \
  -H 'Content-Type: application/json' \
  -d '{"name":"New Student","email":"new@example.com","age":20,"course":"Physics"}'
```

Using HashiCorp Vault for DB credentials

This repo includes a Vault dev server in `docker-compose.yml`. On startup an init job writes the DB credentials into Vault at the path `secret/data/students` with fields `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `DB_PORT`.

The app will fetch these secrets at startup if `VAULT_ADDR` and `VAULT_TOKEN` are provided (these are set for the `app` service in the compose file). The server will wait for Vault and load credentials before starting.

Notes:
- The Vault service runs in dev mode with a well-known root token (`root`) for convenience only — do not use this in production.
- To inspect or change secrets manually, use `curl` against `http://localhost:8200/v1/secret/data/students` with header `X-Vault-Token: root`.

# crud
A simple application which performs database CRUD operations
