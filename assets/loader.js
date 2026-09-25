(function(){
'use strict';
const byId=id=>document.getElementById(id);
let appPromise=null,battlePromise=null,appReady=false;
const storyPromises=new Map(),referencePromises=new Map();
const referenceIds=['flow','equipment','items','characters','enemies','spells','classes','races','shops','terms'];
window.addEventListener('error',event=>{
 // Browsers report errors from extensions and other opaque third-party
 // scripts only as "Script error.".  They are unrelated to this reader and
 // contain no actionable source information, so do not present them as an
 // application failure.
 if(event.message==='Script error.'&&!event.error)return;
 const status=byId('runtimeStatus');
 if(status){status.hidden=false;status.setAttribute('role','alert');status.textContent='頁面發生錯誤：'+event.message;}
});
function setSidebarHidden(hidden){
 document.body.classList.toggle('sidebar-hidden',hidden);
 const toggle=byId('toggleSidebar');
 toggle.setAttribute('aria-expanded',String(!hidden));
 toggle.title=hidden?'顯示側欄':'收起側欄';
 toggle.textContent=hidden?'›':'‹';
}
function loadScript(src){
 return new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src=src;
  script.onload=resolve;
  script.onerror=()=>reject(new Error('無法載入 '+src));
  document.body.appendChild(script);
 });
}
const assetVersion='6413ee76f2cb';
const versioned=src=>src+'?v='+assetVersion;
function loadStoryData(id=130){
 if(D.events?.[id])return Promise.resolve();
 const group=id<71||id>=130?'main':'side';
 if(storyPromises.has(group))return storyPromises.get(group);
 const status=byId('runtimeStatus');
 if(appReady){status.hidden=false;status.textContent='正在載入劇情資料…';}
 const promise=loadScript(versioned(`assets/story-${group}.js`))
  .then(()=>{
   const story=window.AressStoryGroups[group];
   AressReader.expandConditions(story);
   D.events ||= [];
   story.events.forEach(event=>{D.events[event.id]=event;});
   delete window.AressStoryGroups[group];
   if(appReady){status.hidden=true;status.textContent='';}
  })
  .catch(error=>{
   storyPromises.delete(group);
   status.hidden=false;
   status.setAttribute('role','alert');
   status.textContent='劇情資料載入失敗：'+error.message;
   throw error;
  });
 storyPromises.set(group,promise);
 return promise;
}
window.AressLoadStory=loadStoryData;
function loadBattleData(){
 if(A.enemy_types)return Promise.resolve();
 if(battlePromise)return battlePromise;
 const status=byId('runtimeStatus');
 if(appReady){status.hidden=false;status.textContent='正在載入戰場資料…';}
 battlePromise=loadScript(versioned('assets/battle.js'))
  .then(()=>{
   const fields=new Map(BATTLE_DATA.fields.map(field=>[field.file,field]));
   A.fields.forEach(field=>Object.assign(field,fields.get(field.file)));
   A.enemy_types=BATTLE_DATA.enemy_types;
   A.initial_party=BATTLE_DATA.initial_party;
   if(appReady){status.hidden=true;status.textContent='';}
  })
  .catch(error=>{
   battlePromise=null;
   status.hidden=false;
   status.setAttribute('role','alert');
   status.textContent='戰場資料載入失敗：'+error.message;
   throw error;
  });
 return battlePromise;
}
window.AressLoadBattle=loadBattleData;
function initializeReferencePages(){
 const content=document.createDocumentFragment();
 for(const id of referenceIds){const section=document.createElement('section');section.id=id;section.hidden=true;content.append(section);}
 byId('settingsContent').replaceChildren(content);
}
let referenceTemplates;
function buildReferencePage(id){
 const page=window.AressReferencePages[id];
 referenceTemplates ||= [...document.querySelectorAll('template[data-page-template]')].map(template=>({
  element:template.hasAttribute('data-svg-child')?template.content.firstElementChild.firstElementChild:template.content.firstElementChild,
  attributes:JSON.parse(template.dataset.attrs)
 }));
 const build=reference=>{
  if(typeof reference==='string')return document.createTextNode(reference);
  const [templateId,values,children]=page.nodes[reference],template=referenceTemplates[templateId],element=template.element.cloneNode(false);
  template.attributes.forEach((name,index)=>{
   if(name==='+class')element.classList.add(...values[index].split(' '));
   else element.setAttribute(name,values[index]);
  });
  for(const child of children)element.appendChild(build(child));
  return element;
 };
 const built=build(page.root);
 if(id==='special'){
  document.body.append(built);
  delete window.AressReferencePages[id];
  return;
 }
 const host=byId(id);
 for(const name of built.getAttributeNames())if(name!=='id'&&name!=='hidden')host.setAttribute(name,built.getAttribute(name));
 host.replaceChildren(...built.childNodes);
 host.dataset.referenceLoaded='true';
 delete window.AressReferencePages[id];
}
window.AressReferenceLoaded=id=>id==='special'?!!byId('sacrificeDialog'):byId(id)?.dataset.referenceLoaded==='true';
function loadReferenceData(id){
 if(window.AressReferenceLoaded(id))return Promise.resolve();
 if(referencePromises.has(id))return referencePromises.get(id);
 const status=byId('runtimeStatus');
 if(appReady){status.hidden=false;status.textContent='正在載入資料…';}
 const promise=loadScript(versioned(`assets/reference-${id}.js`))
  .then(()=>{buildReferencePage(id);if(appReady){status.hidden=true;status.textContent='';}})
  .catch(error=>{
   referencePromises.delete(id);
   status.hidden=false;
   status.setAttribute('role','alert');
   status.textContent='資料載入失敗：'+error.message;
   throw error;
  });
 referencePromises.set(id,promise);
 return promise;
}
window.AressLoadReference=loadReferenceData;
function loadApplication(){
 if(appPromise)return appPromise;
 const status=byId('runtimeStatus');
 status.classList.add('dialogue');
 status.setAttribute('role','status');
 status.hidden=false;
 status.textContent='正在載入遊戲資料…';
 document.body.classList.add('app-loading');
 appPromise=loadScript(versioned('assets/data.js'))
  .then(()=>loadScript(versioned('assets/engine.js')))
  .then(()=>{
   initializeReferencePages();
   const setting=location.hash.slice(1);
   return referenceIds.includes(setting)?loadReferenceData(setting):undefined;
  })
  .then(()=>loadScript(versioned('assets/app.js')))
  .then(async()=>{
   if(location.hash.slice(1)==='story'||document.body.dataset.pageSection==='story')await loadStoryData(130);
   appReady=true;
   status.hidden=true;
   status.textContent='';
   document.body.classList.remove('app-loading');
   document.removeEventListener('click',interceptNavigation,true);
  })
  .catch(error=>{
   appPromise=null;
   status.hidden=false;
   status.setAttribute('role','alert');
   status.textContent='資料載入失敗：'+error.message;
   document.body.classList.remove('app-loading');
   throw error;
  });
 return appPromise;
}
function interceptNavigation(event){
 const button=event.target.closest?.('a[data-section],button[data-section]');
 if(!button||appReady)return;
 // Hash links also work before data loads; initialization reads the latest hash.
 if(button.matches('a[href]'))return;
 event.preventDefault();
 event.stopImmediatePropagation();
 loadApplication().then(()=>button.click());
}
document.addEventListener('click',interceptNavigation,true);
byId('toggleSidebar').onclick=()=>setSidebarHidden(!document.body.classList.contains('sidebar-hidden'));
setSidebarHidden(window.matchMedia('(max-width: 1000px)').matches);
const initial=location.hash.slice(1),initialPage=document.body.dataset.pageSection;
if((initial&&initial!=='home')||initialPage!=='home')loadApplication();
window.addEventListener('hashchange',()=>{
 const target=location.hash.slice(1);
 if(!appReady&&target&&target!=='home')loadApplication();
});
})();
