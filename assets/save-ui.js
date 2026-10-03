(function(){"use strict";const l=e=>document.getElementById(e),m=e=>String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]),P=()=>typeof D>"u"?null:D,F=e=>`<i class="sprite-image portrait-sprite" role="img" aria-label="${m(e.name)}" style="--sprite-image:url(&quot;portraits/FACE_SPRITE.webp&quot;);--sprite-size:1600% 1300%;--sprite-position:${e.id%16/15*100}% ${Math.floor(e.id/16)/12*100}%"></i>`,o=window.AressSaveCore,x=e=>e===65535?'<span class="save-item-empty" aria-hidden="true">—</span>':`<span class="item-icon item-sprite" aria-hidden="true" style="background-position:${e%16/15*100}% ${Math.floor(e/16)/23*100}%"></span>`;function h(e){e.stats.MOV=o.movement(e.classId,e.classLevels),e.stats.REN=o.weaponRange(e.equipIds[0]),e.calcStats=o.calculateDerivedStats(e.stats,e.equipIds,e.classId,e.classLevels)}function O(e){return'<dl class="battle-stats">'+[["生命力","HP","hp","txtHpTotal",65535,!0],["攻擊力","ATK","atk","txtAtkTotal",9999],["魔法力","MTK","mag","txtMagTotal",9999],["防禦力","DEF","def","txtDefTotal",9999],["抗魔力","MDF","ama","txtAmaTotal",9999],["移動","MOV","mov","txtMovTotal",5],["射程","REN","ren","txtRenTotal",5]].map(([s,d,v,a,n,r])=>{const u=v==="mov"||v==="ren"?`<span class="stat-pips ${v==="ren"?"stat-pips-range":""}" aria-hidden="true">${Array.from({length:5},(p,b)=>`<i class="${b<e[v]?"filled":""}"></i>`).join("")}</span>`:`<span class="stat-bar ${v==="hp"?"stat-bar-hp":""}" aria-hidden="true"><i style="width:${Math.min(100,e[v]/n*100)}%"></i></span>`;return`<div class="battle-stat ${r?"battle-stat-wide":""}"><dt>${s}<small class="stat-abbr">${d}</small></dt><dd id="${a}">${e[v].toLocaleString()}</dd>${u}</div>`}).join("")+"</dl>"}let k=null,w=null;const G=[{code:0,label:"歐克之森林"},{code:1,label:"山賊之谷"},{code:2,label:"山澗"},{code:3,label:"內歐里亞村 · 初訪"},{code:4,label:"米內巴之町"},{code:5,label:"內歐里亞村 · 再次來訪"},{code:6,label:"盜賊之城堡"},{code:7,label:"內歐里亞村 · 三度來訪"},{code:8,label:"神殿"},{code:9,label:"古戰場"},{code:10,label:"尼可姆斯村 · 初訪"},{code:11,label:"岩場"},{code:12,label:"沙丘"},{code:13,label:"沙漠街道"},{code:14,label:"赤色沙漠"},{code:15,label:"卡斯尼爾城"},{code:16,label:"尼可姆斯村 · 再次來訪"},{code:17,label:"沙漠"},{code:18,label:"特魯遜郊外 · 初訪"},{code:19,label:"奧西亞村"},{code:20,label:"庫爾之森林"},{code:21,label:"洛花村"},{code:22,label:"新馬爾山"},{code:23,label:"特魯遜郊外 · 再次來訪"},{code:24,label:"特魯遜城"},{code:25,label:"塔吉內烏斯國境 · 初訪"},{code:26,label:"尼卡歐港町"},{code:27,label:"布洛亞港"},{code:28,label:"阿姆斯之館"},{code:29,label:"布洛亞島火山口"},{code:30,label:"火山洞窟"},{code:31,label:"塔吉內烏斯國境 · 再次來訪"},{code:32,label:"南端之城堡"},{code:33,label:"怒爾河"},{code:34,label:"平原"},{code:35,label:"達瑞斯村"},{code:36,label:"塔吉內烏斯城門"},{code:37,label:"塔吉內烏斯城"},{code:38,label:"黃金山"},{code:39,label:"肯托亞村"},{code:40,label:"理可路城堡"},{code:41,label:"沼地"},{code:42,label:"階理士鎮"},{code:43,label:"卡特亞神殿"},{code:44,label:"小妖精森林"},{code:45,label:"宋爾玄鎮"},{code:46,label:"送爾玄堡"},{code:47,label:"烏卡那吉爾城 · 初訪"},{code:48,label:"頓亞橋 · 初訪"},{code:49,label:"烏卡那吉爾城 · 再次來訪"},{code:50,label:"山小屋"},{code:51,label:"頓亞橋 · 再次來訪"},{code:52,label:"背石堡"},{code:53,label:"塔兒亞山"},{code:54,label:"維斯帕尼亞王國"},{code:55,label:"拉納鎮"},{code:56,label:"拉切斯塔湖"},{code:57,label:"森林入口"},{code:58,label:"維斯帕森林 · 初訪"},{code:59,label:"維斯帕尼亞"},{code:60,label:"尼亞斯地下神殿"},{code:61,label:"龍之宅邸"},{code:62,label:"傳說之街 · 初訪"},{code:63,label:"古代的洞窟"},{code:64,label:"傳說之街 · 再次來訪"},{code:65,label:"維斯帕森林 · 再次來訪"},{code:66,label:"維斯帕尼亞城 · 進入"},{code:67,label:"維斯帕尼亞城 · 戰鬥一"},{code:68,label:"維斯帕尼亞城 · 戰鬥二"},{code:69,label:"維斯帕尼亞城 · 戰鬥三"},{code:70,label:"維斯帕尼亞城 · 戰鬥四"},{code:71,label:"主線結束"}];let c=null,A=null,J="",j="ARESS1.PRJ",q=1,M="party",E="",S=null,i={characters:{}};async function B(){const e=l("savePanel");e&&(e.dataset.rendered||(K(e),e.dataset.rendered="true"),k!==e&&(Q(),k=e),c||(w||(w=T("assets/ARESS1.PRJ","ARESS1.PRJ")),await w,w=null),I())}async function T(e,t){try{const s=await fetch(e);if(!s.ok)throw new Error("無法讀取 "+e);const d=await s.arrayBuffer();C(d,t)}catch(s){alert("載入存檔失敗："+s.message)}}function C(e,t){try{const s=new Uint8Array(e),d=o.parseSave(s);A=s,j=t||"ARESS1.PRJ",q=Number(/^ARESS([1-5])\.PRJ$/i.exec(j)?.[1]||1),i={characters:{}},c=d,J=d.title,N(),H()}catch(s){alert("解析存檔失敗："+s.message)}}function K(e){e.innerHTML=`
      <div class="save-header-row section-heading">
          <div class="save-title-box">
            <h1>存檔編輯器</h1>
          </div>
          <div class="save-action-group">
            <input type="file" id="saveFileInput" accept=".PRJ,.prj" hidden>
            <button id="btnUploadSave" class="btn-subtle" title="上傳電腦中的 ARESS*.PRJ 檔案">選擇 PRJ 存檔</button>
            <button id="btnLoadSample1" class="btn-subtle" title="載入範例存檔（含全角色、滿級體驗）">載入範例存檔 (滿級)</button>
            <button id="btnLoadSample0" class="btn-subtle" title="載入初始遊戲存檔">載入初始存檔</button>
            <button id="btnDownloadSave" class="btn-gold" title="依選擇的存檔位置下載">下載存檔 (.PRJ)</button>
          </div>
        </div>

      <div class="save-top-card">
        <!-- 存檔基本資訊 -->
        <div class="save-meta-grid">
          <div class="meta-field">
            <label for="inputSaveSlot">存檔位置</label>
            <div class="meta-input-group"><select id="inputSaveSlot">${[1,2,3,4,5].map(t=>`<option value="${t}">${t} 號</option>`).join("")}</select></div>
          </div>
          <div class="meta-field">
            <label>存檔標題</label>
            <div class="meta-input-group">
              <input type="text" id="inputSaveTitle" maxlength="18" placeholder="輸入存檔標題">
            </div>
          </div>

          <div class="meta-field">
            <div class="save-money-heading"><label>持有金錢</label><button id="btnMaxMoney" class="btn-subtle" title="將金錢改為最大值 65535G">全滿</button></div>
            <div class="meta-input-group"><input type="number" id="inputSaveMoney" min="0" max="65535" placeholder="0"></div>
          </div>

          <div class="meta-field">
            <label>神殿奉獻次數</label>
            <div class="meta-input-group">
              <input type="number" id="inputSaveDonation" min="0" max="99" placeholder="0">
            </div>
          </div>

          <div class="meta-field meta-progress">
            <label>主線進度</label>
            <div class="meta-input-group">
              <select id="inputSaveProgress">${G.map(t=>`<option value="${t.code}">${t.code} — ${m(t.label)}</option>`).join("")}</select>
            </div>

          </div>
        </div>


      </div>

      <!-- 角色篩選與捷徑功能 -->
      <div class="save-roster-toolbar">
        <div class="roster-tabs">
          <button class="roster-tab active" data-tab="party">已加入 (<span id="tabPartyNum">0</span>)</button>
          <button class="roster-tab" data-tab="dead">死亡 (<span id="tabDeadNum">0</span>)</button>
          <button class="roster-tab" data-tab="nonparty">未加入 (<span id="tabNonPartyNum">0</span>)</button>
          <button class="roster-tab" data-tab="all">全部角色 (64)</button>
        </div>
        <div class="roster-quick-tools">
          <button id="btnMaxPartyStats" class="btn-subtle" title="將當前隊伍中所有角色的基礎能力提升至上限">全隊伍能力全滿</button>
          <button id="btnMaxPartyClasses" class="btn-subtle" title="將當前隊伍中所有角色開放全職業並升至 25 級">全隊伍職業滿級</button>
          <input type="search" id="rosterSearch" class="roster-search" placeholder="搜尋角色 / 職系">
        </div>
      </div>

      <!-- 角色卡片網格 -->
      <div id="saveCharGrid" class="save-char-grid"></div>

      <!-- 角色詳細抽屜容器 -->
      <div id="saveDropzone" class="save-drop-overlay" hidden><div><strong>放開以載入存檔</strong><p>將 ARESS*.PRJ 檔案拖曳至畫面任意位置</p></div></div>
      <div id="saveDrawer" class="save-drawer-scrim" hidden>
        <div id="saveDrawerPanel" class="save-drawer-panel" role="dialog" aria-modal="true" aria-label="編輯角色"></div>
      </div>
    `}function Q(){const e=l("saveFileInput");l("btnUploadSave").onclick=()=>e.click(),e.onchange=a=>{const n=a.target.files[0];if(!n)return;const r=new FileReader;r.onload=u=>C(u.target.result,n.name),r.onerror=()=>alert("無法讀取存檔。"),r.readAsArrayBuffer(n),a.target.value=""},l("btnLoadSample1").onclick=()=>T("assets/ARESS1.PRJ","ARESS1.PRJ"),l("btnLoadSample0").onclick=()=>T("assets/ARESS0.PRJ","ARESS1.PRJ");const t=l("saveDropzone");let s=0;const d=()=>{s=0,t.hidden=!0},v=a=>!l("savePanel").hidden&&[...a.dataTransfer?.types||[]].includes("Files");document.addEventListener("dragenter",a=>{v(a)&&(a.preventDefault(),s++,t.hidden=!1)}),document.addEventListener("dragover",a=>{v(a)&&(a.preventDefault(),a.dataTransfer.dropEffect="copy",t.hidden=!1)}),document.addEventListener("dragleave",a=>{v(a)&&(--s<=0||!a.relatedTarget)&&d()}),document.addEventListener("drop",async a=>{if(!v(a))return;a.preventDefault(),d();const n=a.dataTransfer.files[0];n&&C(await n.arrayBuffer(),n.name)}),document.addEventListener("dragend",d),document.addEventListener("keydown",a=>{a.key==="Escape"&&(d(),N())}),l("eventList").addEventListener("click",a=>{if(l("savePanel").hidden)return;const n=a.target.closest("[data-inventory-add]"),r=a.target.closest("[data-inventory-remove]");n&&R(Number(n.dataset.inventoryAdd),1),r&&R(Number(r.dataset.inventoryRemove),-1);const u=a.target.closest("[data-save-remove]"),p=a.target.closest("[data-save-character]");u?z(Number(u.dataset.saveRemove),!1):p&&U(Number(p.dataset.saveCharacter))}),l("inputSaveSlot").onchange=a=>{q=[1,2,3,4,5].includes(Number(a.target.value))?Number(a.target.value):1},l("inputSaveTitle").oninput=l("inputSaveTitle").onchange=a=>{a.isComposing||(a.target.value=o.limitTitle(a.target.value),c&&a.target.value!==J?i.title=a.target.value:delete i.title,c&&(c.title=a.target.value))},l("inputSaveTitle").oncompositionend=()=>l("inputSaveTitle").dispatchEvent(new Event("input")),l("inputSaveMoney").oninput=l("inputSaveMoney").onchange=a=>{const n=a.target.valueAsNumber;!Number.isFinite(n)&&a.type==="input"||(i.money=Number.isFinite(n)?Math.max(0,Math.min(65535,Math.trunc(n))):0,a.target.value=i.money,c&&(c.money=i.money))},l("btnMaxMoney").onclick=()=>{l("inputSaveMoney").value=65535,l("inputSaveMoney").dispatchEvent(new Event("change"))},l("inputSaveDonation").oninput=l("inputSaveDonation").onchange=a=>{const n=a.target.valueAsNumber;!Number.isFinite(n)&&a.type==="input"||(i.donationCount=Number.isFinite(n)?Math.max(0,Math.min(99,Math.trunc(n))):0,a.target.value=i.donationCount,c&&(c.donationCount=i.donationCount))},l("inputSaveProgress").onchange=a=>{const n=parseInt(a.target.value,10);i.mainProgress=Math.max(0,Math.min(65535,isNaN(n)?0:n)),c&&(c.mainProgress=i.mainProgress)},l("btnDownloadSave").onclick=()=>{if(!c||!A){alert("請先載入存檔！");return}try{W();const a=o.patchSave(A,i);o.downloadSave(a,`ARESS${[1,2,3,4,5].includes(q)?q:1}.PRJ`)}catch(a){alert("無法下載存檔："+a.message)}},document.querySelectorAll(".roster-tab").forEach(a=>{a.onclick=()=>{document.querySelectorAll(".roster-tab").forEach(n=>n.classList.remove("active")),a.classList.add("active"),M=a.dataset.tab,f()}}),l("rosterSearch").oninput=a=>{E=a.target.value.trim().toLowerCase(),f()},l("btnMaxPartyStats").onclick=()=>{c&&confirm("確定要將目前隊伍中所有角色的基礎能力提升至上限嗎？")&&(c.characters.forEach(a=>{if(a.inParty){i.characters[a.id]||(i.characters[a.id]={}),i.characters[a.id].stats||(i.characters[a.id].stats={});const n=o.baseStats(a.stats,a.equipIds);o.STAT_KEYS.forEach(r=>{r!=="MOV"&&r!=="REN"&&(n[r]=o.STAT_LIMITS[r])}),a.stats=o.equippedStats(n,a.equipIds),i.characters[a.id].stats={...a.stats},h(a)}}),f(),S!=null&&g(S))},l("btnMaxPartyClasses").onclick=()=>{c&&confirm("確定要將目前隊伍中所有角色的 15 職系全部解鎖並升至 25 級嗎？")&&(c.characters.forEach(a=>{a.inParty&&(i.characters[a.id]||(i.characters[a.id]={}),a.classLevels=new Array(15).fill(25),a.currentLevel=25,i.characters[a.id].classLevels=a.classLevels.slice(),h(a))}),f(),S!=null&&g(S))},l("saveDrawer").onclick=a=>{a.target===l("saveDrawer")&&N()}}function W(){if(l("inputSaveTitle")&&l("inputSaveTitle").dispatchEvent(new Event("change")),l("inputSaveMoney")&&l("inputSaveMoney").dispatchEvent(new Event("change")),l("inputSaveDonation")&&l("inputSaveDonation").dispatchEvent(new Event("change")),l("inputSaveProgress")){const e=parseInt(l("inputSaveProgress").value,10),t=Math.max(0,Math.min(65535,isNaN(e)?0:e)),s=c.raw[23]|c.raw[24]<<8,d=c.raw[20]|c.raw[21]<<8;(t!==s||i.mainProgress!==void 0||t<=71&&d!==o.unlockedLocations(t))&&(i.mainProgress=t)}if(c){const e=X().map(s=>s.id),t=c.partyIds.slice(0,c.partySize);JSON.stringify(e)!==JSON.stringify(t)?i.partyIds=e:delete i.partyIds}}function H(){if(c){if(l("inputSaveSlot").value=q,l("inputSaveTitle").value=o.limitTitle(c.title||""),l("inputSaveMoney").value=c.money!=null?c.money:0,l("inputSaveDonation").value=Math.min(99,c.donationCount||0),l("inputSaveProgress")){const e=c.mainProgress??0;l("inputSaveProgress").querySelector(`option[value="${e}"]`)||l("inputSaveProgress").add(new Option(`${e} — 原存檔進度（不在主線表內）`,e)),l("inputSaveProgress").value=e}c.characters.forEach(Y),V(),f()}}function V(){if(!c)return;const e=c.characters.filter(t=>t.inParty);l("txtPartyCount")&&(l("txtPartyCount").textContent=e.length),l("tabPartyNum").textContent=e.length,l("tabNonPartyNum").textContent=c.characters.filter(t=>o.characterState(t)==="nonparty").length,l("tabDeadNum").textContent=c.characters.filter(t=>o.characterState(t)==="dead").length,I()}function X(){return c?[...new Set([...c.partyIds.slice(0,c.partySize),...c.characters.map(t=>t.id)])].map(t=>c.characters[t]).filter(t=>t?.inParty):[]}function I(){if(!l("savePanel")||l("savePanel").hidden)return;const e=l("eventList");if(e.hidden=!1,!c){e.innerHTML='<h2 class="save-party-heading">持有物品</h2>';return}const t=new Map;for(const s of c.inventory)t.set(s.itemId,(t.get(s.itemId)||0)+1);e.innerHTML=`<h2 class="save-party-heading">持有物品（${c.inventory.length}／${o.INVENTORY_LIMIT}）</h2>
      <div class="save-inventory-add"><select id="inventoryItem" aria-label="選擇新增物品">${Object.keys(o.ITEM_RULES).filter(s=>!o.ITEM_RULES[s][1]).map(s=>`<option value="${s}">${m(o.getItemName(Number(s)))}</option>`).join("")}</select>
      <button id="btnAddInventory" ${c.inventory.length>=o.INVENTORY_LIMIT?"disabled":""}>＋ 新增</button></div>
      <div class="save-inventory-list">${[...t].map(([s,d])=>`<div class="save-inventory-row">${x(s)}<span>${m(o.getItemName(s))}</span><div class="save-inventory-quantity"><button data-inventory-remove="${s}" aria-label="減少${m(o.getItemName(s))}">−</button><b>${d}</b><button data-inventory-add="${s}" ${c.inventory.length>=o.INVENTORY_LIMIT?"disabled":""} aria-label="增加${m(o.getItemName(s))}">＋</button></div></div>`).join("")}</div>`,l("btnAddInventory").onclick=()=>R(Number(l("inventoryItem").value),1)}function R(e,t){const s=c.inventory;let d;if(t>0){if(s.length>=o.INVENTORY_LIMIT||!o.ITEM_RULES[e])return;const n=new Set(s.map(r=>r.slot));d=Array.from({length:o.INVENTORY_LIMIT},(r,u)=>u).find(r=>!n.has(r)),s.push({slot:d,itemId:e,name:o.getItemName(e)})}else{const n=s.findIndex(r=>r.itemId===e);if(n<0)return;d=s.splice(n,1)[0].slot}i.inventory||(i.inventory=[]);const v=i.inventory.find(n=>n.slot===d),a=t>0?e:65535;v?v.itemId=a:i.inventory.push({slot:d,itemId:a}),I()}function Z(e,t){const s=c.characters[e];e===0||!s||(s.statusByte=t==="dead"?s.statusByte|128:s.statusByte&127,i.characters[e]||(i.characters[e]={}),i.characters[e].statusByte=s.statusByte,z(e,t==="party"))}function z(e,t){const s=c?.characters[e];!s||e===0&&!t||(s.inParty=t,V(),f(),S!=null&&g(S))}function f(){const e=l("saveCharGrid");if(!e||!c)return;let t=c.characters.slice();if(M==="party"?t=t.filter(s=>s.inParty):M==="nonparty"?t=t.filter(s=>o.characterState(s)==="nonparty"):M==="dead"&&(t=t.filter(s=>o.characterState(s)==="dead")),E&&(t=t.filter(s=>s.name.toLowerCase().includes(E)||s.shortName.toLowerCase().includes(E)||s.className.toLowerCase().includes(E))),!t.length){e.innerHTML='<div class="profile-empty" style="grid-column:1/-1;">無符合條件的角色</div>';return}e.innerHTML=t.map(s=>{const d=s.calcStats;return`
        <article class="save-char-card ${s.inParty?"in-party":""}" data-char-id="${s.id}" tabindex="0" role="button" aria-label="編輯${m(s.name)}">
          <div class="card-top">
            <div class="card-portrait-wrap">
              ${F(s)}
            </div>
            <div class="card-title-wrap">
              <h3 class="card-char-name">${m(s.name)}${o.characterState(s)==="dead"?'<small class="save-dead-label">死亡</small>':""}</h3>
              <div class="card-char-meta">
                <span>Lv.${s.currentLevel}</span>
                <span>${m(s.className)}</span>

              </div>
            </div>
          </div>

          <div class="card-stat-bars">
            <div class="card-stat-row">
              <span class="card-stat-lbl">生命力</span>
              <span class="card-stat-val">${d.hp.toLocaleString()}</span>
            </div>
            <div class="card-stat-row">
              <span class="card-stat-lbl">攻擊力</span>
              <span class="card-stat-val">${d.atk.toLocaleString()}</span>
            </div>
            <div class="card-stat-row">
              <span class="card-stat-lbl">防禦力</span>
              <span class="card-stat-val">${d.def.toLocaleString()}</span>
            </div>
            <div class="card-stat-row">
              <span class="card-stat-lbl">魔法力</span>
              <span class="card-stat-val">${d.mag.toLocaleString()}</span>
            </div>
            <div class="card-stat-row">
              <span class="card-stat-lbl">抗魔力</span>
              <span class="card-stat-val">${d.ama.toLocaleString()}</span>
            </div>
            <div class="card-stat-row">
              <span class="card-stat-lbl">移動力</span>
              <span class="card-stat-val">${d.mov}</span>
            </div>
          </div>
        </article>
      `}).join(""),e.querySelectorAll(".save-char-card").forEach(s=>{s.onkeydown=d=>{(d.key==="Enter"||d.key===" ")&&(d.preventDefault(),s.click())},s.onclick=()=>{const d=Number(s.dataset.charId);U(d)}})}function U(e){S=e,g(e),l("saveDrawer").hidden=!1,l("btnCloseDrawer").focus()}function N(){S=null,l("saveDrawer")&&(l("saveDrawer").hidden=!0),f()}function Y(e){const t=o.baseStats(e.stats,e.equipIds),s=e.equipIds.map((d,v)=>o.canEquip(d,e.classId,v)?d:65535);s.every((d,v)=>d===e.equipIds[v])||(e.equipIds=s,e.equipNames=s.map(o.getItemName),e.stats=o.equippedStats(t,s),i.characters[e.id]||(i.characters[e.id]={}),Object.assign(i.characters[e.id],{equipIds:s.slice(),stats:{...e.stats}}),h(e))}function g(e){const t=c.characters[e];if(!t)return;const s=l("saveDrawerPanel"),d=t.calcStats,v=o.CLASS_NAMES.map((n,r)=>`<option value="${r}" ${t.classId===r?"selected":""}>${n}</option>`).join("");function a(n,r,u){let p=`<option value="65535" ${r===65535?"selected":""}>（無裝備）</option>`;return P()&&P().item_names&&P().item_names.forEach((b,$)=>{if(o.canEquip($,t.classId,n)&&!o.ITEM_RULES[$]?.[1]){const y=o.getItemPower($);let L="";y.atk&&(L+=` [攻+${y.atk}]`),y.def&&(L+=` [防+${y.def}]`),y.mag&&(L+=` [魔+${y.mag}]`),y.amag&&(L+=` [抗+${y.amag}]`),p+=`<option value="${$}" ${r===$?"selected":""}>${m(b)}${L}</option>`}}),`<div class="save-equip-control"><span data-equip-icon="${n}">${x(r)}</span><select class="equip-select" data-slot="${n}" aria-label="選擇裝備">${p}</select></div>`}s.innerHTML=`
      <div class="drawer-header profile-heading character-profile-heading">
        <div class="drawer-char-header">
          <div class="drawer-portrait">${F(t)}</div>
          <div class="drawer-char-info">
            <div class="save-name-row"><h2>${m(t.name)}</h2><select id="selCharacterState" aria-label="角色狀態" ${t.id===0?"disabled":""}>${[["party","已加入"],["dead","死亡"],["nonparty","未加入"]].map(([n,r])=>`<option value="${n}" ${o.characterState(t)===n?"selected":""}>${r}</option>`).join("")}</select></div>
            <dl class="character-identity">
              <div><dt>姓名</dt><dd>${m(t.fullName||t.name)}</dd></div>
              <div><dt>性別</dt><dd>${t.sex}</dd></div>
              <div><dt>年齡</dt><dd>${t.age}</dd></div>

              <div><dt>種族</dt><dd data-save-race>${m(t.raceName)}</dd></div>
              <div><dt>職系</dt><dd><select id="selDrawerClass">${v}</select></dd></div>
            </dl>
          </div>
        </div>
        <button id="btnCloseDrawer" class="drawer-close" aria-label="關閉">×</button>
      </div>
      <div id="saveBattleStats">${O(d)}</div>
      <section class="formula-section-card character-attributes">
        <h3><span>基礎能力</span><button id="btnMaxCharStats" class="btn-subtle">能力全滿</button></h3>
        <div class="stats-edit-grid">
          ${o.STAT_KEYS.filter(n=>!["MOV","REN"].includes(n)).map(n=>{const r=o.baseStats(t.stats,t.equipIds)[n];return`<div class="stat-edit-box"><label for="saveStat-${n}">${o.STAT_NAMES[n]}</label><div class="stat-edit-value"><span data-stat-display="${n}">${r}</span><input id="saveStat-${n}" type="number" class="input-stat" data-stat="${n}" aria-label="${o.STAT_NAMES[n]}" min="0" max="${o.STAT_LIMITS[n]}" value="${r}"></div></div>`}).join("")}
        </div>
      </section>

      <!-- 裝備槽位設定 -->
      <section class="formula-section-card">
        <h3><span>裝備槽位設定</span><button id="btnStrongestEquipment" class="btn-subtle">最強裝備</button></h3>
        <div class="equip-slots-grid">
          <div class="equip-slot-item">
            <span class="equip-slot-label">武器</span>
            ${a(0,t.equipIds[0])}
          </div>
          <div class="equip-slot-item">
            <span class="equip-slot-label">鎧甲</span>
            ${a(1,t.equipIds[1])}
          </div>
          <div class="equip-slot-item">
            <span class="equip-slot-label">盾／手部</span>
            ${a(2,t.equipIds[2])}
          </div>
          <div class="equip-slot-item">
            <span class="equip-slot-label">物品 1</span>
            ${a(3,t.equipIds[3])}
          </div>
          <div class="equip-slot-item">
            <span class="equip-slot-label">物品 2</span>
            ${a(4,t.equipIds[4])}
          </div>
          <div class="equip-slot-item">
            <span class="equip-slot-label">物品 3</span>
            ${a(5,t.equipIds[5])}
          </div>
          <div class="equip-slot-item">
            <span class="equip-slot-label">物品 4</span>
            ${a(6,t.equipIds[6])}
          </div>
        </div>
      </section>

      <!-- 15 職系等級與經驗 -->
      <section class="formula-section-card">
        <h3>
          <span>職系等級</span>
          <button id="btnMaxCharClasses" class="btn-subtle" style="font-size:16px;padding:3px 8px;">解鎖全職系 25 級</button>
        </h3>
        <div class="class-levels-grid">
          ${o.CLASS_NAMES.map((n,r)=>{const u=t.classLevels[r],p=u!==255;return`
              <div class="class-level-item ${p?"unlocked":""}">
                <span>${n}</span>
                <div class="class-level-inputs">
                  <label style="font-size:16px;color:var(--muted);">Lv</label>
                  <input type="number" class="input-class-lv" data-class-idx="${r}" min="0" max="25" value="${p?u:""}" placeholder="未開放">
                </div>
              </div>
            `}).join("")}
        </div>
      </section>
    `,l("btnCloseDrawer").onclick=N,l("btnStrongestEquipment").onclick=()=>{var r;const n=o.baseStats(t.stats,t.equipIds);for(let u=0;u<3;u++){const b=[...s.querySelector(`.equip-select[data-slot="${u}"]`).options].find($=>$.value!=="65535");t.equipIds[u]=b?Number(b.value):65535}t.equipNames=t.equipIds.map(o.getItemName),t.stats=o.equippedStats(n,t.equipIds),(r=i.characters)[e]||(r[e]={}),Object.assign(i.characters[e],{equipIds:t.equipIds.slice(),stats:{...t.stats}}),h(t),f(),g(e)},l("selCharacterState").onchange=n=>Z(e,n.target.value),l("selDrawerClass").onchange=n=>{const r=parseInt(n.target.value,10);t.classId=r,t.className=o.CLASS_NAMES[r]||`職系 #${r}`,t.classLevels[r]===255&&(t.classLevels[r]=0),t.currentLevel=t.classLevels[r],Y(t),i.characters[e]||(i.characters[e]={}),i.characters[e].classId=r,i.characters[e].classLevels=t.classLevels.slice(),h(t),g(e),f()},s.querySelectorAll(".input-stat").forEach(n=>{n.oninput=r=>{const u=r.target.dataset.stat,p=Math.max(0,Math.min(o.STAT_LIMITS[u],parseInt(r.target.value,10)||0)),b=o.baseStats(t.stats,t.equipIds);b[u]=p,t.stats=o.equippedStats(b,t.equipIds),r.target.value=p,s.querySelector(`[data-stat-display="${u}"]`).textContent=p,i.characters[e]||(i.characters[e]={}),i.characters[e].stats||(i.characters[e].stats={}),i.characters[e].stats={...t.stats},h(t),_(t.calcStats),f()}}),l("btnMaxCharStats").onclick=()=>{const n=o.baseStats(t.stats,t.equipIds);o.STAT_KEYS.forEach(r=>{r!=="MOV"&&r!=="REN"&&(n[r]=o.STAT_LIMITS[r])}),t.stats=o.equippedStats(n,t.equipIds),i.characters[e]||(i.characters[e]={}),i.characters[e].stats=Object.assign({},t.stats),h(t),g(e)},s.querySelectorAll(".equip-select").forEach(n=>{n.onchange=r=>{const u=parseInt(r.target.dataset.slot,10),p=parseInt(r.target.value,10);if(!o.canEquip(p,t.classId,u))return;const b=o.baseStats(t.stats,t.equipIds);t.equipIds[u]=p,t.stats=o.equippedStats(b,t.equipIds),t.equipNames[u]=o.getItemName(p),i.characters[e]||(i.characters[e]={}),i.characters[e].equipIds||(i.characters[e].equipIds=t.equipIds.slice()),i.characters[e].equipIds[u]=p,i.characters[e].stats={...t.stats},h(t),_(t.calcStats),s.querySelector(`[data-equip-icon="${u}"]`).innerHTML=x(p),f()}}),s.querySelectorAll(".input-class-lv").forEach(n=>{n.onchange=r=>{const u=parseInt(r.target.dataset.classIdx,10),p=r.target.value.trim(),b=p===""?255:Math.max(0,Math.min(25,parseInt(p,10)||0));t.classLevels[u]=b,t.classId===u&&b!==255&&(t.currentLevel=b),i.characters[e]||(i.characters[e]={}),i.characters[e].classLevels||(i.characters[e].classLevels=t.classLevels.slice()),i.characters[e].classLevels[u]=b,r.target.value=b===255?"":b,h(t),_(t.calcStats),f()}}),l("btnMaxCharClasses").onclick=()=>{t.classLevels=new Array(15).fill(25),t.currentLevel=25,i.characters[e]||(i.characters[e]={}),i.characters[e].classLevels=t.classLevels.slice(),h(t),g(e),f()}}function _(e){l("saveBattleStats")&&(l("saveBattleStats").innerHTML=O(e))}window.AressSaveEditorUI={init:B,renderSidebar:I,render:()=>{B(),c&&H()},loadSampleSave:T}})();
