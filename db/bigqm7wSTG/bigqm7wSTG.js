'use strict';
const properties = [
  {key: 'S1_ADC2(eV)', label: 'S₁ excitation energy', unit: 'eV'},
  {key: 'T1_ADC2(eV)', label: 'T₁ excitation energy', unit: 'eV'},
  {key: 'gap_ADC2(eV)', label: 'S₁ − T₁ gap', unit: 'eV', computed: true},
  {key: 'f01_ADC2(au)', label: 'S₀ → S₁ oscillator strength f₀₁', unit: 'a.u.'}
];
const $ = id => document.getElementById(id);
const state = {data: [], matches: [], page: 0, selected: null, token: 0};
const pageSize = 25;
const elements = ['C', 'H', 'N', 'O', 'F'];

function countAtoms(value, expected) {
  const atoms = JSON.parse(value.replace(/'/g, '"'));
  if (!Array.isArray(atoms) || atoms.length !== Number(expected) ||
      !atoms.every(atom => elements.includes(atom))) throw Error('Invalid atoms list.');
  const counts = Object.fromEntries(elements.map(element => [element, 0]));
  for (const atom of atoms) counts[atom]++;
  return {atoms, counts};
}

// Quoted CSV fields may contain commas, as in atoms and coordinates.
function parseCSV(text) {
  const records = [];
  let row = [], field = '', quoted = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some(value => value.trim())) records.push(row);
      row = [];
    } else field += ch;
  }
  if (quoted) throw Error('CSV ends inside a quoted field.');
  row.push(field);
  if (row.some(value => value.trim())) records.push(row);
  const headers = records.shift();
  if (!headers) throw Error('CSV is empty.');
  const required = ['SMI', 'Natoms', 'atoms', 'coords(Ang)', ...properties.filter(p => !p.computed).map(p => p.key)];
  for (const key of required) if (!headers.includes(key)) throw Error(`Missing CSV column: ${key}`);
  return records.map((cells, i) => {
    if (cells.length !== headers.length) throw Error(`CSV row ${i + 2}: expected ${headers.length} columns, got ${cells.length}.`);
    const molecule = {...Object.fromEntries(headers.map((key, j) => [key, cells[j].trim()])), index: i};
    const s1 = Number(molecule['S1_ADC2(eV)']);
    const t1 = Number(molecule['T1_ADC2(eV)']);
    molecule['gap_ADC2(eV)'] = molecule['S1_ADC2(eV)'] !== '' && molecule['T1_ADC2(eV)'] !== '' && Number.isFinite(s1) && Number.isFinite(t1)
      ? (s1 - t1).toFixed(6) : '';
    try {
      const composition = countAtoms(molecule.atoms, molecule.Natoms);
      molecule.atomList = composition.atoms;
      molecule.counts = composition.counts;
      molecule.formula = elements.filter(e => molecule.counts[e]).map(e =>
        e + (molecule.counts[e] === 1 ? '' : molecule.counts[e])).join('');
    } catch (error) { throw Error(`CSV row ${i + 2}: ${error.message}`); }
    return molecule;
  });
}

function setup() {
  for (const element of elements) {
    const label = document.createElement('label'); label.textContent = `${element} atoms`;
    const input = document.createElement('input'); input.type = 'number'; input.min = '0'; input.step = '1';
    input.placeholder = 'any'; input.dataset.element = element;
    input.addEventListener('input', render); label.append(input); $('composition').append(label);
  }
  for (const property of properties) {
    const div = document.createElement('div'); div.className = 'filter';
    const title = document.createElement('span'); title.textContent = `${property.label} (${property.unit})`; div.append(title);
    for (const bound of ['min', 'max']) {
      const label = document.createElement('label'); label.textContent = bound === 'min' ? 'Minimum' : 'Maximum';
      const input = document.createElement('input'); input.type = 'number'; input.step = 'any'; input.placeholder = bound;
      input.dataset.key = property.key; input.dataset.bound = bound;
      input.addEventListener('input', render); label.append(input); div.append(label);
    }
    $('filters').append(div);
  }
  $('search').addEventListener('input', render);
  for (const id of ['sort', 'order']) $(id).addEventListener('change', render);
  $('reset').addEventListener('click', () => {
    document.querySelectorAll('.query input').forEach(input => input.value = '');
    $('sort').value = 'index'; $('order').value = 'asc'; render();
  });
  $('prev').addEventListener('click', () => { state.page--; paint(); });
  $('next').addEventListener('click', () => { state.page++; paint(); });
}
function render() {
  const term = $('search').value.trim().toLowerCase();
  const composition = [...document.querySelectorAll('[data-element]')]
    .filter(input => input.value !== '');
  const bounds = [...document.querySelectorAll('.filter')].map(filter => ({
    key: filter.querySelector('input[data-bound="min"]').dataset.key,
    min: filter.querySelector('input[data-bound="min"]').value,
    max: filter.querySelector('input[data-bound="max"]').value
  })).filter(b => b.min !== '' || b.max !== '');
  state.matches = state.data.filter(m => {
    if (term && !m.SMI.toLowerCase().includes(term)) return false;
    if (!composition.every(input => Number.isInteger(Number(input.value)) &&
        Number(input.value) >= 0 && m.counts[input.dataset.element] === Number(input.value))) return false;
    return bounds.every(b => {
      const value = Number(m[b.key]);
      return m[b.key] !== '' && Number.isFinite(value) &&
        (b.min === '' || value >= Number(b.min)) && (b.max === '' || value <= Number(b.max));
    });
  });
  const key = $('sort').value, sign = $('order').value === 'desc' ? -1 : 1;
  if (key !== 'index' || sign === -1) state.matches.sort((a, b) =>
    sign * (Number(a[key]) - Number(b[key])) || a.index - b.index);
  state.page = 0; paint();
}
function paint() {
  const total = state.matches.length, pages = Math.ceil(total / pageSize);
  state.page = Math.max(0, Math.min(state.page, Math.max(0, pages - 1)));
  $('status').textContent = `${total.toLocaleString()} of ${state.data.length.toLocaleString()} molecules match`;
  $('page').textContent = pages ? `Page ${state.page + 1} of ${pages}` : 'No results';
  $('prev').disabled = state.page === 0; $('next').disabled = state.page >= pages - 1;
  const tbody = $('rows'); tbody.replaceChildren();
  for (const molecule of state.matches.slice(state.page * pageSize, (state.page + 1) * pageSize)) {
    const tr = document.createElement('tr'); tr.tabIndex = 0;
    if (molecule.index === state.selected) tr.className = 'selected';
    for (const key of ['SMI', 'formula', 'Natoms', ...properties.map(p => p.key)]) {
      const td = document.createElement('td'); td.textContent = molecule[key] || '—'; tr.append(td);
    }
    tr.addEventListener('click', () => show(molecule));
    tr.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(molecule); } });
    tbody.append(tr);
  }
}
function xyzFromRow(molecule) {
  // These two CSV fields are Python-style lists of symbols and Cartesian coordinates.
  const atoms = molecule.atomList;
  const coords = JSON.parse(molecule['coords(Ang)']);
  const count = Number(molecule.Natoms);
  if (!Array.isArray(atoms) || !Array.isArray(coords) || !Number.isInteger(count) ||
      count < 1 || count > 1000 || atoms.length !== count || coords.length !== count)
    throw Error('Atom and coordinate counts do not match.');
  const lines = atoms.map((atom, i) => {
    const point = coords[i];
    if (!/^[A-Z][a-z]?$/.test(atom) || !Array.isArray(point) || point.length !== 3 ||
        !point.every(v => typeof v === 'number' && Number.isFinite(v)))
      throw Error(`Invalid atom or coordinates at position ${i + 1}.`);
    return `${atom} ${point.join(' ')}`;
  });
  return `${count}\n${molecule.SMI}\n${lines.join('\n')}\n`;
}
function show(molecule) {
  const token = ++state.token; state.selected = molecule.index; paint();
  const detail = $('detail'); detail.replaceChildren();
  const h2 = document.createElement('h2'); h2.textContent = molecule.SMI; detail.append(h2);
  const summary = document.createElement('p'); summary.textContent = `${molecule.formula} · ${molecule.Natoms} atoms · ADC(2)`; detail.append(summary);
  const dl = document.createElement('dl');
  for (const p of properties) {
    const dt = document.createElement('dt'), dd = document.createElement('dd');
    dt.textContent = `${p.label} (${p.unit})`; dd.textContent = molecule[p.key] || '—'; dl.append(dt, dd);
  }
  detail.append(dl);
  const title = document.createElement('h3'); title.textContent = '3D structure'; detail.append(title);
  const box = document.createElement('div'); box.className = 'viewer3d'; detail.append(box);
  const message = document.createElement('p'); message.className = 'viewer-status'; detail.append(message);
  try {
    const xyz = xyzFromRow(molecule);
    const download = document.createElement('a');
    download.href = URL.createObjectURL(new Blob([xyz], {type: 'chemical/x-xyz'}));
    download.download = `bigqm7wSTG_${molecule.index + 1}.xyz`;
    download.textContent = 'Download XYZ coordinates'; detail.append(download);
    if (typeof $3Dmol === 'undefined') throw Error('3Dmol library unavailable.');
    const viewer = $3Dmol.createViewer(box, {backgroundColor: 'white'});
    const model = viewer.addModel(xyz, 'xyz');
    if (!model.selectedAtoms({}).length) throw Error('No atoms recognized in coordinates.');
    viewer.setStyle({}, {stick: {}, sphere: {scale: 0.3}});
    viewer.zoomTo(); viewer.render();
    if (token === state.token) message.textContent = 'Drag to rotate; scroll to zoom.';
  } catch (error) {
    message.textContent = `Could not display 3D structure: ${error.message}`;
  }
}
async function start() {
  setup();
  try {
    const response = await fetch('data_bigqm7w_S1T1.csv');
    if (!response.ok) throw Error(`CSV HTTP ${response.status}`);
    state.data = parseCSV(await response.text());
    render(); if (state.matches.length) show(state.matches[0]);
  } catch (error) { $('status').textContent = `Could not load dataset: ${error.message}`; }
}
start();
