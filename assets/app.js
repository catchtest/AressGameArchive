(function(){
'use strict';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let eventId=130,history=[],position=0,guided=false,section='home',storyGroup='main',battleGroup='main',settingId='equipment',settingSidebar='',shopView='products',world=1,pointId=0,fieldFile=A.fields[0].file;
const imagePath=(name,category)=>`assets/${category}/${name.replace(/\.[^.]+$/,'.png')}`;
const spritePosition=(id,columns,rows)=>`${columns>1?id%columns/(columns-1)*100:0}% ${rows>1?Math.floor(id/columns)/(rows-1)*100:0}%`;
const pointSprite=id=>`<span class="point-sprite" style="background-position:${spritePosition(id,8,8)}" aria-hidden="true"></span>`;
const itemSprite=(id,label='')=>`<span class="item-icon item-sprite" style="background-position:${spritePosition(id,16,24)}" role="img" aria-label="${esc(label)}"></span>`;
const transparentImage='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
const spriteImage=(path,index,columns,rows,label='',cls='')=>`<img class="sprite-image ${cls}" src="${transparentImage}" style="--sprite-image:url(&quot;${path}&quot;);--sprite-size:${columns*100}% ${rows*100}%;--sprite-position:${spritePosition(index,columns,rows)}" alt="${esc(label)}">`;
const portraitSprite=(id,label='')=>spriteImage('portraits/FACE_SPRITE.png',id,16,13,label);
const mapUnitSprite=(path,label='',cls='')=>{const match=String(path).match(/(MIKATA|TEKI)_(\d+)\.png$/);if(!match)return '';const index=Number(match[2])+(match[1]==='TEKI'?95:0);return spriteImage('map_sprites/UNIT_SPRITE.png',index,16,7,label,cls);};
const source=id=>A.sources[id],eventName=id=>`${source(id).name} · ${source(id).title}`;
const settingLabels={equipment:'裝備',items:'道具',characters:'角色',enemies:'敵人',spells:'魔法',classes:'職系',races:'種族',shops:'商店'};
const homeInfo=`<dl class="home-sidebar-info">
 <div><dt>開發公司</dt><dd>Gust（ガスト）</dd></div>
 <div><dt>日本原版</dt><dd>1994 年 3 月 18 日</dd></div>
 <div><dt>原版平台</dt><dd>NEC PC-9801</dd></div>
 <div><dt>遊戲類型</dt><dd>回合制策略角色扮演</dd></div>
 <div><dt>繁體中文版</dt><dd>1996 年 · DOS</dd></div>
 <div><dt>中文代理發行</dt><dd>松崗電腦</dd></div>
 <div><dt>網站製作</dt><dd>蕭雲</dd></div>
</dl>`;
const hasDialogue=id=>D.events[id]?.instructions.some(row=>['06','07'].includes(row.opcode)&&String(row.display_body||row.body||row.text||'').trim());
const compactSidebar=window.matchMedia('(max-width: 1000px)');
function setSidebarHidden(hidden){document.body.classList.toggle('sidebar-hidden',hidden);$('toggleSidebar').setAttribute('aria-expanded',String(!hidden));$('toggleSidebar').title=hidden?'顯示側欄':'收起側欄';$('toggleSidebar').textContent=hidden?'›':'‹';}
function setImage(id,name,category){const el=$(id);el.hidden=!name;if(name&&category==='portraits'){const face=Number((String(name).match(/FACE(\d+)/)||[])[1]);el.src=transparentImage;el.classList.add('sprite-image');el.style.setProperty('--sprite-image','url("portraits/FACE_SPRITE.png")');el.style.setProperty('--sprite-size','1600% 1300%');el.style.setProperty('--sprite-position',spritePosition(face,16,13));el.alt=name;}else if(name){el.src=imagePath(name,category);el.alt=name;}else{el.removeAttribute('src');el.classList.remove('sprite-image');el.removeAttribute('style');}}
const groupForEvent=id=>id<71||id===130||id===A.ending_event_id?'main':'side';
function showEvents(){
 document.querySelectorAll('[data-story-group]').forEach(b=>b.classList.toggle('selected',b.dataset.storyGroup===storyGroup));
 document.querySelectorAll('[data-battle-group]').forEach(b=>b.classList.toggle('selected',b.dataset.battleGroup===battleGroup));
 if(section==='settings'){showSettingsSidebar();return;}
 if(section==='home'){$('eventList').innerHTML=homeInfo;return;}
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
  html+=button('列表','data-sidebar-profile=""',!selected)+profiles.map(b=>{
   const label=b.dataset.sidebarLabel||b.querySelector('.profile-card-name')?.textContent||'',context=b.querySelector('.profile-card-context')?.textContent||'',portrait=b.querySelector('img')?.getAttribute('src')||'';
   return `<button class="event sidebar-filter sidebar-profile ${b.classList.contains('selected')?'active':''}" data-sidebar-profile="${b.dataset.profile}"><img class="sidebar-profile-avatar" loading="lazy" src="${esc(portrait)}" alt=""><span class="sidebar-profile-copy"><strong>${esc(label)}</strong>${context?`<small>${esc(context)}</small>`:''}</span></button>`;
  }).join('');
 }else if(settingId==='shops'){
  html+=[...host.querySelectorAll('.town-store')].map(d=>{const label=d.dataset.townLabel||'',point=d.dataset.townPoint;return `<button class="event sidebar-filter sidebar-town ${d.hidden?'':'active'}" data-sidebar-town="${d.dataset.townId}">${point!==undefined?pointSprite(Number(point)):''}<span>${esc(label)}</span></button>`;}).join('');
 }else if(settingId==='races'){
  const values=['',...[...host.querySelectorAll('[data-race-series]')].map(row=>row.dataset.raceSeries)];
  html+=values.map(value=>button(value||'全部',`data-sidebar-race="${esc(value)}"`,value===settingSidebar)).join('');
 }else if(settingId==='classes'){
  const details=[...host.querySelectorAll('[data-class-detail]')];
  html+=button('列表','data-sidebar-class=""',settingSidebar==='')+details.map(row=>button(row.dataset.className,`data-sidebar-class="${row.dataset.classDetail}"`,settingSidebar===row.dataset.classDetail)).join('');
 }else{
  html+=[...host.querySelectorAll('[data-filter-row]')].map((r,i)=>button(r.dataset.sidebarLabel||r.querySelector('th,td,h3')?.textContent||'',`data-sidebar-row="${i}"`)).join('');
 }
 $('eventList').innerHTML=html;
}
function applyRaceFilter(){
 const host=$('races'),selected=settingSidebar;
 host.querySelectorAll('[data-race-series]').forEach(row=>row.classList.toggle('race-series-hidden',!!selected&&row.dataset.raceSeries!==selected));
 host.querySelectorAll('[data-race-legend]').forEach(row=>row.hidden=!!selected&&row.dataset.raceLegend!==selected);
 host.querySelectorAll('[data-race-members]').forEach(row=>row.hidden=!selected||row.dataset.raceMembers!==selected);
 const panel=host.querySelector('[data-race-members-panel]');if(panel)panel.hidden=!selected;
 const label=host.querySelector('[data-race-selection]');if(label)label.textContent=selected?selected+' · ':'';
}
function applyClassFilter(){
 const host=$('classes'),selected=settingSidebar;
 host.querySelector('[data-class-overview]').hidden=selected!=='';
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
function openField(file){const field=A.fields.find(f=>f.file===file);if(!field)return;fieldFile=file;battleGroup=field.battle_type;renderBattle($('fieldViewer'),field);setSection('battles');}
function setSection(next,updateHash=true){
 section=next;
 document.body.dataset.section=next;
 for(const name of ['home','story','settings','world','battles'])$(name==='story'?'storyWorkspace':name+'Panel').hidden=name!==next;
 document.querySelectorAll('[data-section]').forEach(b=>b.classList.toggle('selected',b.dataset.section===next&&(next!=='settings'||b.dataset.settingSection===settingId)));
 $('storyCategories').hidden=next!=='story';$('battleCategories').hidden=next!=='battles';showEvents();
 if(next==='world')renderWorld();
 if(updateHash)location.hash=next==='settings'?settingId:next;
}
function prepareEvent(id){
 eventId=id;storyGroup=groupForEvent(id);if(source(id).point_id!==null){pointId=source(id).point_id;world=A.points[pointId].world;}history=[AressReader.advance(D.events[id],AressReader.initial(),guided)];position=0;
}
function loadEvent(id){
 prepareEvent(id);
 showEvents();setSection('story');render();
}
function endingFinished(state){
 return eventId===A.ending_event_id&&!D.events[eventId].instructions.slice(state.pc).some(row=>['06','07'].includes(row.opcode)&&String(row.display_body||row.body||row.text||'').trim());
}
function render(){
 const s=history[position],e=D.events[eventId],origin=source(eventId);
 $('sourceLine').innerHTML=`<span>${esc(origin.kind)}</span><span class="breadcrumb-separator">›</span><strong>${esc(origin.name)}</strong>${origin.point_id!==null?'<button id="showLocation">世界地圖 ↗</button>':''}`;
 setImage('scene',s.scene,'scenes');$('emptyScene').hidden=true;
 const eventPoint=origin.point_id,backdropPoint=eventPoint===null?null:A.points[eventPoint],backdropWorld=backdropPoint?.world||world;
 $('mapBackdrop').hidden=!!s.scene;
 if(s.scene)$('mapBackdrop').innerHTML='';
 else if(backdropPoint?.background)$('mapBackdrop').innerHTML=`<img class="location-default-bg" src="${backdropPoint.background}" alt="${esc(backdropPoint.name)}景色">`;
 else $('mapBackdrop').innerHTML=worldArtwork(backdropWorld,eventPoint,false)+(backdropPoint?`<div class="map-hover-label story-location-label">${esc(backdropPoint.name)}</div>`:'');
 const narration=s.kind==='dialogue'&&(!s.speaker||s.speaker==='旁白'),endingFaces=s.endingFaceIds||[],showEndingFaces=s.kind==='dialogue'&&endingFaces.length>0,showFaces=s.kind==='dialogue'&&(!narration||showEndingFaces);
 const leftPortrait=showEndingFaces?`FACE${String(endingFaces[0]).padStart(3,'0')}.png`:s.left,rightPortrait=showEndingFaces?(endingFaces.length>1?`FACE${String(endingFaces[1]).padStart(3,'0')}.png`:null):s.right;
 setImage('leftFace',showFaces?leftPortrait:null,'portraits');setImage('rightFace',showFaces?rightPortrait:null,'portraits');$('portraitRow').hidden=!showFaces||(!leftPortrait&&!rightPortrait);
 $('dialogue').hidden=s.kind!=='dialogue';$('speaker').hidden=false;$('speaker').textContent=narration?'':s.speaker;$('body').textContent=s.body;$('body').classList.toggle('red',!!s.color);$('body').scrollTop=0;
 const rewardPanel=$('rewardPanel'),statusKinds=['reward','item-loss','party','money','class-unlock'];rewardPanel.hidden=!statusKinds.includes(s.kind);
 if(s.kind==='reward'||s.kind==='item-loss'){
  const merged=new Map();
  s.rewards.forEach(reward=>{const row=merged.get(reward.id)||{...reward,count:0};row.count++;merged.set(reward.id,row);});
 rewardPanel.innerHTML=`<h2>${s.kind==='reward'?'得到物品':'失去物品'}</h2><div class="reward-items">`+[...merged.values()].map(reward=>{const label=D.item_names[reward.id]||`道具 ${reward.id}`;return `<article class="reward-item">${itemSprite(reward.id,label)}<span>${esc(label)}${reward.count>1?` × ${reward.count}`:''}</span></article>`;}).join('')+'</div>';
 }else if(s.kind==='party'){
  rewardPanel.innerHTML=`<h2>${s.partyAction==='join'?'角色加入':'角色離隊'}</h2><div class="reward-items">`+s.characters.map(id=>`<button class="reward-item party-member" data-open-character="${id}">${portraitSprite(id)}<span>${esc(D.character_names[id]||`角色 ${id}`)}</span></button>`).join('')+'</div>';
 }else if(s.kind==='money'){
  rewardPanel.innerHTML=`<h2>獲得金錢</h2><p class="money-change">${Number(s.amount).toLocaleString()} G</p>`;
 }else if(s.kind==='class-unlock'){
  const unlocks=[...new Map((s.classUnlocks||[]).map(row=>[`${row.characterId}:${row.classId}`,row])).values()];
  rewardPanel.innerHTML=`<h2>開放職系</h2><div class="reward-items">`+unlocks.map(row=>{const id=row.characterId,classId=row.classId;return `<button class="reward-item party-member" data-open-character="${id}">${portraitSprite(id)}<span>${esc(D.character_names[id]||`角色 ${id}`)}<small>可轉職為<br>${esc(D.class_names[classId]||`職系 ${classId}`)}</small></span></button>`;}).join('')+`</div>`;
 }
 const conditionBanner=$('conditionBanner'),rawCondition=s.condition&&s.condition!=='不需額外條件'?s.condition:'',storedConditionGroups=s.conditionGroups||[];
 const parsedConditionGroups=rawCondition?(rawCondition.startsWith('（')&&rawCondition.endsWith('）')?rawCondition.slice(1,-1).split('） 或 （'): [rawCondition]).map(group=>group.split(' 且 ').filter(Boolean)):[];
 const parsedConditionCount=parsedConditionGroups.reduce((total,group)=>total+group.length,0);
 const conditionGroups=storedConditionGroups.length?storedConditionGroups:(rawCondition.length>180||parsedConditionCount>=4?parsedConditionGroups:[]);
 conditionBanner.classList.toggle('has-groups',conditionGroups.length>0);
 if(conditionGroups.length){
  const singleGroup=conditionGroups.length===1;
  const summary=singleGroup?`${conditionGroups[0].length} 項條件`:`${conditionGroups.length} 種可能`;
  const list=singleGroup?`<ul>${conditionGroups[0].map(term=>`<li>${esc(term)}</li>`).join('')}</ul>`:`<ol>${conditionGroups.map((group,index)=>`<li><b>可能 ${index+1}</b><ul>${group.map(term=>`<li>${esc(term)}</li>`).join('')}</ul></li>`).join('')}</ol>`;
  conditionBanner.innerHTML=`<details class="condition-details"><summary><span>出現條件</span><strong>${summary}</strong></summary><div class="condition-popover"><p>${singleGroup?'下列條件必須全部成立。':'符合下列任一組即可出現；每組列出的條件必須全部成立。'}</p>${list}</div></details>`;
 }else conditionBanner.textContent=rawCondition?'出現條件：'+rawCondition:'';
 $('stage').hidden=false;$('storyBattle').hidden=true;
 const battleLink=$('storyBattleLink'),field=s.kind==='battle'?A.fields.find(f=>f.file===s.battle.field):null;
 battleLink.hidden=!field;battleLink.innerHTML=field?`<span>接續戰鬥</span><button data-open-field="${esc(field.file)}">${esc(field.title)} ↗</button>`:'';
 const panel=$('interlude');panel.hidden=s.kind!=='choice';
 panel.innerHTML=s.kind==='choice'?`<h2>請選擇</h2><div class="choices"><button class="primary" data-choice-target="${s.choice.firstTarget}">${esc(s.choice.options[0])}</button><button data-choice-target="${s.choice.secondTarget}">${esc(s.choice.options[1])}</button></div>`:'';
 $('prev').disabled=position===0;$('next').disabled=s.kind==='branch'||endingFinished(s);
 $('next').textContent='下一段 →';
 $('modeNote').textContent='';
}
function step(target){
 const s=history[position];if(target===undefined&&s.kind==='choice')target=s.choice.firstTarget;
 if(target===undefined&&(s.kind==='branch'||endingFinished(s)))return;
 if(target===undefined&&position<history.length-1){position++;render();return;}
 const next=AressReader.advance(D.events[eventId],s,guided,target);
 if(next.kind==='end'){if(eventId===A.ending_event_id)return;loadEvent(eventId===70?A.ending_event_id:eventId===130?0:eventId>=129?0:eventId+1);return;}
 history=history.slice(0,position+1);history.push(next);position++;render();
}
function previous(){if(position>0){position--;render();}}
function worldArtwork(mapWorld,activePoint,interactive=true){
 const pts=A.points.filter(p=>p.world===mapWorld);
 const routes=A.routes.filter(r=>r.world===mapWorld).map(r=>{const a=A.points[r.from_id],b=A.points[r.to_id];return `<line x1="${a.x+4}" y1="${a.y}" x2="${b.x+4}" y2="${b.y}"/>`;}).join('');
 const borderPoint=A.points[mapWorld===1?28:29],portalY=mapWorld===1?25:374;
 const markers=pts.map(p=>interactive?`<button class="map-point ${p.id===activePoint?'active':''}" data-point="${p.id}" style="left:${(p.x+4)/640*100}%;top:${p.y/400*100}%" title="${esc(p.name)}" aria-label="${esc(p.name)}">${pointSprite(p.id)}</button>`:`<span class="map-point ${p.id===activePoint?'active':''}" style="left:${(p.x+4)/640*100}%;top:${p.y/400*100}%" aria-hidden="true">${pointSprite(p.id)}</span>`).join('');
 return `<img src="assets/scenes/IDO${mapWorld}.png" alt="${mapWorld===1?'前半':'後半'}世界地圖"><svg class="world-routes" viewBox="0 0 640 400" aria-hidden="true">${routes}<line class="world-crossing" x1="${borderPoint.x}" y1="${borderPoint.y}" x2="188" y2="${portalY}"/></svg>${markers}`+(interactive?`<div class="map-hover-label" data-map-label aria-live="polite">${esc(A.points[activePoint]?.name||'')}</div><button class="world-switch-strip" data-cross-world aria-label="切換至${mapWorld===1?'後半':'前半'}世界" title="切換至${mapWorld===1?'後半':'前半'}世界"></button>`:'');
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
 document.querySelectorAll('[data-world]').forEach(b=>b.classList.toggle('selected',Number(b.dataset.world)===world));
 const p=A.points[pointId],ids=[...p.main_events,p.side_event],battles=A.fields.filter(f=>f.events.some(i=>source(i).point_id===p.id)),town=A.shop_towns.find(t=>t.point_id===p.id);
 $('locationInfo').innerHTML=`<h2>${esc(p.name)}</h2>${p.background?`<img class="location-background" src="${p.background}" alt="${esc(p.name)}景色">`:''}<h3>劇情</h3><div class="location-events">`+ids.filter(i=>i<D.events.length&&(i!==p.side_event||hasDialogue(i))).map(i=>`<button data-open-event="${i}">${esc(source(i).title)}</button>`).join('')+`</div>${battles.length?'<h3 class="location-battles">戰鬥</h3><div class="location-events">'+battles.map(f=>`<button data-open-field="${f.file}">${esc(f.title)}</button>`).join('')+'</div>':''}${townServices(town)}${templeServices(p)}`;
}
function renderBattle(host,f,rosterMode){
 if(!f){host.innerHTML='<p>沒有找到此戰場資料。</p>';return;}
 const initial=f.number===1&&rosterMode!=='slots';
 const enemies=f.enemies,allies=f.allies.filter(u=>u.on_map&&(!initial||u.slot<=A.initial_party.length)),units=[...enemies.map(u=>({...u,side:'enemy',prefix:'敵'})),...allies.map(u=>({...u,side:'ally',prefix:'我',name:initial?A.initial_party[u.slot-1].name:`我方 ${u.slot}`,portrait:initial?A.initial_party[u.slot-1].portrait:null}))];
 const nativeWidth=f.width*16,nativeHeight=f.height*16,defaultScale=2;
 const unitMarkup=units.filter(u=>u.on_map).map(u=>{const content=u.sprite?mapUnitSprite(u.sprite,u.name):`<span class="ally-position">${u.slot}</span>`,nativeUnitSize=32,attrs=`class="unit ${u.side}" style="left:${u.x*16/nativeWidth*100}%;top:${u.y*16/nativeHeight*100}%;width:${nativeUnitSize/nativeWidth*100}%;height:${nativeUnitSize/nativeHeight*100}%" title="${esc(u.name)} (${u.x}, ${u.y})" aria-label="${esc(u.name)}，座標 ${u.x}, ${u.y}"`;return u.side==='enemy'?`<button type="button" ${attrs} data-enemy-profile="${u.profile_key}">${content}</button>`:`<span ${attrs}>${content}</span>`;}).join('');
 const groupMap=new Map();enemies.forEach(u=>{const key=u.profile_key,group=groupMap.get(key)||{unit:u,count:0};group.count++;groupMap.set(key,group);});
 const summary=[...groupMap.values()].map(({unit:u,count})=>`<button class="battle-enemy-card" data-enemy-profile="${u.profile_key}">${mapUnitSprite(u.sprite)}<span><strong>${esc(u.name)}</strong><small>HP ${u.hp}</small></span>${count>1?`<b>×${count}</b>`:''}</button>`).join('');
 const tools=`<div class="battle-tools"><h3>${esc(f.title)}</h3><div class="battle-layer-toggles"><label><input type="checkbox" data-layer="ally" checked>顯示我方</label><label><input type="checkbox" data-layer="enemy" checked>顯示敵方</label></div>${f.number===1?`<label>我方隊伍<select data-roster aria-label="我方名單"><option value="initial" ${initial?'selected':''}>開局隊伍</option><option value="slots" ${!initial?'selected':''}>全部出陣槽位</option></select></label>`:''}<label>縮放 <span class="zoom-control"><input type="range" data-zoom min="100" max="300" value="200" step="25" aria-label="地圖縮放"><output data-zoom-label>2×</output></span></label></div>`;
 const related=f.events.length?'<div class="battle-related"><h4>相關劇情</h4>'+f.events.map(i=>`<button data-open-event="${i}">${esc(eventName(i))}</button>`).join('')+'</div>':'';
 host.innerHTML=`<div class="battle-layout"><div class="battle-scroll"><div class="battle-board" style="width:${nativeWidth*defaultScale}px;height:${nativeHeight*defaultScale}px" data-field="${f.file}" data-native-width="${nativeWidth}" data-native-height="${nativeHeight}"><img class="battle-map" src="${f.image}" alt="${esc(f.title)}的戰場" style="width:100%;height:100%"><div class="battle-grid" style="background-size:${16/nativeWidth*100}% ${16/nativeHeight*100}%"></div>${unitMarkup}</div></div><div class="battle-sidebar">${tools}<h4>敵方總覽</h4><div class="battle-enemy-summary">${summary}</div>${related}</div></div><div class="profile-drawer battle-drawer" data-battle-drawer hidden><button class="drawer-scrim" data-close-battle-drawer aria-label="關閉敵方資料"></button><aside class="profile-panel" role="dialog" aria-label="敵方角色資料"><button class="drawer-close battle-drawer-close" data-close-battle-drawer aria-label="關閉敵方資料">✕</button><div data-battle-profile></div></aside></div>`;
}
function selectSetting(id){
 if(settingId!==id){$('settingsFilter').value='';settingSidebar='';}settingId=id;
 $('settingsTitle').textContent=settingLabels[id]||'';
 $('settingsFilter').hidden=id==='shops';
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
function filterSettings(){
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
  const section=$(id),cards=[...section.querySelectorAll('[data-profile-card]')];cards.forEach(b=>b.hidden=!b.dataset.search.toLowerCase().includes(q));
  section.querySelectorAll('[data-profile-overview-row]').forEach(row=>row.hidden=!(row.dataset.search||'').toLowerCase().includes(q));
  const visible=cards.filter(b=>!b.hidden);section.querySelector('.empty-results').hidden=!!visible.length;
  const selected=visible.find(b=>b.classList.contains('selected'));if(!selected)selectProfile(section,null);
 }
 if(section==='settings')showSettingsSidebar();
}
function openItem(id){
 const targetSection=id<256?'equipment':'items';
 $('settingsFilter').value='';selectSetting(targetSection);setSection('settings');
 const host=$(targetSection);settingSidebar='';filterSettings();
 host.querySelectorAll('[data-item-detail]').forEach(p=>p.hidden=p.dataset.itemDetail!==String(id));
 const detail=host.querySelector(`[data-item-detail="${id}"]`),drawer=host.querySelector('[data-item-drawer]');if(drawer)drawer.hidden=!detail;else if(detail)detail.scrollIntoView({block:'start'});
}
function openCharacter(id){
 $('settingsFilter').value='';selectSetting('characters');setSection('settings');filterSettings();
 const character=$('characters').querySelector(`[data-character-id="${id}"]`);
 if(character){selectProfile($('characters'),character.dataset.profile);showSettingsSidebar();}
}
function openSpell(id){
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
function openTownStore(townId,storeIndex=0,view=shopView){
 $('settingsFilter').value='';selectSetting('shops');setSection('settings');
 setShopView(view);
 selectTownStore(townId,storeIndex);
}
$('storyCategories').onclick=e=>{const b=e.target.closest('[data-story-group]');if(b)setStoryGroup(b.dataset.storyGroup);};
$('battleCategories').onclick=e=>{const b=e.target.closest('[data-battle-group]');if(b)setBattleGroup(b.dataset.battleGroup);};
$('eventList').onclick=e=>{const category=e.target.closest('[data-sidebar-category]');if(category){settingSidebar=category.dataset.sidebarCategory;filterSettings();return;}const school=e.target.closest('[data-sidebar-school]');if(school){settingSidebar=school.dataset.sidebarSchool;filterSettings();return;}const race=e.target.closest('[data-sidebar-race]');if(race){settingSidebar=race.dataset.sidebarRace;filterSettings();return;}const classView=e.target.closest('[data-sidebar-class]');if(classView){settingSidebar=classView.dataset.sidebarClass;filterSettings();return;}const profile=e.target.closest('[data-sidebar-profile]');if(profile){selectProfile($(settingId),profile.dataset.sidebarProfile);showSettingsSidebar();return;}const town=e.target.closest('[data-sidebar-town]');if(town){selectTownStore(town.dataset.sidebarTown,0);return;}const row=e.target.closest('[data-sidebar-row]');if(row){$(settingId).querySelectorAll('[data-filter-row]')[Number(row.dataset.sidebarRow)]?.scrollIntoView({block:'center'});return;}const direct=e.target.closest('[data-event]');if(direct){loadEvent(Number(direct.dataset.event));return;}const b=e.target.closest('[data-location]');if(!b)return;pointId=Number(b.dataset.location);world=A.points[pointId].world;if(section==='story')loadEvent(storyGroup==='side'?A.points[pointId].side_event:A.points[pointId].main_events[0]);else setSection('world');};
$('prev').onclick=previous;$('next').onclick=()=>step();$('restart').onclick=()=>loadEvent(eventId);
$('sourceLine').onclick=e=>{if(e.target.closest('#showLocation')){pointId=source(eventId).point_id;world=A.points[pointId].world;setSection('world');}};
$('toggleSidebar').onclick=()=>setSidebarHidden(!document.body.classList.contains('sidebar-hidden'));
$('homeLink').onclick=()=>setSection('home');
$('stage').onclick=e=>{if(e.target.closest('#interlude,#storyBattleLink,[data-open-character]'))return;step();};
$('interlude').onclick=e=>{const choice=e.target.closest('[data-choice-target]');if(choice)step(Number(choice.dataset.choiceTarget));};
$('dialogue').oncontextmenu=e=>{e.preventDefault();previous();};
$('stage').onkeydown=e=>{if(e.key==='Enter'&&!e.target.closest('button')){e.preventDefault();step();}};
$('settingsFilter').oninput=filterSettings;
$('shopViewSwitch').onclick=e=>{const shopMode=e.target.closest('[data-shop-view]');if(shopMode)setShopView(shopMode.dataset.shopView);};
$('settingsContent').onclick=e=>{
 const profile=e.target.closest('[data-profile],[data-profile-link]');if(profile){selectProfile(profile.closest('section'),profile.dataset.profile||profile.dataset.profileLink);showSettingsSidebar();}
 const closeProfile=e.target.closest('[data-close-profile]');if(closeProfile){selectProfile(closeProfile.closest('section'),null);showSettingsSidebar();}
 const item=e.target.closest('[data-item]');if(item){const itemSection=item.closest('[data-item-section]'),detail=itemSection.querySelector(`[data-item-detail="${item.dataset.item}"]`),drawer=itemSection.querySelector('[data-item-drawer]');itemSection.querySelectorAll('[data-item-detail]').forEach(p=>p.hidden=p!==detail);if(drawer)drawer.hidden=!detail;else detail?.scrollIntoView({block:'nearest'});}
 const closeItem=e.target.closest('[data-close-item]');if(closeItem){const itemSection=closeItem.closest('[data-item-section]');itemSection.querySelectorAll('[data-item-detail]').forEach(p=>p.hidden=true);const drawer=itemSection.querySelector('[data-item-drawer]');if(drawer)drawer.hidden=true;}
};
$('settingsContent').onkeydown=e=>{const row=e.target.closest('tr[data-item],tr[data-profile-link]');if(row&&['Enter',' '].includes(e.key)){e.preventDefault();row.click();}};
$('settingsContent').onchange=e=>{const select=e.target.closest('[data-enemy-variant]');if(select)select.closest('[data-profile-detail]').querySelectorAll('[data-variant]').forEach(p=>p.hidden=p.dataset.variant!==select.value);};
renderBattle($('fieldViewer'),A.fields[0]);
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
$('races').onclick=e=>{const legend=e.target.closest('[data-race-select]');if(legend){settingSidebar=legend.dataset.raceSelect;filterSettings();}};
document.addEventListener('click',e=>{
 const character=e.target.closest('[data-open-character]');if(character){openCharacter(Number(character.dataset.openCharacter));return;}
 const townStore=e.target.closest('[data-open-town-store]');if(townStore){openTownStore(Number(townStore.dataset.openTownStore),Number(townStore.dataset.storeIndex)||0,townStore.dataset.shopSourceView||shopView);return;}
 const templeAdvice=e.target.closest('[data-open-temple-advice]');if(templeAdvice){templeAdvice.closest('#locationInfo').querySelector('[data-temple-advice-drawer]').hidden=false;return;}
 const closeTemple=e.target.closest('[data-close-temple-advice]');if(closeTemple){closeTemple.closest('[data-temple-advice-drawer]').hidden=true;return;}
 const battleUnit=e.target.closest('[data-enemy-profile]');if(battleUnit){const host=battleUnit.closest('#storyBattle,#fieldViewer'),drawer=host.querySelector('[data-battle-drawer]'),sourceProfile=$('enemies').querySelector(`[data-profile-detail="${battleUnit.dataset.enemyProfile}"]`),target=drawer.querySelector('[data-battle-profile]');target.replaceChildren();if(sourceProfile){const profile=sourceProfile.cloneNode(true);profile.hidden=false;profile.removeAttribute('data-profile-detail');target.append(profile);}drawer.hidden=!sourceProfile;}
 const closeBattle=e.target.closest('[data-close-battle-drawer]');if(closeBattle)closeBattle.closest('[data-battle-drawer]').hidden=true;
 const field=e.target.closest('[data-open-field]');if(field)openField(field.dataset.openField);
 if(e.target.closest('[data-cross-world]')){world=world===1?2:1;pointId=world===1?28:29;renderWorld();}
 const nav=e.target.closest('[data-section]');if(nav){if(nav.dataset.settingSection)selectSetting(nav.dataset.settingSection);setSection(nav.dataset.section);}
 const worldButton=e.target.closest('[data-world]');if(worldButton){world=Number(worldButton.dataset.world);if(A.points[pointId].world!==world)pointId=world===1?0:29;renderWorld();}
 const point=e.target.closest('[data-point]');if(point){pointId=Number(point.dataset.point);renderWorld();}
 const open=e.target.closest('[data-open-event]');if(open)loadEvent(Number(open.dataset.openEvent));
 const item=e.target.closest('[data-jump-item]');if(item)openItem(Number(item.dataset.jumpItem));
 const spell=e.target.closest('[data-jump-spell]');if(spell)openSpell(Number(spell.dataset.jumpSpell));
});
document.addEventListener('change',e=>{if(!e.target.matches('[data-roster]'))return;const host=e.target.closest('#storyBattle,#fieldViewer');const f=A.fields.find(f=>f.file===host.querySelector('[data-field]').dataset.field);renderBattle(host,f,e.target.value);});
document.addEventListener('input',e=>{const host=e.target.closest('#storyBattle,#fieldViewer');if(!host)return;const board=host.querySelector('.battle-board');if(e.target.matches('[data-zoom]')){const scale=Number(e.target.value)/100;board.style.width=Number(board.dataset.nativeWidth)*scale+'px';board.style.height=Number(board.dataset.nativeHeight)*scale+'px';const label=host.querySelector('[data-zoom-label]');if(label)label.textContent=Number(scale.toFixed(2))+'×';}if(e.target.matches('[data-layer]'))board.classList.toggle('hide-'+(e.target.dataset.layer==='ally'?'allies':'enemies'),!e.target.checked);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelectorAll('[data-profile-drawer],[data-item-drawer],[data-battle-drawer],[data-temple-advice-drawer]').forEach(d=>d.hidden=true);document.querySelectorAll('[data-profile]').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false');});return;}if(['INPUT','SELECT','TEXTAREA','BUTTON','A','SUMMARY'].includes(document.activeElement.tagName)||section!=='story')return;if(['ArrowRight',' '].includes(e.key)){e.preventDefault();step();}else if(e.key==='ArrowLeft'){e.preventDefault();$('prev').click();}});
window.addEventListener('hashchange',()=>{const name=location.hash.slice(1);if(settingLabels[name]){selectSetting(name);if(section!=='settings')setSection('settings',false);}else if(['home','story','world','battles'].includes(name)&&name!==section)setSection(name,false);});
const initialSection=location.hash.slice(1);prepareEvent(130);render();selectSetting(settingLabels[initialSection]?initialSection:'equipment');if(settingLabels[initialSection])setSection('settings',false);else if(['story','world','battles'].includes(initialSection))setSection(initialSection,false);else setSection('home',false);
setSidebarHidden(compactSidebar.matches);
compactSidebar.addEventListener('change',event=>setSidebarHidden(event.matches));
$('eventList').addEventListener('click',event=>{if(compactSidebar.matches&&event.target.closest('button'))requestAnimationFrame(()=>setSidebarHidden(true));});
})();
