const toastEl = document.getElementById('toast');

async function fetchCities() {
  const res = await fetch('/cities');
  return res.json();
}

function showToast(msg, ms = 2500) {
  toastEl.textContent = msg;
  toastEl.style.display = 'block';
  setTimeout(() => (toastEl.style.display = 'none'), ms);
}

function makeCard(c) {
  const card = document.createElement('div');
  card.className = 'card';
  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = c.name;
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = `${c.country ?? '—'} ${c.population !== null ? '· ' + c.population.toLocaleString() : ''}`;
  const actions = document.createElement('div');
  actions.className = 'actions';

  const edit = document.createElement('button');
  edit.className = 'small ghost';
  edit.textContent = 'Edit';
  edit.onclick = async (e) => {
    e.stopPropagation();
    const newName = prompt('Name', c.name);
    if (newName == null) return;
    const newCountry = prompt('Country', c.country ?? '') || undefined;
    const newPopulationVal = prompt('Population', c.population ?? '')
    const newPopulation = newPopulationVal === '' ? undefined : Number(newPopulationVal);
    await fetch(`/cities/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, country: newCountry, population: newPopulation })
    });
    showToast('City updated');
    await render();
  };

  const del = document.createElement('button');
  del.className = 'small danger';
  del.textContent = 'Delete';
  del.onclick = async (e) => {
    e.stopPropagation();
    if (!confirm('Delete this city?')) return;
    await fetch(`/cities/${c.id}`, { method: 'DELETE' });
    showToast('City deleted');
    await render();
  };

  actions.appendChild(edit);
  actions.appendChild(del);

  card.appendChild(title);
  card.appendChild(meta);
  card.appendChild(actions);
  card.onclick = () => edit.onclick({ stopPropagation: () => {} });
  return card;
}

async function render(filterText = '') {
  const container = document.getElementById('citiesList');
  container.innerHTML = '';
  const cities = await fetchCities();
  const filtered = cities.filter(c => !filterText || (c.name || '').toLowerCase().includes(filterText) || (c.country||'').toLowerCase().includes(filterText));
  if (!filtered.length) {
    const empty = document.createElement('div');
    empty.className = 'card';
    empty.textContent = 'No cities yet — add one!';
    container.appendChild(empty);
    return;
  }
  for (const c of filtered) container.appendChild(makeCard(c));
}

document.getElementById('addForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const country = document.getElementById('country').value.trim() || undefined;
  const populationVal = document.getElementById('population').value;
  const population = populationVal === '' ? undefined : Number(populationVal);
  await fetch('/cities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, country, population }) });
  document.getElementById('addForm').reset();
  showToast('City added');
  await render(document.getElementById('filter').value.trim().toLowerCase());
});

document.getElementById('filter').addEventListener('input', (e) => {
  render(e.target.value.trim().toLowerCase());
});

render();
