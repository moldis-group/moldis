'use strict';
const $ = id => document.getElementById(id);
const options = {
  '1': {name:'Level 1 · SCS-PBE-QIDH/VDZ', path:'level-1/SCS-PBE-QIDH_VDZ_30797/SCS-PBE-QIDH_VDZ_30797.csv'},
  '2': {name:'Level 2 · LCC2/VDZ', path:'level-2/LCC2_VDZ_2032.csv'},
  '3': {name:'Level 3 · optimized geometries', path:'level-3/OPT_wB97XD3_def2TZVP_119/geometry_index.csv'},
  '4': {name:'Level 4 · refined excitation energies', methods:{
    ladc2:'level-4/LADC2_AVDZ_72/LADC2_AVDZ_72.csv',
    lcc2:'level-4/LCC2_AVDZ_72/LCC2_AVDZ_72.csv'
  }}
};
const level = new URLSearchParams(location.search).get('level');
const state = {data:[], matches:[], columns:[], page:0, selected:null, token:0};
const pageSize = 25;
function parseCSV(text) {
  const records = [];
  let row=[], cell='', quoted=false;
  text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(quoted){if(ch==='"'&&text[i+1]==='"'){cell+='"';i++}else if(ch==='"')quoted=false;else cell+=ch}
    else if(ch==='"')quoted=true;
    else if(ch===','){row.push(cell);cell=''}
    else if(ch==='\n'||ch==='\r'){
      if(ch==='\r'&&text[i+1]==='\n')i++;
      row.push(cell);cell='';if(row.some(v=>v.trim()))records.push(row);row=[];
    }else cell+=ch;
  }
  if(quoted)throw Error('Unclosed CSV quotation mark.');
  row.push(cell);if(row.some(v=>v.trim()))records.push(row);
  const columns=records.shift()?.map(v=>v.trim());
  if(!columns?.includes('Mol_Index'))throw Error('CSV must have a Mol_Index column.');
  if(level!=='3'&&!['PAH','S1','T1','STG'].every(c=>columns.includes(c)))
    throw Error('CSV is missing PAH, S1, T1, or STG.');
  const data=records.map((cells,i)=>{
    if(cells.length!==columns.length)throw Error(`Row ${i+2}: expected ${columns.length} columns; found ${cells.length}.`);
    return {...Object.fromEntries(columns.map((c,j)=>[c,cells[j].trim()])),_index:i};
  });
  return {columns,data};
}
function configure(){
  if(!options[level]){$('heading').textContent='Unknown level';$('status').textContent='Choose a level from the dataset home page.';return false}
  $('heading').textContent=options[level].name;
  $('subtitle').textContent=level==='3'?'Optimized ωB97X-D3/def2-TZVP XYZ structures.':
    'Search PAH groups, excitation energies, and singlet–triplet gaps (eV).';
  $('method-label').hidden=level!=='4';
  $('pah-label').hidden=level==='3';
  $('range-heading').hidden=level==='3';
  for(const id of ['search','pah'])$(id).addEventListener('input',render);
  for(const id of ['sort','order'])$(id).addEventListener('change',render);
  $('method').addEventListener('change',load);
  $('reset').addEventListener('click',()=>{
    document.querySelectorAll('.query input').forEach(el=>el.value='');
    $('sort').value='Mol_Index';$('order').value='asc';render();
  });
  $('prev').addEventListener('click',()=>{state.page--;paint()});
  $('next').addEventListener('click',()=>{state.page++;paint()});
  return true;
}
function buildControls(){
  $('filters').replaceChildren();$('sort').replaceChildren();
  const fields=state.columns.filter(c=>c==='Mol_Index'||c==='PAH'||c==='S1'||c==='T1'||c==='STG'||c==='f01');
  const labels={Mol_Index:'Molecule ID',PAH:'PAH index',S1:'S₁ (eV)',T1:'T₁ (eV)',STG:'S₁ − T₁ (eV)',f01:'f₀₁ (a.u.)'};
  for(const key of fields){
    const option=document.createElement('option');option.value=key;option.textContent=labels[key];$('sort').append(option);
    if(key==='Mol_Index'||key==='PAH')continue;
    const div=document.createElement('div');div.className='filter';
    const title=document.createElement('span');title.textContent=labels[key];div.append(title);
    for(const bound of ['min','max']){
      const label=document.createElement('label');label.textContent=bound==='min'?'Minimum':'Maximum';
      const input=document.createElement('input');input.type='number';input.step='any';input.dataset.key=key;input.dataset.bound=bound;
      input.placeholder=bound;input.addEventListener('input',render);label.append(input);div.append(label);
    }
    $('filters').append(div);
  }
  const tr=document.createElement('tr');
  for(const key of fields){const th=document.createElement('th');th.textContent=labels[key];tr.append(th)}
  $('thead').replaceChildren(tr);
  $('sort').value='Mol_Index';$('order').value='asc';
}
function render(){
  const query=$('search').value.trim().toLowerCase(),pah=$('pah').value;
  const ranges=[...document.querySelectorAll('.filter')].map(filter=>({
    key:filter.querySelector('[data-bound="min"]').dataset.key,
    min:filter.querySelector('[data-bound="min"]').value,
    max:filter.querySelector('[data-bound="max"]').value
  })).filter(x=>x.min!==''||x.max!=='');
  state.matches=state.data.filter(row=>{
    if(query&&!row.Mol_Index.toLowerCase().includes(query))return false;
    if(pah!==''&&Number(row.PAH)!==Number(pah))return false;
    return ranges.every(x=>{
      const v=Number(row[x.key]);
      return row[x.key]!==''&&Number.isFinite(v)&&(x.min===''||v>=Number(x.min))&&(x.max===''||v<=Number(x.max));
    });
  });
  const key=$('sort').value,sign=$('order').value==='desc'?-1:1;
  state.matches.sort((a,b)=>{
    if(key==='Mol_Index')return sign*a.Mol_Index.localeCompare(b.Mol_Index,undefined,{numeric:true});
    const x=Number(a[key]),y=Number(b[key]);
    if(a[key]===''||!Number.isFinite(x))return 1;if(b[key]===''||!Number.isFinite(y))return -1;
    return sign*(x-y)||a.Mol_Index.localeCompare(b.Mol_Index,undefined,{numeric:true});
  });
  state.page=0;paint();
}
function paint(){
  const total=state.matches.length,pages=Math.ceil(total/pageSize);
  state.page=Math.max(0,Math.min(state.page,Math.max(0,pages-1)));
  $('status').textContent=`${total.toLocaleString()} of ${state.data.length.toLocaleString()} molecules match`;
  $('page').textContent=pages?`Page ${state.page+1} of ${pages}`:'No results';
  $('prev').disabled=state.page===0;$('next').disabled=state.page>=pages-1;
  const tbody=$('rows');tbody.replaceChildren();
  const fields=state.columns.filter(c=>c==='Mol_Index'||c==='PAH'||c==='S1'||c==='T1'||c==='STG'||c==='f01');
  for(const row of state.matches.slice(state.page*pageSize,(state.page+1)*pageSize)){
    const tr=document.createElement('tr');tr.tabIndex=0;
    if(row.Mol_Index===state.selected)tr.className='selected';
    for(const key of fields){const td=document.createElement('td');td.textContent=row[key]||'—';tr.append(td)}
    tr.addEventListener('click',()=>show(row));
    tr.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show(row)}});
    tbody.append(tr);
  }
}
function xyzPaths(id){
  const optimized=`level-3/OPT_wB97XD3_def2TZVP_119/xyz/${id}.xyz`;
  const tpssh=`level-1/XYZ_TPSSh/xyz/${id}.xyz`;
  return level==='3'||level==='4'?[optimized]:[tpssh];
}
async function show(row){
  const token=++state.token;state.selected=row.Mol_Index;paint();
  const detail=$('detail');detail.replaceChildren();
  const title=document.createElement('h2');title.textContent=row.Mol_Index;detail.append(title);
  if(level!=='3'){
    const dl=document.createElement('dl');
    for(const key of state.columns.filter(c=>c==='PAH'||c==='S1'||c==='T1'||c==='STG'||c==='f01')){
      const dt=document.createElement('dt'),dd=document.createElement('dd');
      dt.textContent=key==='PAH'?'PAH index':key==='STG'?'S₁ − T₁ (eV)':key==='f01'?'f₀₁ (a.u.)':`${key} (eV)`;
      dd.textContent=row[key]||'—';dl.append(dt,dd);
    }
    detail.append(dl);
  }
  const h=document.createElement('h3');h.textContent='3D structure';detail.append(h);
  const box=document.createElement('div');box.className='viewer3d';detail.append(box);
  const message=document.createElement('p');message.className='viewer-status';message.textContent='Loading XYZ…';detail.append(message);
  if(!/^BNPAH_\d+$/i.test(row.Mol_Index)){message.textContent='Invalid molecule ID in CSV.';return}
  try{
    let xyz,chosen;
    for(const path of xyzPaths(row.Mol_Index)){
      const res=await fetch(path);if(token!==state.token)return;
      if(res.ok){xyz=await res.text();chosen=path;break}
    }
    if(!xyz)throw Error('XYZ file not found in the expected folders.');
    if(typeof $3Dmol==='undefined')throw Error('3Dmol library unavailable.');
    const viewer=$3Dmol.createViewer(box,{backgroundColor:'white'});
    const model=viewer.addModel(xyz,'xyz');
    if(!model.selectedAtoms({}).length)throw Error('No atoms recognized in XYZ.');
    viewer.setStyle({},{stick:{},sphere:{scale:0.3}});viewer.zoomTo();viewer.render();
    const link=document.createElement('a');link.href=chosen;link.download=`${row.Mol_Index}.xyz`;
    link.textContent='Download XYZ';detail.append(link);
    message.textContent=chosen.includes('OPT_wB97XD3')?'Optimized geometry · drag to rotate; scroll to zoom.':'TPSSh geometry · drag to rotate; scroll to zoom.';
  }catch(error){if(token===state.token)message.textContent=`Could not display structure: ${error.message}`}
}
async function load(){
  const path=level==='4'?options[level].methods[$('method').value]:options[level].path;
  ++state.token;state.selected=null;$('detail').textContent='Select a molecule to see its properties and structure.';
  $('status').textContent='Loading CSV…';
  try{
    const res=await fetch(path);if(!res.ok)throw Error(`HTTP ${res.status}: ${path}`);
    const parsed=parseCSV(await res.text());state.data=parsed.data;state.columns=parsed.columns;
    buildControls();render();if(state.matches.length)show(state.matches[0]);
  }catch(error){$('status').textContent=`Could not load dataset: ${error.message}`;
    if(level==='3')$('status').textContent+=' Generate geometry_index.csv as described in README.md.';
  }
}
if(configure())load();
