# Express City API

A basic Express.js CRUD REST API that manages a `City` resource using an in-memory Array (no database).

## Quick Start

```bash
npm install
npm run dev
# or
npm start
```

Server starts on http://localhost:3000.

## Endpoints

- GET `/cities` – list all cities
- GET `/cities/:id` – get a city by id
- POST `/cities` – create a city `{ name, country?, population? }`
- PUT `/cities/:id` – replace a city (name required)
- PATCH `/cities/:id` – partial update
- DELETE `/cities/:id` – delete a city

## Example Requests

```bash
# Create
curl -X POST http://localhost:3000/cities \
  -H "Content-Type: application/json" \
  -d '{"name":"Addis Ababa","country":"Ethiopia","population":5000000}'

# List
curl http://localhost:3000/cities

# Read
curl http://localhost:3000/cities/1

# Update
curl -X PUT http://localhost:3000/cities/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Addis","country":"ET","population":6000000}'

# Patch
curl -X PATCH http://localhost:3000/cities/1 \
  -H "Content-Type: application/json" \
  -d '{"population":6100000}'

# Delete
curl -X DELETE http://localhost:3000/cities/1
```

## Testing

```bash
npm test
```

Runs Jest + Supertest and validates the full CRUD flow.

## Notes
- In-memory storage means data resets on process restart.
- CORS and JSON middleware are enabled.
