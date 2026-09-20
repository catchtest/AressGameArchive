(function(){
'use strict';
const byId=id=>document.getElementById(id);
let appPromise=null,appReady=false;
window.addEventListener('error',event=>{
 const status=byId('runtimeStatus');
 if(status){status.hidden=false;status.textContent='頁面發生錯誤：'+event.message;}
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
function loadApplication(){
 if(appPromise)return appPromise;
 const status=byId('runtimeStatus');
 status.hidden=false;
 status.textContent='正在載入遊戲資料…';
 document.body.classList.add('app-loading');
 appPromise=loadScript('assets/data.js')
  .then(()=>loadScript('assets/engine.js'))
  .then(()=>loadScript('assets/app.js'))
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
   status.textContent='資料載入失敗：'+error.message;
   document.body.classList.remove('app-loading');
   throw error;
  });
 return appPromise;
}
function interceptNavigation(event){
 const button=event.target.closest?.('[data-section]');
 if(!button||appReady)return;
 event.preventDefault();
 event.stopImmediatePropagation();
 const target=button.dataset.settingSection||button.dataset.section;
 if(target&&target!=='home'&&location.hash!=='#'+target)location.hash=target;
 loadApplication();
}
document.addEventListener('click',interceptNavigation,true);
byId('toggleSidebar').onclick=()=>setSidebarHidden(!document.body.classList.contains('sidebar-hidden'));
setSidebarHidden(window.matchMedia('(max-width: 1000px)').matches);
const initial=location.hash.slice(1);
if(initial&&initial!=='home')loadApplication();
window.addEventListener('hashchange',()=>{
 const target=location.hash.slice(1);
 if(!appReady&&target&&target!=='home')loadApplication();
});
})();
