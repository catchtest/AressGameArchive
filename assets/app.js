(function(){
'use strict';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cloneTemplate=id=>$(id).content.cloneNode(true);
async function openSpecialEvent(){
  try{await AressLoadReference('special');}catch{return;}
  const dialog=$('sacrificeDialog');
 document.body.appendChild(dialog);
 dialog.showModal();
}
function renderRewards(host,state){
 if(state.kind==='money'){
  const content=cloneTemplate('moneyTemplate');content.querySelector('p').textContent=Number(state.amount).toLocaleString()+' G';host.replaceChildren(content);return;
 }
 const content=cloneTemplate('rewardTemplate'),items=content.querySelector('.reward-items');
 const titles={'reward':'得到物品','item-loss':'失去物品','party':state.partyAction==='join'?'角色加入':'角色離隊','class-unlock':'開放職系'};
 content.querySelector('h2').textContent=titles[state.kind];
 if(state.kind==='reward'||state.kind==='item-loss'){
  const merged=new Map();state.rewards.forEach(reward=>merged.set(reward.id,(merged.get(reward.id)||0)+1));
  for(const [id,count] of merged){
   const card=cloneTemplate('rewardItemTemplate'),label=D.item_names[id]||`道具 ${id}`,icon=card.querySelector('.item-icon');
   icon.style.backgroundPosition=spritePosition(id,16,24);icon.setAttribute('aria-label',label);
   card.querySelector('[data-label]').textContent=label+(count>1?` × ${count}`:'');items.append(card);
  }
 }else{
  const members=state.kind==='party'?state.characters.map(characterId=>({characterId})):[...new Map(state.classUnlocks.map(row=>[`${row.characterId}:${row.classId}`,row])).values()];
  for(const {characterId:id,classId} of members){
   const card=cloneTemplate('partyMemberTemplate'),label=card.querySelector('[data-label]');
   card.querySelector('button').dataset.openCharacter=id;
   card.querySelector('[data-portrait]').outerHTML=portraitSprite(id);
   label.textContent=D.character_names[id]||`角色 ${id}`;
   if(classId!==undefined){const detail=cloneTemplate('classUnlockLabelTemplate'),classLabel=detail.querySelector('[data-class-name]');classLabel.append(document.createTextNode(D.class_names[classId]||`職系 ${classId}`));label.append(detail);}
   items.append(card);
  }
 }
 host.replaceChildren(content);
}
let eventId=130,history=[],position=0,guided=false,section='home',storyGroup='main',battleGroup='main',settingId='equipment',settingSidebar='',shopView='products',world=1,pointId=0,fieldFile=A.fields[0].file;
const imagePath=(name,category)=>`assets/${category}/${name.replace(/\.[^.]+$/,'.png')}`;
const spritePosition=(id,columns,rows)=>`${columns>1?id%columns/(columns-1)*100:0}% ${rows>1?Math.floor(id/columns)/(rows-1)*100:0}%`;
const pointSprite=id=>`<span class="point-sprite" style="background-position:${spritePosition(id,8,8)}" aria-hidden="true"></span>`;
const itemSprite=(id,label='')=>`<span class="item-icon item-sprite" style="background-position:${spritePosition(id,16,24)}" role="img" aria-label="${esc(label)}"></span>`;
const imageLoads=new Map(),imageRequests=new Map();
function preloadImage(src){
 if(!src)return Promise.resolve();
 if(!imageLoads.has(src))imageLoads.set(src,new Promise((resolve,reject)=>{
  const image=new Image();
  image.onload=()=>{const decoded=typeof image.decode==='function'?image.decode():Promise.resolve();Promise.resolve(decoded).catch(()=>{}).then(()=>resolve(src));};
  image.onerror=reject;image.src=src;
 }));
 return imageLoads.get(src);
}
const spriteImage=(path,index,columns,rows,label='',cls='')=>`<i class="sprite-image ${cls}" role="img" style="--sprite-image:url(&quot;${path}&quot;);--sprite-size:${columns*100}% ${rows*100}%;--sprite-position:${spritePosition(index,columns,rows)}" aria-label="${esc(label)}"></i>`;
const portraitSprite=(id,label='')=>spriteImage('portraits/FACE_SPRITE.png',id,16,13,label);
const mapUnitSprite=(path,label='',cls='')=>{const match=String(path).match(/(MIKATA|TEKI)_(\d+)\.png$/);if(!match)return '';const index=Number(match[2])+(match[1]==='TEKI'?95:0);return spriteImage('map_sprites/UNIT_SPRITE.png',index,16,7,label,cls);};
const source=id=>A.sources[id],eventName=id=>{const row=source(id),title=row.title||'';return !title||['主線劇情','地點劇情',row.name].includes(title)?row.name:`${row.name} · ${title}`;};
const settingLabels={flow:'流程',equipment:'裝備',items:'道具',characters:'角色',enemies:'敵人',spells:'魔法',classes:'職系',races:'種族',shops:'商店',terms:'公式'};
const pageFromLocation=()=>{
 const route=location.hash.slice(1);
 const setting=route==='formula'?'terms':route;
 if(settingLabels[setting])return {section:'settings',setting};
 return {section:['story','world','battles'].includes(route)?route:'home',setting:''};
};
const hasDialogue=id=>!!D.event_has_dialogue[id];
const compactSidebar=window.matchMedia('(max-width: 1000px)');
function setSidebarHidden(hidden){document.body.classList.toggle('sidebar-hidden',hidden);$('toggleSidebar').setAttribute('aria-expanded',String(!hidden));$('toggleSidebar').title=hidden?'顯示側欄':'收起側欄';$('toggleSidebar').textContent=hidden?'›':'‹';}
function setImage(id,name,category){
 const el=$(id);el.hidden=!name;
 if(name&&category==='portraits'){
  const face=Number((String(name).match(/FACE(\d+)/)||[])[1]);el.classList.add('sprite-image');el.style.setProperty('--sprite-image','url("portraits/FACE_SPRITE.png")');el.style.setProperty('--sprite-size','1600% 1300%');el.style.setProperty('--sprite-position',spritePosition(face,16,13));el.setAttribute('aria-label',name);
 }else if(name){
  const nextSrc=imagePath(name,category);
  const request=(imageRequests.get(id)||0)+1;imageRequests.set(id,request);
  if(el.getAttribute('src')===nextSrc&&el.complete&&el.naturalWidth){el.hidden=false;return;}
  // Keep the currently painted bitmap until its replacement is decoded.
  // Assigning src first clears the old pixels and produces a visible flash.
  el.hidden=!el.getAttribute('src');
  preloadImage(nextSrc).then(()=>{
   if(imageRequests.get(id)!==request)return;
   const target=$(id);target.classList.remove('sprite-image');target.removeAttribute('style');target.alt=name;target.src=nextSrc;target.hidden=false;
  }).catch(()=>{if(imageRequests.get(id)===request&&id==='scene')$('mapBackdrop').hidden=false;});
 }else{imageRequests.set(id,(imageRequests.get(id)||0)+1);el.onload=null;el.onerror=null;el.hidden=true;el.removeAttribute('src');el.classList.remove('sprite-image');el.removeAttribute('style');delete el.dataset.pendingSrc;}
}
 const groupForEvent=id=>id<71||id>=130?'main':'side';
function showEvents(){
 $('homeInfo').hidden=section!=='home';
 $('eventList').hidden=section==='home';
 document.querySelectorAll('[data-story-group]').forEach(b=>{const on=b.dataset.storyGroup===storyGroup;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on);});
 document.querySelectorAll('[data-battle-group]').forEach(b=>{const on=b.dataset.battleGroup===battleGroup;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on);});
 if(section==='settings'){showSettingsSidebar();return;}
 if(section==='home')return;
 if(section==='battles'){
  const fields=A.fields.filter(f=>f.battle_type===battleGroup);
  $('eventList').innerHTML=fields.map(f=>{const origin=f.events.length?source(f.events[0]):null,point=origin?.point_id!==null&&origin?.point_id!==undefined?A.points[origin.point_id]:A.points.find(p=>p.name===f.location);return `<button class="event ${f.file===fieldFile?'active':''}" data-open-field="${f.file}">${point?pointSprite(point.id):''}<span>${esc(f.title)}</span></button>`;}).join('');
  return;
 }
 const selected=section==='world'?pointId:source(eventId).point_id;
 const points=A.points.filter(p=>section!=='story'||(storyGroup==='main'?p.main_events.length:hasDialogue(p.side_event)));
 let eventHtml=points.map(p=>{const active=selected===p.id,isOpening=section==='story'&&storyGroup==='main'&&p.main_events.includes(130),label=isOpening?'開場':p.name,icon=isOpening?'':pointSprite(p.id),visits=section==='story'&&storyGroup==='main'&&active&&p.main_events.length>1?`<div class="event-visits">${p.main_events.map(id=>`<button class="event event-visit ${eventId===id?'active':''}" data-event="${id}"><span>${esc(source(id).title)}</span></button>`).join('')}</div>`:'';return `<div class="event-location"><button class="event ${active?'active':''}" data-location="${p.id}">${icon}<span>${esc(label)}</span></button>${visits}</div>`;}).join('');
 if(section==='story'&&storyGroup==='main'&&A.ending_event_id!==undefined)eventHtml+=`<div class="event-location"><button class="event ${eventId===A.ending_event_id?'active':''}" data-event="${A.ending_event_id}"><span>結局</span></button></div>`;
 $('eventList').innerHTML=eventHtml;
}
function showSettingsSidebar(){
 const host=$(settingId),button=(label,attrs='',active=false)=>`<button class="event sidebar-filter ${active?'active':''}" ${attrs}><span>${esc(label)}</span></button>`;
 let html='';
 if(['equipment','items'].includes(settingId)){
  const groups=[...host.querySelectorAll('[data-item-category]')];
  html+=button('全部','data-sidebar-category=""',!settingSidebar)+groups.map(group=>`<button class="event sidebar-filter sidebar-category ${group.dataset.itemCategory===settingSidebar?'active':''}" data-sidebar-category="${esc(group.dataset.itemCategory)}">${group.dataset.categoryItem!==undefined?itemSprite(Number(group.dataset.categoryItem),group.dataset.itemCategory):''}<span>${esc(group.dataset.itemCategory)}</span></button>`).join('');
 }else if(settingId==='spells'){
  const values=['',...[...new Set([...host.querySelectorAll('[data-school]')].map(r=>r.dataset.school))]];
  html+=values.map(value=>`<button class="event sidebar-filter ${value===settingSidebar?'active':''}" data-sidebar-school="${esc(value)}"><span>${esc(value||'全部')}</span></button>`).join('');
 }else if(['characters','enemies'].includes(settingId)){
  const profiles=[...host.querySelectorAll('[data-profile-card]')].filter(b=>!b.hidden),selected=profiles.find(b=>b.classList.contains('selected'));
  const characterConditions=settingId==='characters'?host.querySelector('[data-character-conditions]'):null,characterEndings=settingId==='characters'?host.querySelector('[data-character-endings]'):null;
  html+=button(settingId==='characters'?'角色一覽':'敵人一覽','data-sidebar-profile=""',!selected&&(!characterConditions||characterConditions.hidden&&characterEndings.hidden))+(settingId==='characters'?button('加入／離隊條件','data-character-conditions-nav',!characterConditions.hidden)+button('結局描述','data-character-endings-nav',!characterEndings.hidden):'')+profiles.map(b=>{
   const label=b.dataset.sidebarLabel||b.querySelector('.profile-card-name')?.textContent||'',context=b.querySelector('.profile-card-context')?.textContent||'',sourcePortrait=b.querySelector('.sprite-image,img');
   let portrait='';
   if(sourcePortrait){
    const image=sourcePortrait.cloneNode();
    image.classList.add('sidebar-profile-avatar');
    image.setAttribute('aria-label','');
    portrait=image.outerHTML;
   }
   return `<button class="event sidebar-filter sidebar-profile ${b.classList.contains('selected')?'active':''}" data-sidebar-profile="${b.dataset.profile}">${portrait}<span class="sidebar-profile-copy"><strong>${esc(label)}</strong>${context?`<small>${esc(context)}</small>`:''}</span></button>`;
  }).join('');
 }else if(settingId==='shops'){
  html+=[...host.querySelectorAll('.town-store')].map(d=>{const label=d.dataset.townLabel||'',point=d.dataset.townPoint;return `<button class="event sidebar-filter sidebar-town ${d.hidden?'':'active'}" data-sidebar-town="${d.dataset.townId}">${point!==undefined?pointSprite(Number(point)):''}<span>${esc(label)}</span></button>`;}).join('');
 }else if(settingId==='races'){
  const values=[['growth','升級屬性加成'],['experience','升級經驗'],['members','可加入角色']];
  html+=values.map(([value,label])=>button(label,`data-sidebar-race="${esc(value)}"`,value===settingSidebar)).join('');
 }else if(settingId==='classes'){
  const details=[...host.querySelectorAll('[data-class-detail]')];
  html+=button('角色轉職','data-sidebar-class=""',settingSidebar==='')+button('升級增加屬性','data-sidebar-class="growth"',settingSidebar==='growth')+button('移動力','data-sidebar-class="movement"',settingSidebar==='movement')+details.map(row=>{
   const active=settingSidebar===row.dataset.classDetail,sprite=row.querySelector('.class-detail-heading .class-walk-sprite')?.outerHTML||'';
   return `<button class="event sidebar-filter sidebar-class ${active?'active':''}" data-sidebar-class="${row.dataset.classDetail}">${sprite}<span>${esc(row.dataset.className)}</span></button>`;
  }).join('');
 }else if(settingId==='flow'){
  html+=[...host.querySelectorAll('[data-filter-row]')].map((row,index)=>{
   const point=row.dataset.sidebarPoint,number=row.dataset.sidebarIndex;
   return `<button class="event sidebar-filter sidebar-flow" data-sidebar-row="${index}">${point!==''?pointSprite(Number(point)):''}<span><b class="sidebar-flow-number">${esc(number)}</b> ${esc(row.dataset.sidebarLabel||'')}</span></button>`;
  }).join('');
 }else if(settingId==='terms'){
  html+=[...host.querySelectorAll('[data-term-section]')].map(row=>button(row.dataset.termLabel,`data-term-anchor="${row.id}"`)).join('');
 }else{
  html+=[...host.querySelectorAll('[data-filter-row]')].map((r,i)=>button(r.dataset.sidebarLabel||r.querySelector('th,td,h3')?.textContent||'',`data-sidebar-row="${i}"`)).join('');
 }
 $('eventList').innerHTML=html;
}
function applyRaceFilter(){
 const host=$('races'),selected=settingSidebar;
 host.querySelector('[data-race-bonus]').hidden=selected!=='growth';
 host.querySelector('[data-race-chart]').hidden=selected!=='experience';
 host.querySelector('[data-race-members-panel]').hidden=selected!=='members';
}
function applyClassFilter(){
 const host=$('classes'),selected=settingSidebar;
 host.querySelector('[data-class-overview]').hidden=selected!=='';
 host.querySelector('[data-class-growth]').hidden=selected!=='growth';
 host.querySelector('[data-class-movement]').hidden=selected!=='movement';
 host.querySelectorAll('[data-class-detail]').forEach(row=>row.hidden=row.dataset.classDetail!==selected);
}
function setStoryGroup(next){
 storyGroup=next;
 if(next==='main'){
  const p=A.points[pointId]?.main_events.length?A.points[pointId]:A.points.find(v=>v.main_events.length);loadEvent(p.main_events[0]);
 }else{
  const current=A.points[pointId],p=current&&hasDialogue(current.side_event)?current:A.points.find(v=>hasDialogue(v.side_event));
  if(p)loadEvent(p.side_event);
 }
}
function setBattleGroup(next){
 battleGroup=next;
 const current=A.fields.find(f=>f.file===fieldFile);
 if(current?.battle_type!==next){const first=A.fields.find(f=>f.battle_type===next);if(first){fieldFile=first.file;renderBattle($('fieldViewer'),first);}}
 showEvents();
}
function openField(file){const field=A.fields.find(f=>f.file===file);if(!field)return;fieldFile=file;battleGroup=field.battle_type;setSection('battles');}
let sectionRequest=0;
function setSection(next,updateUrl=true){
 const request=++sectionRequest;
  if(next==='story'&&!D.events?.[eventId]){
   AressLoadStory(eventId).then(()=>{
    if(request===sectionRequest)setSection(next,updateUrl);
   }).catch(()=>{});
   return;
  }
  if(next==='settings'&&!AressReferenceLoaded(settingId)){
   AressLoadReference(settingId).then(()=>{
    if(request===sectionRequest)setSection(next,updateUrl);
   }).catch(()=>{});
   return;
  }
  if(next==='battles'&&!A.enemy_types){
   AressLoadBattle().then(()=>{
    if(request===sectionRequest)setSection(next,updateUrl);
   }).catch(()=>{});
   return;
  }
 if(next==='story'&&!history.length){prepareEvent(eventId);render();}
 section=next;
 document.body.dataset.section=next;
 for(const name of ['home','story','settings','world','battles'])$(name==='story'?'storyWorkspace':name+'Panel').hidden=name!==next;
 document.querySelectorAll('a[data-section],button[data-section]').forEach(b=>b.classList.toggle('selected',b.dataset.section===next&&(next!=='settings'||b.dataset.settingSection===settingId)));
  $('storyCategories').hidden=next!=='story';$('battleCategories').hidden=next!=='battles';showEvents();
  if(next==='world')renderWorld();
  if(next==='battles')renderBattle($('fieldViewer'),A.fields.find(field=>field.file===fieldFile));
 if(updateUrl){
  const target=new URL(location.href);target.hash=next==='settings'?(settingId==='terms'?'formula':settingId):next==='home'?'':next;
  if(location.href!==target.href)window.history.pushState({section:next,setting:next==='settings'?settingId:''},'',target);
 }
 scheduleTableHeader();
}
function prepareEvent(id,preparedFrames){
 eventId=id;storyGroup=groupForEvent(id);if(source(id).point_id!==null){pointId=source(id).point_id;world=A.points[pointId].world;}history=preparedFrames||AressReader.frames(D.events[id],AressReader.initial(),guided);position=0;
 if(!history.length)history=[{...AressReader.initial(),kind:'end'}];
}
let eventLoadRequest=0;
async function loadEvent(id){
 const request=++eventLoadRequest,navigationRequest=sectionRequest;
  try{await AressLoadStory(id);}catch{return;}
 if(request!==eventLoadRequest||navigationRequest!==sectionRequest)return;
 const frames=AressReader.frames(D.events[id],AressReader.initial(),guided),first=frames[0],origin=source(id),point=origin.point_id===null?null:A.points[origin.point_id];
 const firstVisual=first?.scene?imagePath(first.scene,'scenes'):point?.background||'';
 try{await preloadImage(firstVisual);}catch{/* The normal fallback is rendered below. */}
 if(request!==eventLoadRequest||navigationRequest!==sectionRequest)return;
 prepareEvent(id,frames);
 render();setSection('story');
}
function restartEvent(){
 loadEvent(eventId);
}
function nextEventId(){
 if(eventId===A.ending_event_id)return null;
 if(eventId===127)return null;
 const id=eventId===70?A.ending_event_id:eventId===130?0:eventId>=129?0:eventId+1;
 return D.events[id]&&source(id)?id:null;
}
function render(){
 const s=history[position],e=D.events[eventId],origin=source(eventId);
 const lastFrame=position===history.length-1,progress=(position+1)/history.length*100,bottomBar=document.querySelector('.story-bottom-bar'),progressNode=$('storyProgress');
 bottomBar.style.setProperty('--story-progress',progress+'%');progressNode.setAttribute('aria-valuenow',String(Math.round(progress)));
 $('sourceLine').innerHTML=`<span>${esc(origin.kind)}</span><span class="breadcrumb-separator">›</span><strong>${esc(origin.name)}</strong>${origin.point_id!==null?'<button id="showLocation">地圖 ↗</button>':''}`;
 const eventPoint=origin.point_id,backdropPoint=eventPoint===null?null:A.points[eventPoint],backdropWorld=backdropPoint?.world||world;
 if(backdropPoint?.background)$('mapBackdrop').innerHTML=`<img class="location-default-bg" src="${backdropPoint.background}" alt="${esc(backdropPoint.name)}景色">`;
 else $('mapBackdrop').innerHTML=worldArtwork(backdropWorld,eventPoint,false)+(backdropPoint?`<div class="map-hover-label story-location-label">${esc(backdropPoint.name)}</div>`:'');
 $('mapBackdrop').hidden=!!s.scene;
 setImage('scene',s.scene,'scenes');$('emptyScene').hidden=true;
 const narration=s.kind==='dialogue'&&(!s.speaker||s.speaker==='旁白'),endingFaces=s.endingFaceIds||[],showEndingFaces=s.kind==='dialogue'&&endingFaces.length>0,showFaces=s.kind==='dialogue'&&(!narration||showEndingFaces);
 const leftPortrait=showEndingFaces?`FACE${String(endingFaces[0]).padStart(3,'0')}.png`:s.left,rightPortrait=showEndingFaces?(endingFaces.length>1?`FACE${String(endingFaces[1]).padStart(3,'0')}.png`:null):s.right;
 setImage('leftFace',showFaces?leftPortrait:null,'portraits');setImage('rightFace',showFaces?rightPortrait:null,'portraits');$('portraitRow').hidden=!showFaces||(!leftPortrait&&!rightPortrait);
 $('dialogue').hidden=s.kind!=='dialogue';$('speaker').hidden=false;$('speaker').textContent=narration?'':s.speaker;$('body').textContent=s.body;$('body').classList.toggle('red',!!s.color);$('body').scrollTop=0;
 const rewardPanel=$('rewardPanel'),statusKinds=['reward','item-loss','party','money','class-unlock'];rewardPanel.hidden=!statusKinds.includes(s.kind);
 if(statusKinds.includes(s.kind))renderRewards(rewardPanel,s);
 const conditionBanner=$('conditionBanner'),rawCondition=s.condition&&s.condition!=='不需額外條件'?s.condition:'',storedConditionGroups=s.conditionGroups||[];
 const parsedConditionGroups=rawCondition?(rawCondition.startsWith('（')&&rawCondition.endsWith('）')?rawCondition.slice(1,-1).split('） 或 （'): [rawCondition]).map(group=>group.split(' 且 ').filter(Boolean)):[];
 const parsedConditionCount=parsedConditionGroups.reduce((total,group)=>total+group.length,0);
 const conditionGroups=storedConditionGroups.length?storedConditionGroups:(rawCondition.length>180||parsedConditionCount>=4?parsedConditionGroups:[]);
 conditionBanner.classList.toggle('has-groups',conditionGroups.length>0);
 if(s.specialEvent==='sacrifice'){
  conditionBanner.innerHTML='<span>出現條件：</span><a href="#sacrificeDialog" data-special-event="sacrifice">擋刀事件</a>';
 }else if(s.specialEvent==='no-sacrifice'){
  conditionBanner.textContent='出現條件：未觸發擋刀事件';
 }else if(conditionGroups.length){
  const singleGroup=conditionGroups.length===1;
  const summary=singleGroup?`${conditionGroups[0].length} 項條件`:`${conditionGroups.length} 種可能`;
  const list=singleGroup?`<ul>${conditionGroups[0].map(term=>`<li>${esc(term)}</li>`).join('')}</ul>`:`<ol>${conditionGroups.map((group,index)=>`<li><b>可能 ${index+1}</b><ul>${group.map(term=>`<li>${esc(term)}</li>`).join('')}</ul></li>`).join('')}</ol>`;
  conditionBanner.innerHTML=`<details class="condition-details"><summary><span>出現條件</span><strong>${summary}</strong></summary><div class="condition-popover"><p>${singleGroup?'下列條件必須全部成立。':'符合下列任一組即可出現；每組列出的條件必須全部成立。'}</p>${list}</div></details>`;
 }else conditionBanner.textContent=rawCondition?'出現條件：'+rawCondition:'';
 $('stage').hidden=false;$('storyBattle').hidden=true;
 const battleLink=$('storyBattleLink'),field=s.kind==='battle'?A.fields.find(f=>f.file===s.battle.field):null;
 const nextId=lastFrame?nextEventId():null;
 battleLink.hidden=!field&&nextId===null;
 battleLink.classList.toggle('story-continuation',nextId!==null&&s.kind!=='battle');
 battleLink.innerHTML=(field?`<div><span>接續戰鬥</span><button data-open-field="${esc(field.file)}">${esc(field.title)} ↗</button></div>`:'')+(nextId!==null?`<div><span>接續劇情</span><button data-open-event="${nextId}">${esc(eventName(nextId))} ↗</button></div>`:'');
 const panel=$('interlude');panel.hidden=s.kind!=='choice';
 panel.replaceChildren();
 if(s.kind==='choice'){
  const content=cloneTemplate('choiceTemplate');
  content.querySelectorAll('button').forEach((button,index)=>{button.textContent=s.choice.options[index];button.dataset.choiceTarget=index?s.choice.secondTarget:s.choice.firstTarget;});
  panel.append(content);
 }
 $('prev').disabled=position===0;$('next').disabled=s.kind==='branch'||(lastFrame&&nextEventId()===null);
 $('next').textContent='▶';
}
function step(target){
 const s=history[position];
 if(target===undefined&&s.kind==='branch')return;
 if(target!==undefined){
  const next=AressReader.advance(D.events[eventId],s,guided,target);
  history=history.slice(0,position+1);
  if(next.kind!=='end')history.push(next,...AressReader.frames(D.events[eventId],next,guided));
 }
 if(position<history.length-1){position++;render();return;}
 const nextId=nextEventId();if(nextId!==null)loadEvent(nextId);
}
function previous(){if(position>0){position--;render();}}
function jumpToEnd(){
 position=history.length-1;
 render();
}
function worldArtwork(mapWorld,activePoint,interactive=true){
 const pts=A.points.filter(p=>p.world===mapWorld);
 const routes=A.routes.filter(r=>r.world===mapWorld).map(r=>{const a=A.points[r.from_id],b=A.points[r.to_id];return `<line x1="${a.x+4}" y1="${a.y}" x2="${b.x+4}" y2="${b.y}"/>`;}).join('');
 const borderPoint=A.points[mapWorld===1?28:29],portalY=mapWorld===1?25:374;
 const markers=pts.map(p=>interactive?`<button class="map-point ${p.id===activePoint?'active':''}" data-point="${p.id}" style="left:${(p.x+4)/640*100}%;top:${p.y/400*100}%" title="${esc(p.name)}" aria-label="${esc(p.name)}">${pointSprite(p.id)}</button>`:`<span class="map-point ${p.id===activePoint?'active':''}" style="left:${(p.x+4)/640*100}%;top:${p.y/400*100}%" aria-hidden="true">${pointSprite(p.id)}</span>`).join('');
 return `<img src="assets/scenes/IDO${mapWorld}.png" alt="${mapWorld===1?'前半':'後半'}地圖"><svg class="world-routes" viewBox="0 0 640 400" aria-hidden="true">${routes}<line class="world-crossing" x1="${borderPoint.x}" y1="${borderPoint.y}" x2="188" y2="${portalY}"/></svg>${markers}`+(interactive?`<div class="map-hover-label" data-map-label aria-live="polite">${esc(A.points[activePoint]?.name||'')}</div><button class="world-switch-strip" data-cross-world aria-label="切換至${mapWorld===1?'後半':'前半'}世界" title="切換至${mapWorld===1?'後半':'前半'}世界"></button>`:'');
}
function townServices(town){
 if(!town)return '';
 return `<section class="location-services"><h3>商店與抽獎</h3><button class="location-town-store-link" data-open-town-store="${town.id}">${esc(town.name)}</button></section>`;
}
function templeServices(point){
 if(!point?.name?.includes('神殿')||!A.temple?.advice?.length)return '';
 const advice=A.temple.advice.map(row=>{
  const first=eventName(row.main_event_from),last=row.main_event_to!==row.main_event_from?eventName(row.main_event_to):'';
  const condition=last?`${first}～${last}`:first;
  return `<article class="temple-advice-card"><header><b>建議 ${row.id}</b><small>${esc(condition)}</small></header><p>${esc(row.text).replaceAll('\n','<br>')}</p>${row.incomplete?'<em>原始文字在此結束</em>':''}</article>`;
 }).join('');
 return `<section class="location-services temple-service"><h3>奉獻</h3><button class="temple-advice-link" data-open-temple-advice><span>女神的建議</span><small>奉獻 ${A.temple.donation_price.toLocaleString()} G；一般情況依主線進度顯示</small></button></section><div class="profile-drawer temple-advice-drawer" data-temple-advice-drawer hidden><button class="drawer-scrim" data-close-temple-advice aria-label="關閉奉獻建議"></button><aside class="profile-panel" role="dialog" aria-label="女神的奉獻建議"><button class="drawer-close" data-close-temple-advice aria-label="關閉奉獻建議">✕</button><div class="temple-advice-heading"><small>神殿 · 奉獻 ${A.temple.donation_price.toLocaleString()} G</small><h2>女神的建議</h2><p>一般奉獻會依當時的主線進度顯示一段建議；累計達特定次數時，遊戲會改為謝禮流程。以下依實際出現順序排列。</p></div><div class="temple-advice-list">${advice}</div></aside></div>`;
}
function renderWorld(){
 showEvents();
 $('worldMap').innerHTML=worldArtwork(world,pointId,true);
 document.querySelectorAll('[data-world]').forEach(b=>{const on=Number(b.dataset.world)===world;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on);});
 const p=A.points[pointId],ids=[...p.main_events,p.side_event],battles=A.fields.filter(f=>f.events.some(i=>source(i).point_id===p.id)),town=A.shop_towns.find(t=>t.point_id===p.id);
 $('locationInfo').innerHTML=`<h2>${esc(p.name)}</h2>${p.background?`<img class="location-background" src="${p.background}" alt="${esc(p.name)}景色">`:''}<h3>劇情</h3><div class="location-events">`+ids.filter(i=>i<D.event_has_dialogue.length&&(i!==p.side_event||hasDialogue(i))).map(i=>`<button data-open-event="${i}">${esc(source(i).title)}</button>`).join('')+`</div>${battles.length?'<h3 class="location-battles">戰鬥</h3><div class="location-events">'+battles.map(f=>`<button data-open-field="${f.file}">${esc(f.title)}</button>`).join('')+'</div>':''}${townServices(town)}${templeServices(p)}`;
}
const battleRequests=new WeakMap();
async function renderBattle(host,f){
 const request={};battleRequests.set(host,request);
 if(!f){host.innerHTML='<p>沒有找到此戰場資料。</p>';return;}
 try{await preloadImage(f.image);}catch{/* Keep the battle controls available even if its image is unavailable. */}
 if(battleRequests.get(host)!==request)return;
 const initial=f.number===1;
  const enemies=f.enemy_positions.map(([type,x,y])=>({...A.enemy_types[type],x,y})),allies=f.allies.map((position,index)=>position&&(!initial||index<A.initial_party.length)?{slot:index+1,x:position[0],y:position[1]}:null).filter(Boolean),units=[...enemies.map(u=>({...u,side:'enemy'})),...allies.map(u=>({...u,side:'ally',name:initial?A.initial_party[u.slot-1].name:`我方 ${u.slot}`}))];
 const nativeWidth=f.width*16,nativeHeight=f.height*16,defaultScale=2;
 const unitMarkup=units.map(u=>{const content=u.sprite?mapUnitSprite(u.sprite,u.name):`<span class="ally-position">${u.slot}</span>`,nativeUnitSize=32,attrs=`class="unit ${u.side}" style="left:${u.x*16/nativeWidth*100}%;top:${u.y*16/nativeHeight*100}%;width:${nativeUnitSize/nativeWidth*100}%;height:${nativeUnitSize/nativeHeight*100}%" title="${esc(u.name)} (${u.x}, ${u.y})" aria-label="${esc(u.name)}，座標 ${u.x}, ${u.y}"`;return u.side==='enemy'?`<button type="button" ${attrs} data-enemy-profile="${u.profile_key}">${content}</button>`:`<span ${attrs}>${content}</span>`;}).join('');
  const summary=f.enemy_groups.map(([type,count])=>{const u=A.enemy_types[type];return `<button class="battle-enemy-card" data-enemy-profile="${u.profile_key}">${mapUnitSprite(u.sprite)}<span><strong>${esc(u.name)}</strong><small>HP ${u.hp}</small></span>${count>1?`<b>×${count}</b>`:''}</button>`;}).join('');
 const tools=`<div class="battle-tools"><h3>${esc(f.title)}</h3><div class="battle-layer-toggles"><label><input type="checkbox" data-layer="ally" checked>顯示我方</label><label><input type="checkbox" data-layer="enemy" checked>顯示敵方</label></div><label>縮放 <span class="zoom-control"><input type="range" data-zoom min="100" max="300" value="200" step="25" aria-label="地圖縮放"><output data-zoom-label>2×</output></span></label></div>`;
 const related=f.events.length?'<div class="battle-related"><h4>相關劇情</h4>'+f.events.map(i=>`<button data-open-event="${i}">${esc(eventName(i))}</button>`).join('')+'</div>':'';
  host.innerHTML=`<div class="battle-layout"><div class="battle-scroll"><div class="battle-board" style="width:${nativeWidth*defaultScale}px;height:${nativeHeight*defaultScale}px" data-field="${f.file}" data-native-width="${nativeWidth}" data-native-height="${nativeHeight}"><img class="battle-map" src="${f.image}" alt="${esc(f.title)}的戰場" style="width:100%;height:100%"><div class="battle-grid" style="background-size:${16/nativeWidth*100}% ${16/nativeHeight*100}%"></div>${unitMarkup}</div></div><div class="battle-sidebar">${tools}<div class="battle-victory"><h4>勝利條件</h4><p>${esc(f.victory_condition)}</p></div><h4>敵方總覽</h4><div class="battle-enemy-summary">${summary}</div>${related}</div></div><div class="profile-drawer battle-drawer" data-battle-drawer hidden><button class="drawer-scrim" data-close-battle-drawer aria-label="關閉敵方資料"></button><aside class="profile-panel" role="dialog" aria-label="敵方角色資料"><button class="drawer-close battle-drawer-close" data-close-battle-drawer aria-label="關閉敵方資料">✕</button><div data-battle-profile></div></aside></div>`;
}
function selectSetting(id){
  if(settingId!==id){$('settingsFilter').value='';settingSidebar=id==='races'?'growth':'';}settingId=id;
  if(!AressReferenceLoaded(id)){
   AressLoadReference(id).then(()=>{if(settingId===id)selectSetting(id);}).catch(()=>{});
   return;
  }
 $('settingsTitle').textContent=settingLabels[id]||'';
 $('settingsFilter').hidden=['shops','terms'].includes(id);
 $('shopViewSwitch').hidden=id!=='shops';
 $('settingsPanel').classList.toggle('shops-active',id==='shops');
 $('settingsPanel').classList.toggle('spells-active',id==='spells');
 $('settingsPanel').classList.toggle('races-active',id==='races');
 $('settingsContent').querySelectorAll(':scope > section').forEach(s=>s.hidden=s.id!==id);
 document.querySelectorAll('[data-setting-section]').forEach(b=>b.classList.toggle('selected',b.dataset.settingSection===id&&section==='settings'));
 filterSettings();if(section==='settings')showSettingsSidebar();
}
function selectProfile(section,key){
 section.querySelectorAll('[data-profile]').forEach(b=>{const active=b.dataset.profile===key;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
 section.querySelectorAll('[data-profile-detail]').forEach(p=>p.hidden=p.dataset.profileDetail!==key);
 section.querySelector('.profile-empty').hidden=!!key;
 section.querySelector('[data-profile-drawer]').hidden=!key;
}
function openProfile(section,key){
 if(section.id==='characters'&&!key)setCharacterView('overview');
 selectProfile(section,key);showSettingsSidebar();
}
function filterSettings(){
  if(!AressReferenceLoaded(settingId))return;
 const q=$('settingsFilter').value.trim().toLowerCase();
 $('settingsContent').querySelectorAll('[data-filter-row]').forEach(r=>{r.hidden=!(r.dataset.search||r.textContent).toLowerCase().includes(q);});
 for(const id of ['equipment','items']){
  const itemSection=$(id);
  itemSection.querySelectorAll('[data-item-category]').forEach(group=>{const hasRows=!!group.querySelector('[data-filter-row]:not([hidden])');group.hidden=!hasRows||!!(settingId===id&&settingSidebar&&group.dataset.itemCategory!==settingSidebar);});
 }
 if(settingId==='spells')$('spells').querySelectorAll('[data-school]').forEach(group=>{const hasRows=!!group.querySelector('[data-filter-row]:not([hidden])');group.hidden=!hasRows||!!(settingSidebar&&group.dataset.school!==settingSidebar);});
 if(settingId==='races')applyRaceFilter();
 if(settingId==='classes')applyClassFilter();
 $('settingsContent').querySelectorAll('[data-item-section]').forEach(s=>{s.querySelector('[data-items-empty]').hidden=!!s.querySelector('[data-item-category]:not([hidden])');s.querySelectorAll('[data-item-detail]').forEach(p=>p.hidden=true);const drawer=s.querySelector('[data-item-drawer]');if(drawer)drawer.hidden=true;});
 for(const id of ['characters','enemies']){
  if(id!==settingId)continue;
  const section=$(id),cards=[...section.querySelectorAll('[data-profile-card]')];cards.forEach(b=>b.hidden=!b.dataset.search.toLowerCase().includes(q));
  section.querySelectorAll('[data-profile-overview-row]').forEach(row=>row.hidden=!(row.dataset.search||'').toLowerCase().includes(q));
  const visible=cards.filter(b=>!b.hidden);section.querySelector('.empty-results').hidden=!!visible.length;
  const selected=visible.find(b=>b.classList.contains('selected'));if(!selected)selectProfile(section,null);
 }
 if(section==='settings')showSettingsSidebar();
}
async function openItem(id){
  const targetSection=id<256?'equipment':'items';
  try{await AressLoadReference(targetSection);}catch{return;}
 $('settingsFilter').value='';selectSetting(targetSection);setSection('settings');
 const host=$(targetSection);settingSidebar='';filterSettings();
 host.querySelectorAll('[data-item-detail]').forEach(p=>p.hidden=p.dataset.itemDetail!==String(id));
 const detail=host.querySelector(`[data-item-detail="${id}"]`),drawer=host.querySelector('[data-item-drawer]');if(drawer)drawer.hidden=!detail;else if(detail)detail.scrollIntoView({block:'start'});
}
async function openCharacter(id){
  if($('sacrificeDialog')?.open)$('sacrificeDialog').close();
  try{await AressLoadReference('characters');}catch{return;}
 $('settingsFilter').value='';selectSetting('characters');setSection('settings');filterSettings();
 const character=$('characters').querySelector(`[data-character-id="${id}"]`);
 if(character)openProfile($('characters'),character.dataset.profile);
}
async function openSpell(id){
  try{await AressLoadReference('spells');}catch{return;}
 $('settingsFilter').value='';selectSetting('spells');setSection('settings');
 const host=$('spells'),target=host.querySelector(`[data-spell-id="${id}"]`);
 settingSidebar='';filterSettings();
 if(target){target.scrollIntoView({block:'center'});target.classList.add('row-focus');setTimeout(()=>target.classList.remove('row-focus'),1400);}
}
function setShopView(view){
 shopView=view==='lottery'?'lottery':'products';
 const host=$('shops');
 $('shopViewSwitch').querySelectorAll('[data-shop-view]').forEach(button=>{const active=button.dataset.shopView===shopView;button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active));});
 host.querySelectorAll('[data-shop-panel]').forEach(panel=>{panel.hidden=panel.dataset.shopPanel!==shopView;});
}
function selectTownStore(townId,storeIndex=0){
 const host=$('shops'),target=host.querySelector(`.town-store[data-town-id="${townId}"]`);
 host.querySelectorAll('.town-store').forEach(town=>{town.hidden=town!==target;});
 setShopView(shopView);
 const group=target?.querySelector(`[data-store-index="${storeIndex}"]`);
 requestAnimationFrame(()=>{(group||target)?.scrollIntoView({block:'start'});});
 showSettingsSidebar();
}
async function openTownStore(townId,storeIndex=0,view=shopView){
  try{await AressLoadReference('shops');}catch{return;}
 $('settingsFilter').value='';selectSetting('shops');setSection('settings');
 setShopView(view);
 selectTownStore(townId,storeIndex);
}
async function openBattleEnemyProfile(battleUnit){
 const host=battleUnit.closest('#storyBattle,#fieldViewer'),key=battleUnit.dataset.enemyProfile;
 if(!host)return;
 try{await AressLoadReference('enemies');}catch{return;}
 if(!host.isConnected||!host.querySelector(`[data-enemy-profile="${key}"]`))return;
 const drawer=host.querySelector('[data-battle-drawer]'),sourceProfile=$('enemies').querySelector(`[data-profile-detail="${key}"]`),target=drawer.querySelector('[data-battle-profile]');
 target.replaceChildren();
 if(sourceProfile){const profile=sourceProfile.cloneNode(true);profile.hidden=false;profile.removeAttribute('data-profile-detail');target.append(profile);}
 drawer.hidden=!sourceProfile;
}
$('storyCategories').onclick=e=>{const b=e.target.closest('[data-story-group]');if(b)setStoryGroup(b.dataset.storyGroup);};
$('battleCategories').onclick=e=>{const b=e.target.closest('[data-battle-group]');if(b)setBattleGroup(b.dataset.battleGroup);};
function setCharacterView(view){
 const host=$('characters');host.querySelector('[data-character-overview]').hidden=view!=='overview';host.querySelector('[data-character-conditions]').hidden=view!=='conditions';host.querySelector('[data-character-endings]').hidden=view!=='endings';
}
$('eventList').onclick=e=>{if(e.target.closest('[data-character-conditions-nav]')){selectProfile($('characters'),null);setCharacterView('conditions');showSettingsSidebar();return;}if(e.target.closest('[data-character-endings-nav]')){selectProfile($('characters'),null);setCharacterView('endings');showSettingsSidebar();return;}const category=e.target.closest('[data-sidebar-category]');if(category){settingSidebar=category.dataset.sidebarCategory;filterSettings();return;}const school=e.target.closest('[data-sidebar-school]');if(school){settingSidebar=school.dataset.sidebarSchool;filterSettings();return;}const race=e.target.closest('[data-sidebar-race]');if(race){settingSidebar=race.dataset.sidebarRace;filterSettings();return;}const classView=e.target.closest('[data-sidebar-class]');if(classView){settingSidebar=classView.dataset.sidebarClass;filterSettings();return;}const term=e.target.closest('[data-term-anchor]');if(term){$(term.dataset.termAnchor)?.scrollIntoView({block:'start'});return;}const profile=e.target.closest('[data-sidebar-profile]');if(profile){openProfile($(settingId),profile.dataset.sidebarProfile);return;}const town=e.target.closest('[data-sidebar-town]');if(town){selectTownStore(town.dataset.sidebarTown,0);return;}const row=e.target.closest('[data-sidebar-row]');if(row){$(settingId).querySelectorAll('[data-filter-row]')[Number(row.dataset.sidebarRow)]?.scrollIntoView({block:'center'});return;}const direct=e.target.closest('[data-event]');if(direct){loadEvent(Number(direct.dataset.event));return;}const b=e.target.closest('[data-location]');if(!b)return;pointId=Number(b.dataset.location);world=A.points[pointId].world;if(section==='story')loadEvent(storyGroup==='side'?A.points[pointId].side_event:A.points[pointId].main_events[0]);else setSection('world');};
$('prev').onclick=previous;$('next').onclick=()=>step();$('restart').onclick=e=>{e.preventDefault();restartEvent();};
$('sourceLine').onclick=e=>{if(e.target.closest('#showLocation')){pointId=source(eventId).point_id;world=A.points[pointId].world;setSection('world');}};
$('toggleSidebar').onclick=()=>setSidebarHidden(!document.body.classList.contains('sidebar-hidden'));
$('homeLink').onclick=e=>{e.preventDefault();setSection('home');};
$('stage').onclick=e=>{if(e.target.closest('#interlude,#storyBattleLink,[data-open-character]'))return;step();};
$('interlude').onclick=e=>{const choice=e.target.closest('[data-choice-target]');if(!choice)return;e.stopPropagation();step(Number(choice.dataset.choiceTarget));};
document.addEventListener('contextmenu',e=>{
 if(section!=='story')return;
 e.preventDefault();
 if(e.target.closest('#storyWorkspace')&&!document.querySelector('dialog[open]'))previous();
});
$('stage').onkeydown=e=>{if(e.key==='Enter'&&!e.target.closest('button')){e.preventDefault();step();}};
$('settingsFilter').oninput=filterSettings;
$('shopViewSwitch').onclick=e=>{const shopMode=e.target.closest('[data-shop-view]');if(shopMode)setShopView(shopMode.dataset.shopView);};
$('settingsContent').onclick=e=>{
 if(e.target.closest('[data-special-event]')){e.preventDefault();e.stopPropagation();openSpecialEvent();return;}
 if(e.target.closest('[data-close-special-event]')){$('sacrificeDialog').close();return;}

 const flowEvent=e.target.closest('[data-open-event]');if(flowEvent){e.stopPropagation();loadEvent(Number(flowEvent.dataset.openEvent));return;}
 const flowField=e.target.closest('[data-open-field]');if(flowField){e.stopPropagation();openField(flowField.dataset.openField);return;}
 const character=e.target.closest('[data-open-character]');if(character){e.stopPropagation();openCharacter(Number(character.dataset.openCharacter));return;}
 const profile=e.target.closest('[data-profile],[data-profile-link]');if(profile)openProfile(profile.closest('section'),profile.dataset.profile||profile.dataset.profileLink);
 const closeProfile=e.target.closest('[data-close-profile]');if(closeProfile){selectProfile(closeProfile.closest('section'),null);showSettingsSidebar();}
 const item=e.target.closest('[data-item]');if(item){const itemSection=item.closest('[data-item-section]'),detail=itemSection.querySelector(`[data-item-detail="${item.dataset.item}"]`),drawer=itemSection.querySelector('[data-item-drawer]');itemSection.querySelectorAll('[data-item-detail]').forEach(p=>p.hidden=p!==detail);if(drawer)drawer.hidden=!detail;else detail?.scrollIntoView({block:'nearest'});}
 const closeItem=e.target.closest('[data-close-item]');if(closeItem){const itemSection=closeItem.closest('[data-item-section]');itemSection.querySelectorAll('[data-item-detail]').forEach(p=>p.hidden=true);const drawer=itemSection.querySelector('[data-item-drawer]');if(drawer)drawer.hidden=true;}
};
$('settingsContent').onkeydown=e=>{const row=e.target.closest('tr[data-item],tr[data-profile-link],tr[data-open-character]');if(row&&['Enter',' '].includes(e.key)){e.preventDefault();row.click();}};
$('settingsContent').onchange=e=>{const select=e.target.closest('[data-enemy-variant]');if(select)select.closest('[data-profile-detail]').querySelectorAll('[data-variant]').forEach(p=>p.hidden=p.dataset.variant!==select.value);};
function updateMapHoverLabel(target){const label=$('worldMap').querySelector('[data-map-label]'),hovered=target?.closest?.('[data-point]'),point=hovered?A.points[Number(hovered.dataset.point)]:A.points[pointId];if(label)label.textContent=point?.name||'';}
function updateRaceTooltip(point,event){
 const host=$('races'),tip=host.querySelector('[data-race-tooltip]');if(!tip)return;
 if(!point){tip.hidden=true;return;}
 tip.innerHTML=`<strong>${esc(point.dataset.race)}</strong><span>LEVEL ${esc(point.dataset.level)}</span><span>${Number(point.dataset.exp).toLocaleString()} EXP</span>`;
 tip.hidden=false;
 const wrap=tip.parentElement,wrapRect=wrap.getBoundingClientRect(),pointRect=point.getBoundingClientRect();
 const anchorX=(event?.clientX||pointRect.left+pointRect.width/2)-wrapRect.left,anchorY=(event?.clientY||pointRect.top)-wrapRect.top;
 tip.style.left=Math.max(8,Math.min(wrapRect.width-tip.offsetWidth-8,anchorX+12))+'px';
 tip.style.top=Math.max(8,anchorY-tip.offsetHeight-10)+'px';
}
$('worldMap').onpointerover=e=>{const from=e.target.closest?.('[data-point]'),to=e.relatedTarget?.closest?.('[data-point]');if(from!==to)updateMapHoverLabel(e.target);};
$('worldMap').onpointerout=e=>{const from=e.target.closest?.('[data-point]'),to=e.relatedTarget?.closest?.('[data-point]');if(from!==to)updateMapHoverLabel(null);};
$('worldMap').onfocusin=e=>updateMapHoverLabel(e.target);
$('worldMap').onfocusout=e=>updateMapHoverLabel(null);
$('races').onpointerover=e=>{const point=e.target.closest?.('[data-race-point]');if(point)updateRaceTooltip(point,e);};
$('races').onpointermove=e=>{const point=e.target.closest?.('[data-race-point]');if(point)updateRaceTooltip(point,e);};
$('races').onpointerout=e=>{const point=e.target.closest?.('[data-race-point]');if(point&&!e.relatedTarget?.closest?.('[data-race-point]'))updateRaceTooltip(null);};
$('races').onfocusin=e=>{const point=e.target.closest?.('[data-race-point]');if(point)updateRaceTooltip(point);};
$('races').onfocusout=e=>{if(e.target.closest?.('[data-race-point]'))updateRaceTooltip(null);};
$('worldPanel').onclick=e=>{
 const target=e.target.closest('button');
 if(!target)return;
 e.preventDefault();e.stopPropagation();
 if(target.matches('[data-close-temple-advice]')){target.closest('[data-temple-advice-drawer]').hidden=true;return;}
 if(target.matches('[data-open-temple-advice]')){target.closest('#locationInfo').querySelector('[data-temple-advice-drawer]').hidden=false;return;}
 if(target.matches('[data-open-town-store]')){openTownStore(Number(target.dataset.openTownStore),Number(target.dataset.storeIndex)||0,target.dataset.shopSourceView||shopView);return;}
 if(target.matches('[data-open-field]')){openField(target.dataset.openField);return;}
 if(target.matches('[data-open-event]')){loadEvent(Number(target.dataset.openEvent));return;}
 if(target.matches('[data-cross-world]')){world=world===1?2:1;pointId=world===1?28:29;renderWorld();return;}
 if(target.matches('[data-world]')){world=Number(target.dataset.world);if(A.points[pointId].world!==world)pointId=world===1?0:29;renderWorld();return;}
 if(target.matches('[data-point]')){pointId=Number(target.dataset.point);renderWorld();}
};
function sortClassColumn(column){
 const table=$('classes').querySelector('[data-class-overview] table');
 const rank=cell=>cell.querySelector('.class-status-initial')?0:cell.querySelector('.class-status-final')?2:cell.querySelector('.class-status-unlocked')?1:3;
 const rows=[...table.tBodies[0].rows];
 const originalOrder=new Map(rows.map((row,index)=>[row,index]));
 rows.sort((a,b)=>rank(a.cells[column])-rank(b.cells[column])||originalOrder.get(a)-originalOrder.get(b));
 table.tBodies[0].append(...rows);
 table.querySelectorAll('thead th').forEach((cell,index)=>{if(index===column)cell.setAttribute('aria-sort','ascending');else cell.removeAttribute('aria-sort');});
 scheduleTableHeader();
}
function sortGrowthColumn(column){
 const table=$('classes').querySelector('[data-class-growth] table');
 const header=table.tHead.rows[0].cells[column];
 const descending=header.getAttribute('aria-sort')!=='descending';
 const rows=[...table.tBodies[0].rows];
 rows.sort((a,b)=>{
  const difference=Number(b.cells[column].textContent)-Number(a.cells[column].textContent);
  return (descending?difference:-difference)||Number(a.dataset.growthOrder)-Number(b.dataset.growthOrder);
 });
 table.tBodies[0].append(...rows);
 table.querySelectorAll('thead th').forEach(cell=>cell.removeAttribute('aria-sort'));
 header.setAttribute('aria-sort',descending?'descending':'ascending');
 scheduleTableHeader();
}
document.addEventListener('click',e=>{
 if(e.target.closest('[data-special-event]')){e.preventDefault();openSpecialEvent();return;}
 if(e.target.closest('[data-close-special-event]')){$('sacrificeDialog').close();return;}
 const sort=e.target.closest('[data-class-sort]');if(sort){sortClassColumn(Number(sort.dataset.classSort));return;}
 const growthSort=e.target.closest('[data-growth-sort]');if(growthSort){sortGrowthColumn(Number(growthSort.dataset.growthSort));return;}
 const character=e.target.closest('[data-open-character]');if(character){openCharacter(Number(character.dataset.openCharacter));return;}
 const townStore=e.target.closest('[data-open-town-store]');if(townStore){openTownStore(Number(townStore.dataset.openTownStore),Number(townStore.dataset.storeIndex)||0,townStore.dataset.shopSourceView||shopView);return;}
 const battleUnit=e.target.closest('[data-enemy-profile]');if(battleUnit){openBattleEnemyProfile(battleUnit);return;}
 const closeBattle=e.target.closest('[data-close-battle-drawer]');if(closeBattle)closeBattle.closest('[data-battle-drawer]').hidden=true;
 const field=e.target.closest('[data-open-field]');if(field)openField(field.dataset.openField);
 const nav=e.target.closest('a[data-section],button[data-section]');if(nav){e.preventDefault();if(nav.dataset.settingSection){selectSetting(nav.dataset.settingSection);if(nav.dataset.settingView){settingSidebar=nav.dataset.settingView;if(AressReferenceLoaded(settingId))filterSettings();}}setSection(nav.dataset.section);}
 const open=e.target.closest('[data-open-event]');if(open)loadEvent(Number(open.dataset.openEvent));
 const item=e.target.closest('[data-jump-item]');if(item)openItem(Number(item.dataset.jumpItem));
 const spell=e.target.closest('[data-jump-spell]');if(spell)openSpell(Number(spell.dataset.jumpSpell));
});
document.addEventListener('input',e=>{const host=e.target.closest('#storyBattle,#fieldViewer');if(!host)return;const board=host.querySelector('.battle-board');if(e.target.matches('[data-zoom]')){const scale=Number(e.target.value)/100;board.style.width=Number(board.dataset.nativeWidth)*scale+'px';board.style.height=Number(board.dataset.nativeHeight)*scale+'px';const label=host.querySelector('[data-zoom-label]');if(label)label.textContent=Number(scale.toFixed(2))+'×';}if(e.target.matches('[data-layer]'))board.classList.toggle('hide-'+(e.target.dataset.layer==='ally'?'allies':'enemies'),!e.target.checked);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('sacrificeDialog')?.open)return;document.querySelectorAll('[data-profile-drawer],[data-item-drawer],[data-battle-drawer],[data-temple-advice-drawer]').forEach(d=>d.hidden=true);document.querySelectorAll('[data-profile]').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false');});return;}if(section!=='story'||document.querySelector('dialog[open]')||e.target.closest('input,select,textarea,[contenteditable="true"]'))return;if(e.key===' '&&e.target.closest('button,a,summary'))return;if(['ArrowRight',' '].includes(e.key)){e.preventDefault();step();}else if(e.key==='ArrowLeft'){e.preventDefault();$('prev').click();}else if(e.key==='Home'){e.preventDefault();restartEvent();}else if(e.key==='End'){e.preventDefault();jumpToEnd();}});
function applyLocation(){const target=pageFromLocation();if(target.setting)selectSetting(target.setting);setSection(target.section,false);}
// A horizontal scroll container traps CSS sticky positioning. Share one viewport
// header across all responsive tables, preserving their measured column widths.
let tableHeaderFrame=0;
const floatingTableHeader=document.createElement('div');
floatingTableHeader.className='floating-table-header';floatingTableHeader.hidden=true;
floatingTableHeader.setAttribute('aria-hidden','true');document.body.append(floatingTableHeader);
function scheduleTableHeader(){
 if(tableHeaderFrame)return;
 tableHeaderFrame=requestAnimationFrame(()=>{tableHeaderFrame=0;syncTableHeader();});
}
function syncTableHeader(){
 const top=document.querySelector('.top-banner').getBoundingClientRect().bottom;
 const table=[...document.querySelectorAll('.table-responsive table')].find(table=>{
  const box=table.getBoundingClientRect(),head=table.tHead;
  return head&&box.width>0&&box.top<top&&box.bottom>top+head.getBoundingClientRect().height;
 });
 floatingTableHeader.hidden=!table;if(!table)return;
 const wrapper=table.closest('.table-responsive'),box=wrapper.getBoundingClientRect(),tableBox=table.getBoundingClientRect();
 const copy=table.cloneNode(false),head=table.tHead.cloneNode(true);
 copy.removeAttribute('id');head.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
 const originals=table.tHead.querySelectorAll('th,td');
 head.querySelectorAll('th,td').forEach((cell,index)=>{const original=originals[index],width=original.getBoundingClientRect().width,style=getComputedStyle(original);cell.style.width=cell.style.minWidth=cell.style.maxWidth=width+'px';cell.style.textAlign=style.textAlign;cell.style.padding=style.padding;});
 copy.append(head);copy.style.width=tableBox.width+'px';copy.style.transform=`translateX(${-wrapper.scrollLeft}px)`;
 floatingTableHeader.style.cssText=`top:${top}px;left:${box.left}px;width:${wrapper.clientWidth}px`;
 floatingTableHeader.replaceChildren(copy);
}
document.addEventListener('scroll',scheduleTableHeader,true);
window.addEventListener('resize',scheduleTableHeader);
new ResizeObserver(scheduleTableHeader).observe($('settingsContent'));
window.addEventListener('hashchange',applyLocation);
window.addEventListener('popstate',applyLocation);
 const initialPage=pageFromLocation();if(initialPage.setting)selectSetting(initialPage.setting);setSection(initialPage.section,false);
window.history.replaceState({section:initialPage.section,setting:initialPage.setting||''},'',location.href);
setSidebarHidden(compactSidebar.matches);
compactSidebar.addEventListener('change',event=>setSidebarHidden(event.matches));
$('eventList').addEventListener('click',event=>{if(compactSidebar.matches&&event.target.closest('button'))requestAnimationFrame(()=>setSidebarHidden(true));});
})();
