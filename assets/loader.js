(function(){
'use strict';
const byId=id=>document.getElementById(id);
let appPromise=null,appReady=false;
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
const assetVersion='1849d76ed65c';
const versioned=src=>src+'?v='+assetVersion;
function buildReferencePages(){
 const templates=[...document.querySelectorAll('template[data-page-template]')].map(template=>({
  element:template.hasAttribute('data-svg-child')?template.content.firstElementChild.firstElementChild:template.content.firstElementChild,
  attributes:JSON.parse(template.dataset.attrs)
 }));
 const build=reference=>{
  if(typeof reference==='string')return document.createTextNode(reference);
  const [templateId,values,children]=REFERENCE_PAGES.nodes[reference],template=templates[templateId],element=template.element.cloneNode(false);
  template.attributes.forEach((name,index)=>{
   if(name==='+class')element.classList.add(...values[index].split(' '));
   else element.setAttribute(name,values[index]);
  });
  for(const child of children)element.appendChild(build(child));
  return element;
 };
 const content=document.createDocumentFragment();
 for(const root of REFERENCE_PAGES.roots)content.appendChild(build(root));
 byId('settingsContent').replaceChildren(content);
}
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
   buildReferencePages();
   return loadScript(versioned('assets/app.js'));
  })
  .then(()=>{
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
