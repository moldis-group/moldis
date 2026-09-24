'use strict';
const groups=[
  {label:'First excitation energy E₁',units:{eV:'E1_eV',nm:'E1_nm'},initial:'E1_eV'},
  {label:'Second excitation energy E₂',units:{eV:'E2_eV',nm:'E2_nm'},initial:'E2_eV'},
  {label:'First oscillator strength f₁',units:{'a.u.':'f1_au'}},
  {label:'Second oscillator strength f₂',units:{'a.u.':'f2_au'}}
];
const names=Object.fromEntries(groups.flatMap(g=>Object.entries(g.units).map(([unit,key])=>[key,`${g.label} (${unit})`])));
const $=id=>document.getElementById(id);
const state={data:[],matches:[],page:0,selected:null,token:0};
const pageSize=25;
function parseTSV(text){
  const lines=text.replace(/^\uFEFF/,'').trim().split(/\r?\n/).filter(Boolean);
  const headers=lines.shift().split('\t').map(v=>v.trim());
  if(!headers.includes('Index'))throw Error('TSV is missing Index.');
  return lines.map((line,i)=>{
    const cells=line.split('\t');if(cells.length!==headers.length)throw Error(`Row ${i+2} has ${cells.length} columns; expected ${headers.length}.`);
    return Object.fromEntries(headers.map((h,j)=>[h,cells[j].trim()]));
  });
}
function setup(){
  for(const [key,label] of Object.entries({Index:'Index',n_C:'C count',n_H:'H count',n_N:'N count',n_O:'O count',n_F:'F count',...names})){
    const o=document.createElement('option');o.value=key;o.textContent=label;$('sort').append(o);
  }
  for(const atom of ['C','H','N','O','F']){
    const label=document.createElement('label');label.textContent=`${atom} atoms`;
    const input=document.createElement('input');input.type='number';input.min='0';input.step='1';input.placeholder='any';input.dataset.count=`n_${atom}`;input.addEventListener('input',render);
    label.append(input);$('composition').append(label);
  }
  for(const group of groups){
    const filter=document.createElement('div');filter.className='filter';
    const label=document.createElement('span');label.className='filter-label';label.textContent=group.label;filter.append(label);
    const fields=document.createElement('div');fields.className='filter-fields';
    for(const side of ['min','max']){
      const input=document.createElement('input');input.type='number';input.step='any';input.placeholder=side;input.dataset.bound=side;input.addEventListener('input',render);fields.append(input);
    }
    const unit=document.createElement('select');unit.setAttribute('aria-label',`${group.label} units`);
    for(const [label,key] of Object.entries(group.units)){const o=document.createElement('option');o.value=key;o.textContent=label;unit.append(o)}
    if(group.initial)unit.value=group.initial;unit.addEventListener('change',render);fields.append(unit);
    filter.append(fields);$('filters').append(filter);
  }
  for(const id of ['search','sort','order'])$(id).addEventListener(id==='search'?'input':'change',render);
  $('reset').addEventListener('click',()=>{document.querySelectorAll('.query input').forEach(x=>x.value='');$('sort').value='Index';$('order').value='asc';render()});
  $('prev').addEventListener('click',()=>{state.page--;paint()});$('next').addEventListener('click',()=>{state.page++;paint()});
}
function render(){
  const query=$('search').value.trim();
  const counts=[...document.querySelectorAll('[data-count]')].filter(x=>x.value!=='');
  const ranges=[...document.querySelectorAll('.filter')].map(el=>({key:el.querySelector('select').value,min:el.querySelector('[data-bound=min]').value,max:el.querySelector('[data-bound=max]').value})).filter(x=>x.min!==''||x.max!=='');
  state.matches=state.data.filter(row=>{
    if(query&&!row.Index.includes(query))return false;
    if(!counts.every(input=>Number(row[input.dataset.count])===Number(input.value)))return false;
    return ranges.every(x=>{const v=Number(row[x.key]);return Number.isFinite(v)&&(x.min===''||v>=Number(x.min))&&(x.max===''||v<=Number(x.max))});
  });
  const key=$('sort').value,sign=$('order').value==='desc'?-1:1;
  state.matches.sort((a,b)=>sign*(Number(a[key])-Number(b[key]))||Number(a.Index)-Number(b.Index));
  state.page=0;paint();
}
function paint(){
  const total=state.matches.length,pages=Math.ceil(total/pageSize);state.page=Math.max(0,Math.min(state.page,Math.max(0,pages-1)));
  $('status').textContent=`${total.toLocaleString()} of ${state.data.length.toLocaleString()} molecules match`;
  $('page').textContent=pages?`Page ${state.page+1} of ${pages}`:'No results';$('prev').disabled=state.page===0;$('next').disabled=state.page>=pages-1;
  const tbody=$('rows');tbody.replaceChildren();
  for(const row of state.matches.slice(state.page*pageSize,(state.page+1)*pageSize)){
    const tr=document.createElement('tr');tr.tabIndex=0;if(row.Index===state.selected)tr.className='selected';
    for(const key of ['Index','n_H','n_C','n_N','n_O','n_F','E1_eV','E2_eV']){const td=document.createElement('td');td.textContent=row[key]??'—';tr.append(td)}
    tr.addEventListener('click',()=>show(row));tr.addEventListener('keydown',e=>{if(e.key==='Enter')show(row)});tbody.append(tr);
  }
}
async function show(row){
  const token=++state.token;state.selected=row.Index;paint();
  const el=$('detail');el.replaceChildren();const title=document.createElement('h2');title.textContent=`QM8 ${row.Index}`;el.append(title);
  const dl=document.createElement('dl');for(const [key,value] of Object.entries(row)){
    if(key==='Index')continue;const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=names[key]??key;dd.textContent=value||'—';dl.append(dt,dd);
  }el.append(dl);
  if(!/^\d+$/.test(row.Index)){el.append('Invalid Index in TSV.');return}
  const stem=`dbqm8ex_${row.Index}`,xyzPath=`dbqm8ex_xyz/${stem}.xyz`;
  const link=document.createElement('a');link.href=xyzPath;link.download=`${stem}.xyz`;link.textContent='Download XYZ coordinates';el.append(link);
  const h=document.createElement('h3');h.textContent='3D structure';el.append(h);
  const box=document.createElement('div');box.className='viewer3d';el.append(box);
  const message=document.createElement('p');message.className='viewer-status';message.textContent='Loading 3D structure…';el.append(message);
  const fig=document.createElement('figure'),a=document.createElement('a'),img=document.createElement('img');
  a.href=`dbqm8ex_svg/${stem}.svg`;a.target='_blank';a.rel='noopener';img.src=a.href;img.alt=`2D structure of QM8 ${row.Index}`;img.loading='lazy';
  img.onerror=()=>{fig.replaceChildren();fig.append('2D image unavailable')};a.append(img);fig.append(a);el.append(fig);
  try{
    if(typeof $3Dmol==='undefined')throw Error('3Dmol library unavailable');
    const response=await fetch(xyzPath);if(!response.ok)throw Error(`XYZ HTTP ${response.status}`);
    const xyz=await response.text();if(token!==state.token)return;
    const viewer=$3Dmol.createViewer(box,{backgroundColor:'white'}),model=viewer.addModel(xyz,'xyz');
    const count=model.selectedAtoms({}).length;if(!count)throw Error('No atoms recognized in XYZ');
    viewer.setStyle({},{stick:{},sphere:{scale:0.3}});viewer.zoomTo();viewer.render();
    message.textContent=`${count} atoms loaded. Drag to rotate; scroll to zoom.`;
  }catch(error){if(token===state.token)message.textContent=`Could not show 3D structure: ${error.message}`}
}
async function start(){setup();try{
  const response=await fetch('dbqm8ex.tsv');if(!response.ok)throw Error(`TSV HTTP ${response.status}`);
  state.data=parseTSV(await response.text());
  for(const key of ['Index','n_C','n_H','n_N','n_O','n_F',...Object.keys(names)])if(!(key in (state.data[0]||{})))throw Error(`TSV is missing column ${key}`);
  render();if(state.matches.length)show(state.matches[0]);
}catch(error){$('status').textContent=`Could not load dataset: ${error.message}`}}
start();
