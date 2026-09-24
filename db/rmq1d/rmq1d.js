'use strict';
const fields = [
  ['Formation_Energy_eV','Formation energy (eV/atom)'],
  ['Atomization_Energy_eV','Atomization energy (eV/atom)'],
  ['Bandgap_eV','Bandgap (eV)'],
  ['Bandgap_nm','Bandgap (nm)'],
  ['Smallest_Direct_Bandgap_eV','Smallest direct bandgap (eV)'],
  ['Smallest_Direct_Bandgap_nm','Smallest direct bandgap (nm)'],
  ['No_of_im_wave_nos_dimensionless','Imaginary wave numbers'],
  ['Lowest_wave_no_cm-1','Lowest wave number (cm⁻¹)'],
  ['Lowest_wave_no_THz','Lowest wave number (THz)'],
  ['q*_A-1','q* (Å⁻¹)'],
  ['I1/I3_dimensionless','I₁/I₃'],
  ['I2/I3_dimensionless','I₂/I₃']
];
const $ = id => document.getElementById(id);
const state = {data:[],matches:[],page:0,selected:null};
const pageSize = 25;
const numeric = value => value === '' || value == null ? NaN : Number(value);
const display = value => value === '' || value == null ? '—' : value;
function parseTSV(text) {
  const lines = text.replace(/^\uFEFF/,'').trim().split(/\r?\n/).filter(Boolean);
  const names = lines.shift().split('\t').map(s=>s.trim());
  if (!names.includes('Index')) throw Error('rmq1d.tsv must have an Index column.');
  return lines.map((line,n)=>{
    const values=line.split('\t');
    if(values.length!==names.length) throw Error(`TSV row ${n+2}: expected ${names.length} columns, got ${values.length}.`);
    return Object.fromEntries(names.map((key,i)=>[key,values[i].trim()]));
  });
}
function setup() {
  for(const [key,label] of fields) {
    const option=document.createElement('option'); option.value=key; option.textContent=label; $('sort').append(option);
    const wrap=document.createElement('label'); wrap.className='filter'; wrap.textContent=label;
    const range=document.createElement('span');range.className='range';
    for(const side of ['min','max']) {const input=document.createElement('input');input.type='number';input.step='any';input.placeholder=side;input.dataset.field=key;input.dataset.side=side;input.addEventListener('input',render);range.append(input)}
    wrap.append(range);$('filters').append(wrap);
  }
  $('indexSearch').addEventListener('input',render);
  $('sort').addEventListener('change',render);
  $('order').addEventListener('change',render);
  $('prev').addEventListener('click',()=>{state.page--;paint()});
  $('next').addEventListener('click',()=>{state.page++;paint()});
  $('reset').addEventListener('click',()=>{document.querySelectorAll('.filters input').forEach(input=>input.value='');$('indexSearch').value='';$('sort').value=fields[0][0];$('order').value='asc';render()});
}
function render() {
  const index=$('indexSearch').value.trim().toLowerCase();
  const inputs=[...document.querySelectorAll('.filters input')].filter(x=>x.value.trim()!=='');
  state.matches=state.data.filter(row=>{
    if(index && !row.Index.toLowerCase().includes(index))return false;
    return inputs.every(input=>{
      const value=numeric(row[input.dataset.field]), bound=Number(input.value);
      return Number.isFinite(value) && (input.dataset.side==='min' ? value>=bound : value<=bound);
    });
  });
  const field=$('sort').value,sign=$('order').value==='desc'?-1:1;
  state.matches.sort((a,b)=>{
    const x=numeric(a[field]),y=numeric(b[field]);
    if(!Number.isFinite(x))return 1;if(!Number.isFinite(y))return -1;
    return sign*(x-y)||numeric(a.Index)-numeric(b.Index);
  });
  state.page=0;paint();
}
function paint() {
  const total=state.matches.length,pages=Math.ceil(total/pageSize);
  state.page=Math.max(0,Math.min(state.page,Math.max(0,pages-1)));
  $('status').textContent=`${total.toLocaleString()} of ${state.data.length.toLocaleString()} records match`;
  $('page').textContent=pages?`Page ${state.page+1} of ${pages}`:'No results';
  $('prev').disabled=state.page===0;$('next').disabled=state.page>=pages-1;
  const tbody=$('rows');tbody.replaceChildren();
  for(const row of state.matches.slice(state.page*pageSize,(state.page+1)*pageSize)) {
    const tr=document.createElement('tr');tr.tabIndex=0;
    if(row.Index===state.selected)tr.className='selected';
    for(const field of ['Index','Formation_Energy_eV','Atomization_Energy_eV','Bandgap_eV','No_of_im_wave_nos_dimensionless','Lowest_wave_no_cm-1']) {
      const td=document.createElement('td');td.textContent=display(row[field]);tr.append(td);
    }
    tr.addEventListener('click',()=>show(row));tr.addEventListener('keydown',e=>{if(e.key==='Enter')show(row)});tbody.append(tr);
  }
}
function addFigure(parent,path,caption) {
  const figure=document.createElement('figure'),link=document.createElement('a');link.href=path;link.target='_blank';link.rel='noopener';
  const img=document.createElement('img');img.loading='lazy';img.alt=caption;
  img.onerror=()=>{figure.replaceChildren();const p=document.createElement('p');p.textContent=`${caption}: file unavailable`;figure.append(p)};
  img.src=path;link.append(img);figure.append(link);
  const label=document.createElement('figcaption');label.textContent=caption;figure.append(label);parent.append(figure);
}
function show(row) {
  state.selected=row.Index;paint();
  const el=$('detail');el.replaceChildren();const h=document.createElement('h2');h.textContent=`RMQ1D ${row.Index}`;el.append(h);
  const dl=document.createElement('dl');for(const [key,label] of fields){const dt=document.createElement('dt');dt.textContent=label;const dd=document.createElement('dd');dd.textContent=display(row[key]);dl.append(dt,dd)}el.append(dl);
  // The filename is constructed from the numeric TSV index, never from arbitrary input.
  if(!/^\d+$/.test(row.Index))return;
  const stem=`rmq1d_${row.Index}`;
  const xyz=document.createElement('a');xyz.href=`rmq1d_xyz/${stem}.xyz`;xyz.download=`${stem}.xyz`;xyz.textContent='Download XYZ coordinates';el.append(xyz);
  addFigure(el,`rmq1d_svg/${stem}.svg`,'2D unit cell components');
  addFigure(el,`rmq1d_svg/${stem}_BS.svg`,'Electronic band structure');
  addFigure(el,`rmq1d_svg/${stem}_phonon_BS.svg`,'Phonon band structure');
}
async function main(){setup();try{const response=await fetch('rmq1d.tsv');if(!response.ok)throw Error(`HTTP ${response.status}: rmq1d.tsv`);state.data=parseTSV(await response.text());render()}catch(error){$('status').textContent=`Could not load the dataset: ${error.message}. Serve this folder with a local HTTP server or GitHub Pages.`}}
main();
