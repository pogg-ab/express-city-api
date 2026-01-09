const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve a minimal static UI from the `public` folder
app.use(express.static(path.join(__dirname, '..', 'public')));
let cities = [];
let idCounter = 1;

function parseId(idParam) {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function validateCityPayload(body, { partial = false } = {}) {
  const errors = [];
  if (!partial || body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      errors.push('name must be a non-empty string');
    }
  }
  if (body.country !== undefined && typeof body.country !== 'string') {
    errors.push('country must be a string');
  }
  if (body.population !== undefined) {
    const pop = Number(body.population);
    if (!Number.isFinite(pop) || pop < 0) {
      errors.push('population must be a non-negative number');
    }
  }
  return { valid: errors.length === 0, errors };
}

app.get('/cities', (req, res) => {
  // If the client prefers HTML (a browser), serve the UI page.
  if (req.accepts && req.accepts('html')) {
    return res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  }
  res.json(cities);
});

app.get('/cities/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid id' });
  const city = cities.find(c => c.id === id);
  if (!city) return res.status(404).json({ error: 'city not found' });
  res.json(city);
});

app.post('/cities', (req, res) => {
  const { valid, errors } = validateCityPayload(req.body, { partial: false });
  if (!valid) return res.status(400).json({ errors });
  const city = {
    id: idCounter++,
    name: req.body.name.trim(),
    country: req.body.country ?? null,
    population: req.body.population !== undefined ? Number(req.body.population) : null,
  };
  cities.push(city);
  res.status(201).json(city);
});

app.put('/cities/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid id' });
  const idx = cities.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'city not found' });
  const { valid, errors } = validateCityPayload(req.body, { partial: false });
  if (!valid) return res.status(400).json({ errors });
  const updated = {
    id,
    name: req.body.name.trim(),
    country: req.body.country ?? null,
    population: req.body.population !== undefined ? Number(req.body.population) : null,
  };
  cities[idx] = updated;
  res.json(updated);
});

app.patch('/cities/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid id' });
  const idx = cities.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'city not found' });
  const { valid, errors } = validateCityPayload(req.body, { partial: true });
  if (!valid) return res.status(400).json({ errors });
  const current = cities[idx];
  const updated = {
    ...current,
    name: req.body.name !== undefined ? String(req.body.name).trim() : current.name,
    country: req.body.country !== undefined ? req.body.country : current.country,
    population: req.body.population !== undefined ? Number(req.body.population) : current.population,
  };
  cities[idx] = updated;
  res.json(updated);
});

app.delete('/cities/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid id' });
  const idx = cities.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'city not found' });
  cities.splice(idx, 1);
  res.status(204).send();
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

module.exports = { app };
