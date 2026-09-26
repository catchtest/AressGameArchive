// Normal links work without JavaScript. Existing interactive controls stay intact.
(function(){
'use strict';
const routes=window.AressSEORoutes||[];
const byPath=new Map(routes.map(route=>[route.path,route]));
const key=value=>{const url=new URL(value,document.baseURI);url.searchParams.sort();return url.pathname+'?'+url.searchParams.toString();};
const byURL=new Map(routes.map(route=>[key(route.url||route.path||'./'),route]));
const fromLocation=()=>byURL.get(key(location.href));
const find=predicate=>routes.find(predicate)?.path;
function destination(node,route){
 const d=node.dataset;
 if(node.id==='homeLink')return '';
 if(d.specialEvent!==undefined)return 'sacrifice/';
 if(d.section)return (d.settingSection||d.section)==='home'?'':d.settingView?find(r=>r.setting===d.settingSection&&r.filter===d.settingView):(d.settingSection||d.section)+'/';
 if(d.openCharacter!==undefined)return `characters/characters-${d.openCharacter}/`;
 if(d.enemyProfile)return `enemies/${d.enemyProfile}/`;
 if(d.profile||d.profileLink)return `${node.closest('section[id]')?.id}/${d.profile||d.profileLink}/`;
 if(d.sidebarProfile!==undefined)return d.sidebarProfile?`${route.setting}/${d.sidebarProfile}/`:`${route.setting}/`;
 if(d.openEvent!==undefined||d.event!==undefined)return `story/${d.openEvent??d.event}/`;
 if(d.openField)return `battles/${d.openField.replace(/\.[^.]+$/,'').toLowerCase()}/`;
 if(d.point!==undefined)return `world/${d.point}/`;
 if(d.location!==undefined){
  if(route.section==='world')return `world/${d.location}/`;
  // The original sidebar already knows which visit its location button opens.
  const target=node.dataset.seoEvent;
  return target!==undefined?`story/${target}/`:undefined;
 }
 if(d.storyGroup)return d.storyGroup==='main'?'story/':'story/side/';
 if(d.battleGroup)return d.battleGroup==='main'?'battles/':'battles/repeat/';
 if(d.jumpItem!==undefined||d.item!==undefined){const id=Number(d.jumpItem??d.item);return `${id<256?'equipment':'items'}/${id}/`;}
 if(d.jumpSpell!==undefined)return 'spells/#spell-'+d.jumpSpell;
 if(d.openTownStore!==undefined||d.sidebarTown!==undefined)return `shops/${d.openTownStore??d.sidebarTown}/${d.shopSourceView||route.shop||'products'}/`;
 if(d.shopView!==undefined)return `shops/${route.town??routes.find(r=>r.town!==undefined)?.town}/${d.shopView}/`;
 if(d.sidebarClass!==undefined)return d.sidebarClass?`classes/${d.sidebarClass}/`:'classes/';
 if(d.sidebarRace!==undefined)return d.sidebarRace==='growth'?'races/':`races/${d.sidebarRace}/`;
 if(d.sidebarCategory!==undefined)return d.sidebarCategory?find(r=>r.setting===route.setting&&r.filter===d.sidebarCategory):route.setting+'/';
 if(d.sidebarSchool!==undefined)return d.sidebarSchool?find(r=>r.setting==='spells'&&r.filter===d.sidebarSchool):'spells/';
 if(d.characterConditionsNav!==undefined)return 'characters/conditions/';
 if(d.characterEndingsNav!==undefined)return 'characters/endings/';
 if(d.formulaAnchor)return 'formula/#'+d.formulaAnchor;
 if(d.closeProfile!==undefined||d.closeItem!==undefined||d.closeSpecialEvent!==undefined)return (route.setting||'characters')+'/';
}
function linkify(root,route){
 for(const node of [...root.querySelectorAll('a,button,tr[data-item],tr[data-profile-link],tr[data-open-character]')]){
  if(node.dataset.seoLink!==undefined)continue;
  const path=destination(node,route);
  if(path===undefined||!byPath.has(path.split('#')[0]))continue;
  const target=byPath.get(path.split('#')[0]);
  const href=(target.url||target.path||'./')+(path.includes('#')?'#'+path.split('#')[1]:'');
  if(node.tagName==='TR'){
   const cell=node.querySelector('td,th');if(!cell||cell.querySelector('a'))continue;
   const anchor=document.createElement('a');anchor.href=href;anchor.className='seo-row-link';anchor.dataset.seoLink='';anchor.append(...cell.childNodes);cell.append(anchor);
  }else if(node.tagName==='A'){
   node.setAttribute('href',href);node.dataset.seoLink='';
  }else{
   const anchor=document.createElement('a');
   for(const attr of node.attributes)if(!['type','disabled'].includes(attr.name))anchor.setAttribute(attr.name,attr.value);
   anchor.classList.add('seo-link');anchor.href=href;anchor.dataset.seoLink='';
   anchor.append(...node.childNodes);node.replaceWith(anchor);
  }
 }
}
window.AressSEOLinks={linkify};
const raw=document.body.dataset.seoRoute;
if(!raw)return; // The isolated prerendering page only uses the helpers above.
let route=fromLocation()||JSON.parse(raw),pending=null,drawerOrigin=null,reflectRequest=0;
document.body.dataset.seoRoute=JSON.stringify(route);
const metadataCache=new Map();
document.querySelector('base').href=document.baseURI;
history.scrollRestoration='manual';
if(route.section==='home')document.body.dataset.seoReady='true';
function reflect(next){
 route=next;document.body.dataset.seoRoute=JSON.stringify(route);
 const url=new URL(route.url||route.path||'./',document.baseURI);
 if(location.pathname!==url.pathname||location.search!==url.search){
  if(history.state?.seo)history.replaceState({...history.state,scroll:[scrollX,scrollY]},'');
  history.pushState({seo:true,scroll:[scrollX,scrollY]},'',url);
 }
 const request=++reflectRequest;
 const metadataURL=new URL(route.page??route.path??'./',document.baseURI);
 if(!metadataCache.has(metadataURL.href))metadataCache.set(metadataURL.href,fetch(metadataURL).then(response=>{if(!response.ok)throw Error('HTTP '+response.status);return response.text();}));
 metadataCache.get(metadataURL.href).then(markup=>{
  if(request!==reflectRequest)return;
  const page=new DOMParser().parseFromString(markup,'text/html');
  document.title=page.title;
  for(const selector of ['link[rel=canonical]','meta[name=description]','meta[property="og:title"]','meta[property="og:description"]','meta[property="og:url"]','meta[name="twitter:title"]','meta[name="twitter:description"]','script[type="application/ld+json"]']){
   const incoming=page.querySelector(selector),current=document.querySelector(selector);if(incoming&&current)current.replaceWith(incoming);
  }
  const incoming=page.getElementById('seoSupplement'),current=document.getElementById('seoSupplement');
  if(incoming&&current)current.replaceWith(incoming);
 }).catch(error=>console.error('SEO page metadata: '+error.message));
}
function syncRoute(){
 if(!window.AressSEO)return;
 const detail=window.AressSEO.detail();
 if(detail){
  const next=byPath.get(detail);
  if(next&&next.path!==route.path){
   drawerOrigin=drawerOrigin||route;
   pending=null;reflect(next);
  }
  return;
 }
 if(drawerOrigin){
  const origin=drawerOrigin;drawerOrigin=null;
  // A different category click takes priority over returning from a drawer.
  if(!pending)reflect(origin);
 }

 if(!pending&&!detail&&(route.profile||route.item!==undefined||route.special)){
  const parent=byPath.get((route.setting||'characters')+'/');if(parent)reflect(parent);
 }
 if(pending&&window.AressSEO.matches(pending)){
  let next=pending;pending=null;
  if(next.path.split('/').filter(Boolean).length<=1){
   if(next.section==='story')next=byPath.get(`story/${window.AressSEO.event()}/`)||next;
   if(next.section==='world')next=byPath.get(`world/${window.AressSEO.point()}/`)||next;
  }
  reflect(next);
 }
 const event=window.AressSEO.event();
 if(!pending&&event!==null&&route.section==='story'&&route.event!==event){const next=byPath.get(`story/${event}/`);if(next)reflect(next);}
 const point=window.AressSEO.point();
 if(!pending&&point!==null&&route.section==='world'&&route.point!==point){const next=byPath.get(`world/${point}/`);if(next)reflect(next);}
}
document.addEventListener('click',event=>{
 const link=event.target.closest('a[data-seo-link]');
 if(!link)return;
 if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey){event.stopImmediatePropagation();return;}
 const action=link.matches('.seo-link,.seo-row-link,#homeLink,[data-section],[data-special-event]');
 if(!action){event.stopImmediatePropagation();return;}
 if(!window.AressSEO){event.stopImmediatePropagation();return;}
 event.preventDefault(); // Original delegated handlers perform exactly the same action.
 if(link.classList.contains('seo-row-link'))link.closest('tr')?.focus();
 if(link.dataset.enemyProfile!==undefined||link.dataset.specialEvent!==undefined)return;
 const next=byURL.get(key(link.getAttribute('href')));
 if(next)queueMicrotask(()=>{pending=next;if(!window.AressSEO)document.body.dataset.seoReady='false';syncRoute();});
},true);
window.addEventListener('popstate',async event=>{
 event.stopImmediatePropagation();
 const next=fromLocation();
 if(!next){location.reload();return;}
 pending=null;drawerOrigin=null;route=next;document.body.dataset.seoRoute=JSON.stringify(route);document.body.dataset.seoReady='false';
 try{
  await window.AressSEO.apply(route,{preserveScroll:true});
  // Preserve the original hash-history scroll target for reference sections.
  if(event.state?.seo)window.scrollTo(...(event.state.scroll||[0,0]));
  else if(route.setting)document.getElementById(route.setting)?.scrollIntoView({block:'start'});
  document.activeElement?.blur();
  window.AressSEO.decorate(route);linkify(document,route);reflect(route);
  document.body.dataset.seoReady='true';
 }catch(error){document.body.dataset.seoError=error.message;console.error(error);}
},true);
window.addEventListener('aress-seo-ready',async()=>{
 try{
  await window.AressSEO.apply(pending||route);
  if(pending){const next=pending;pending=null;reflect(next);}
  window.AressSEO.decorate(route);
  linkify(document,route);
  if(location.hash.startsWith('#spell-')){
   const spell=document.getElementById(location.hash.slice(1));
   spell?.scrollIntoView({block:'center'});spell?.classList.add('row-focus');
   setTimeout(()=>spell?.classList.remove('row-focus'),1400);
  }
  document.body.dataset.seoReady='true';
  let scheduled=false;
  const observer=new MutationObserver(()=>{
   if(scheduled)return;scheduled=true;
   requestAnimationFrame(()=>{scheduled=false;observer.disconnect();syncRoute();window.AressSEO.decorate(route);linkify(document,route);observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','open']});});
  });
  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','open']});
 }catch(error){document.body.dataset.seoError=error.message;console.error(error);}
});
})();
