'use strict';
const groups = [
  {label:'Total electronic energy',units:{Ha:'esp'}},
  {label:'Out-of-plane deviation',units:{'Å':'oop'}},
  {label:'Dipole moment',units:{D:'dp'}},
  {label:'Atomization energy',units:{eV:'aeev',Ha:'aehart','kcal/mol':'aekcal','kJ/mol':'aej'},initial:'aeev'},
  {label:'Atomization energy per electron',units:{eV:'aepeev',Ha:'aepehart','kcal/mol':'aepekcal','kJ/mol':'aepej'},initial:'aepeev'},
  {label:'HOMO',units:{eV:'homoev',Ha:'homohart','kcal/mol':'homokcal','kJ/mol':'homoj'},initial:'homoev'},
  {label:'LUMO',units:{eV:'lumoev',Ha:'lumohart','kcal/mol':'lumokcal','kJ/mol':'lumoj'},initial:'lumoev'},
  {label:'HOMO–LUMO gap',units:{eV:'hlgapev',Ha:'hlgaphart','kcal/mol':'hlgapkcal','kJ/mol':'hlgapj'},initial:'hlgapev'},
  {label:'BNPAH–parent atomization energy difference',units:{eV:'diffaeev',Ha:'diffaehart','kcal/mol':'diffaekcal','kJ/mol':'diffaej'},initial:'diffaeev'},
  {label:'BNPAH–parent gap difference',units:{eV:'diffhlgapev',Ha:'diffhlgaphart','kcal/mol':'diffhlgapkcal','kJ/mol':'diffhlgapj'},initial:'diffhlgapev'}
];
const names = Object.fromEntries(groups.flatMap(g=>Object.entries(g.units).map(([unit,key])=>[key,`${g.label} (${unit})`])));
const $ = id=>document.getElementById(id);
const state={data:[],matches:[],page:0,selected:null,token:0};
const pageSize=25;
const number=v=>v===''||v==null?NaN:Number(v);
function parseTSV(text){
  const lines=text.replace(/^\uFEFF/,'').trim().split(/\r?\n/).filter(Boolean);
  const headers=lines.shift().split('\t').map(v=>v.trim());
  if(!headers.includes('filename'))throw Error('TSV is missing its filename column.');
  return lines.map((line,i)=>{
    const cells=line.split('\t');
    if(cells.length!==headers.length)throw Error(`Row ${i+2} has ${cells.length} columns; expected ${headers.length}.`);
    return Object.fromEntries(headers.map((h,j)=>[h,cells[j].trim()]));
  });
}
function setup(){
  const sort=$('sort');
  for(const [key,label] of Object.entries({filename:'Filename',nc:'C count',nh:'H count',nn:'N count',nb:'B count',...names})){
    const option=document.createElement('option');option.value=key;option.textContent=label;sort.append(option);
  }
  for(const symbol of ['C','H','N','B']){
    const label=document.createElement('label');label.textContent=`${symbol} atoms`;
    const input=document.createElement('input');input.type='number';input.min='0';input.step='1';input.placeholder='any';input.dataset.count=`n${symbol.toLowerCase()}`;
    input.addEventListener('input',render);label.append(input);$('composition').append(label);
  }
  for(const group of groups){
    const filter=document.createElement('div');filter.className='filter';
    const title=document.createElement('span');title.className='filter-label';title.textContent=group.label;filter.append(title);
    const fields=document.createElement('div');fields.className='filter-fields';
    const low=document.createElement('input'),high=document.createElement('input');
    for(const [input,side] of [[low,'min'],[high,'max']]){
      input.type='number';input.step='any';input.placeholder=side;input.dataset.bound=side;input.addEventListener('input',render);fields.append(input);
    }
    const unit=document.createElement('select');unit.setAttribute('aria-label',`${group.label} units`);
    for(const [label,key] of Object.entries(group.units)){
      const option=document.createElement('option');option.value=key;option.textContent=label;unit.append(option);
    }
    if(group.initial)unit.value=group.initial;
    unit.addEventListener('change',render);fields.append(unit);filter.append(fields);$('filters').append(filter);
  }
  for(const id of ['search','sort','order'])$(id).addEventListener(id==='search'?'input':'change',render);
  $('reset').addEventListener('click',()=>{
    document.querySelectorAll('.query input').forEach(x=>x.value='');
    $('sort').value='filename';$('order').value='asc';render();
  });
  $('prev').addEventListener('click',()=>{state.page--;paint()});
  $('next').addEventListener('click',()=>{state.page++;paint()});
}
function render(){
  const search=$('search').value.trim().toLowerCase();
  const counts=[...document.querySelectorAll('[data-count]')].filter(x=>x.value!=='');
  const ranges=[...document.querySelectorAll('.filter')].map(el=>({
    key:el.querySelector('select').value,
    min:el.querySelector('[data-bound=min]').value,
    max:el.querySelector('[data-bound=max]').value
  })).filter(x=>x.min!==''||x.max!=='');
  state.matches=state.data.filter(row=>{
    if(search&&!row.filename.toLowerCase().includes(search))return false;
    if(!counts.every(input=>number(row[input.dataset.count])===Number(input.value)))return false;
    return ranges.every(x=>{
      const value=number(row[x.key]);
      return Number.isFinite(value)&&(x.min===''||value>=Number(x.min))&&(x.max===''||value<=Number(x.max));
    });
  });
  const key=$('sort').value,sign=$('order').value==='desc'?-1:1;
  state.matches.sort((a,b)=>{
    if(key==='filename')return sign*a.filename.localeCompare(b.filename,undefined,{numeric:true});
    const x=number(a[key]),y=number(b[key]);
    if(!Number.isFinite(x))return 1;if(!Number.isFinite(y))return -1;
    return sign*(x-y)||a.filename.localeCompare(b.filename,undefined,{numeric:true});
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
  for(const row of state.matches.slice(state.page*pageSize,(state.page+1)*pageSize)){
    const tr=document.createElement('tr');tr.tabIndex=0;if(row.filename===state.selected)tr.className='selected';
    for(const key of ['filename','nc','nh','nn','nb','dp','hlgapev']){
      const td=document.createElement('td');td.textContent=row[key]??'—';tr.append(td);
    }
    tr.addEventListener('click',()=>show(row));tr.addEventListener('keydown',e=>{if(e.key==='Enter')show(row)});tbody.append(tr);
  }
}
function figure(parent,path,label){
  const fig=document.createElement('figure'),a=document.createElement('a'),img=document.createElement('img');
  a.href=path;a.target='_blank';a.rel='noopener';img.loading='lazy';img.alt=label;img.src=path;
  img.onerror=()=>{fig.replaceChildren();const p=document.createElement('p');p.textContent=`${label}: image unavailable`;fig.append(p)};
  a.append(img);fig.append(a);const caption=document.createElement('figcaption');caption.textContent=label;fig.append(caption);parent.append(fig);
}
async function show(row){
  const token=++state.token;state.selected=row.filename;paint();
  const el=$('detail');el.replaceChildren();const title=document.createElement('h2');title.textContent=row.filename;el.append(title);
  const dl=document.createElement('dl');for(const [key,value] of Object.entries(row)){
    if(key==='filename')continue;
    const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=names[key]??key;dd.textContent=value||'—';dl.append(dt,dd);
  }el.append(dl);
  if(!/^[\w.-]+$/.test(row.filename)){
    const p=document.createElement('p');p.textContent='Invalid XYZ filename in TSV.';el.append(p);return;
  }
  const xyzPath=`bnpah/${row.filename}.xyz`;
  const a=document.createElement('a');a.href=xyzPath;a.download=`${row.filename}.xyz`;a.textContent='Download XYZ coordinates';el.append(a);
  const h=document.createElement('h3');h.textContent='3D structure';el.append(h);
  const box=document.createElement('div');box.className='viewer3d';el.append(box);
  const message=document.createElement('p');message.className='viewer-status';message.textContent='Loading 3D structure…';el.append(message);
  figure(el,`bnpah/svg/${row.filename}.svg`,'2D structure');
  try{
    if(typeof $3Dmol==='undefined')throw Error('3Dmol library unavailable');
    const response=await fetch(xyzPath);if(!response.ok)throw Error(`XYZ HTTP ${response.status}`);
    const viewer=$3Dmol.createViewer(box,{backgroundColor:'white'});
    const model=viewer.addModel(await response.text(),'xyz');
    if(token!==state.token)return;
    const n=model.selectedAtoms({}).length;if(!n)throw Error('No atoms recognized in XYZ');
    viewer.setStyle({},{stick:{},sphere:{scale:0.3}});viewer.zoomTo();viewer.render();
    message.textContent=`${n} atoms loaded. Drag to rotate; scroll to zoom.`;
  }catch(error){if(token===state.token)message.textContent=`Could not show 3D structure: ${error.message}`}
}
async function start(){setup();try{
  const response=await fetch('dbbnpah.tsv');if(!response.ok)throw Error(`TSV HTTP ${response.status}`);
  state.data=parseTSV(await response.text());
  const needed=['filename','nc','nh','nn','nb',...Object.keys(names)];
  for(const key of needed)if(!(key in (state.data[0]||{})))throw Error(`TSV is missing column ${key}`);
  render();if(state.matches.length)show(state.matches[0]);
}catch(error){$('status').textContent=`Could not load dataset: ${error.message}`}}
start();
