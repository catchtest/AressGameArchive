(function(){"use strict";const n=t=>document.getElementById(t),m=t=>String(t??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]),P=()=>typeof D>"u"?null:D,j=t=>`<i class="sprite-image portrait-sprite" role="img" aria-label="${m(t.name)}" style="--sprite-image:url(&quot;portraits/FACE_SPRITE.webp&quot;);--sprite-size:1600% 1300%;--sprite-position:${t.id%16/15*100}% ${Math.floor(t.id/16)/12*100}%"></i>`,i=window.AressSaveCore,x=t=>t===65535?'<span class="save-item-empty" aria-hidden="true">—</span>':`<span class="item-icon item-sprite" aria-hidden="true" style="background-position:${t%16/15*100}% ${Math.floor(t/16)/23*100}%"></span>`;function k(t){const e=i.getItemPower(t);return i.getItemName(t)+[["atk","攻"],["def","防"],["mag","魔"],["amag","抗"]].map(([a,c])=>e[a]?` [${c}+${e[a]}]`:"").join("")}function y(t){t.stats.MOV=i.movement(t.classId,t.classLevels),t.stats.REN=i.weaponRange(t.equipIds[0]),t.calcStats=i.calculateDerivedStats(t.stats,t.equipIds,t.classId,t.classLevels)}function J(t){return'<dl class="battle-stats">'+[["生命力","HP","hp","txtHpTotal",65535,!0],["攻擊力","ATK","atk","txtAtkTotal",9999],["魔法力","MTK","mag","txtMagTotal",9999],["防禦力","DEF","def","txtDefTotal",9999],["抗魔力","MDF","ama","txtAmaTotal",9999],["移動","MOV","mov","txtMovTotal",5],["射程","REN","ren","txtRenTotal",5]].map(([a,c,p,s,l,r])=>{const u=p==="mov"||p==="ren"?`<span class="stat-pips ${p==="ren"?"stat-pips-range":""}" aria-hidden="true">${Array.from({length:5},(v,b)=>`<i class="${b<t[p]?"filled":""}"></i>`).join("")}</span>`:`<span class="stat-bar ${p==="hp"?"stat-bar-hp":""}" aria-hidden="true"><i style="width:${Math.min(100,t[p]/l*100)}%"></i></span>`;return`<div class="battle-stat ${r?"battle-stat-wide":""}"><dt>${a}<small class="stat-abbr">${c}</small></dt><dd id="${s}">${t[p].toLocaleString()}</dd>${u}</div>`}).join("")+"</dl>"}let B=null,L=null;const Q=[{code:0,label:"歐克之森林"},{code:1,label:"山賊之谷"},{code:2,label:"山澗"},{code:3,label:"內歐里亞村 · 初訪"},{code:4,label:"米內巴之町"},{code:5,label:"內歐里亞村 · 再次來訪"},{code:6,label:"盜賊之城堡"},{code:7,label:"內歐里亞村 · 三度來訪"},{code:8,label:"神殿"},{code:9,label:"古戰場"},{code:10,label:"尼可姆斯村 · 初訪"},{code:11,label:"岩場"},{code:12,label:"沙丘"},{code:13,label:"沙漠街道"},{code:14,label:"赤色沙漠"},{code:15,label:"卡斯尼爾城"},{code:16,label:"尼可姆斯村 · 再次來訪"},{code:17,label:"沙漠"},{code:18,label:"特魯遜郊外 · 初訪"},{code:19,label:"奧西亞村"},{code:20,label:"庫爾之森林"},{code:21,label:"洛花村"},{code:22,label:"新馬爾山"},{code:23,label:"特魯遜郊外 · 再次來訪"},{code:24,label:"特魯遜城"},{code:25,label:"塔吉內烏斯國境 · 初訪"},{code:26,label:"尼卡歐港町"},{code:27,label:"布洛亞港"},{code:28,label:"阿姆斯之館"},{code:29,label:"布洛亞島火山口"},{code:30,label:"火山洞窟"},{code:31,label:"塔吉內烏斯國境 · 再次來訪"},{code:32,label:"南端之城堡"},{code:33,label:"怒爾河"},{code:34,label:"平原"},{code:35,label:"達瑞斯村"},{code:36,label:"塔吉內烏斯城門"},{code:37,label:"塔吉內烏斯城"},{code:38,label:"黃金山"},{code:39,label:"肯托亞村"},{code:40,label:"理可路城堡"},{code:41,label:"沼地"},{code:42,label:"階理士鎮"},{code:43,label:"卡特亞神殿"},{code:44,label:"小妖精森林"},{code:45,label:"宋爾玄鎮"},{code:46,label:"送爾玄堡"},{code:47,label:"烏卡那吉爾城 · 初訪"},{code:48,label:"頓亞橋 · 初訪"},{code:49,label:"烏卡那吉爾城 · 再次來訪"},{code:50,label:"山小屋"},{code:51,label:"頓亞橋 · 再次來訪"},{code:52,label:"背石堡"},{code:53,label:"塔兒亞山"},{code:54,label:"維斯帕尼亞王國"},{code:55,label:"拉納鎮"},{code:56,label:"拉切斯塔湖"},{code:57,label:"森林入口"},{code:58,label:"維斯帕森林 · 初訪"},{code:59,label:"維斯帕尼亞"},{code:60,label:"尼亞斯地下神殿"},{code:61,label:"龍之宅邸"},{code:62,label:"傳說之街 · 初訪"},{code:63,label:"古代的洞窟"},{code:64,label:"傳說之街 · 再次來訪"},{code:65,label:"維斯帕森林 · 再次來訪"},{code:66,label:"維斯帕尼亞城 · 進入"},{code:67,label:"維斯帕尼亞城 · 戰鬥一"},{code:68,label:"維斯帕尼亞城 · 戰鬥二"},{code:69,label:"維斯帕尼亞城 · 戰鬥三"},{code:70,label:"維斯帕尼亞城 · 戰鬥四"},{code:71,label:"主線結束"}];let d=null,R=null,U="",H="ARESS1.PRJ",I=1,w="party",q="",S=null,g="characters",N=!1,o={characters:{}};async function z(){const t=n("savePanel");t&&(t.dataset.rendered||(W(t),t.dataset.rendered="true"),B!==t&&(X(),B=t),d||(L||(L=T("assets/ARESS1.PRJ","ARESS1.PRJ")),await L,L=null),$())}async function T(t,e){try{const a=await fetch(t);if(!a.ok)throw new Error("無法讀取 "+t);const c=await a.arrayBuffer();_(c,e)}catch(a){alert("載入存檔失敗："+a.message)}}function _(t,e){try{const a=new Uint8Array(t),c=i.parseSave(a);R=a,H=e||"ARESS1.PRJ",I=Number(/^ARESS([1-5])\.PRJ$/i.exec(H)?.[1]||1),o={characters:{}},d=c,U=c.title,M(),V()}catch(a){alert("解析存檔失敗："+a.message)}}function W(t){t.innerHTML=`
      <div class="save-header-row section-heading">
          <div class="save-title-box">
            <h1>存檔修改</h1>
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
            <div class="meta-input-group"><select id="inputSaveSlot">${[1,2,3,4,5].map(e=>`<option value="${e}">${e} 號</option>`).join("")}</select></div>
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
              <select id="inputSaveProgress">${Q.map(e=>`<option value="${e.code}">${e.code} — ${m(e.label)}</option>`).join("")}</select>
            </div>

          </div>
        </div>


      </div>

      <div class="save-edit-toolbar">
      <nav class="save-edit-tabs btn-group" aria-label="切換修改項目">
        <button data-save-edit="characters" class="selected" aria-pressed="true" aria-controls="saveCharactersPane">角色</button>
        <button data-save-edit="inventory" aria-pressed="false" aria-controls="saveInventoryPane">物品</button>
      </nav>
      <div id="saveCharacterFilters" class="save-character-toolbar">
        <div class="roster-tabs">
          <button class="roster-tab active" data-tab="party">已加入 (<span id="tabPartyNum">0</span>)</button>
          <button class="roster-tab" data-tab="dead">死亡 (<span id="tabDeadNum">0</span>)</button>
          <button class="roster-tab" data-tab="nonparty">未加入 (<span id="tabNonPartyNum">0</span>)</button>
          <button class="roster-tab" data-tab="all">全部角色 (64)</button>
        </div>
        <input type="search" id="rosterSearch" class="roster-search" placeholder="搜尋角色 / 職系">
      </div>
      <div id="saveInventoryFilters" class="save-inventory-toolbar" hidden>
        <input id="inventorySearch" type="search" placeholder="搜尋物品" aria-label="搜尋物品名稱或說明">
        <select id="inventoryCategory" aria-label="篩選物品分類"><option value="">全部分類</option>${[...new Set(Object.values(i.ITEM_RULES).filter(e=>!e[1]).map(e=>e[4]))].map(e=>`<option>${m(e)}</option>`).join("")}</select>
        <button id="btnResetInventoryFilters">重設篩選</button>
        <button id="btnClearInventory">清除篩選內物品</button>
      </div>
      </div>
      <section id="saveCharactersPane" aria-label="修改角色">
      <!-- 角色篩選與捷徑功能 -->
      <div class="save-roster-toolbar">
        <div class="roster-quick-tools">
          <button id="btnMaxPartyStats" class="btn-subtle" title="將當前隊伍中所有角色的基礎能力提升至上限">全隊伍能力全滿</button>
          <button id="btnMaxPartyClasses" class="btn-subtle" title="將當前隊伍中所有角色開放全職業並升至 25 級">全隊伍職業滿級</button>
        </div>
      </div>

      <!-- 角色卡片網格 -->
      <div id="saveCharGrid" class="save-char-grid"></div>
      </section>

      <section id="saveInventoryPane" aria-label="修改持有物品" hidden>
        <div class="save-inventory-add">
          <select id="inventoryItem" aria-label="選擇新增物品"></select>
          <input id="inventoryAddCount" type="number" min="1" max="720" value="1" aria-label="新增數量">
          <button id="btnAddInventory">＋ 新增</button>
        </div>
        <div id="saveInventoryList" class="save-inventory-list"></div>
      </section>

      <!-- 角色詳細抽屜容器 -->
      <div id="saveDropzone" class="save-drop-overlay" hidden><div><strong>放開以載入存檔</strong><p>將 ARESS*.PRJ 檔案拖曳至畫面任意位置</p></div></div>
      <div id="saveDrawer" class="save-drawer-scrim" hidden>
        <div id="saveDrawerPanel" class="save-drawer-panel" role="dialog" aria-modal="true" aria-label="編輯角色"></div>
      </div>
    `}function X(){const t=n("saveFileInput");n("btnUploadSave").onclick=()=>t.click(),t.onchange=s=>{const l=s.target.files[0];if(!l)return;const r=new FileReader;r.onload=u=>_(u.target.result,l.name),r.onerror=()=>alert("無法讀取存檔。"),r.readAsArrayBuffer(l),s.target.value=""},n("btnLoadSample1").onclick=()=>T("assets/ARESS1.PRJ","ARESS1.PRJ"),n("btnLoadSample0").onclick=()=>T("assets/ARESS0.PRJ","ARESS1.PRJ"),ae(),n("savePanel").querySelectorAll("[data-save-edit]").forEach(s=>{s.onclick=()=>te(s.dataset.saveEdit)});const e=n("saveDropzone");let a=0;const c=()=>{a=0,e.hidden=!0},p=s=>!n("savePanel").hidden&&[...s.dataTransfer?.types||[]].includes("Files");document.addEventListener("dragenter",s=>{p(s)&&(s.preventDefault(),a++,e.hidden=!1)}),document.addEventListener("dragover",s=>{p(s)&&(s.preventDefault(),s.dataTransfer.dropEffect="copy",e.hidden=!1)}),document.addEventListener("dragleave",s=>{p(s)&&(--a<=0||!s.relatedTarget)&&c()}),document.addEventListener("drop",async s=>{if(!p(s))return;s.preventDefault(),c();const l=s.dataTransfer.files[0];l&&_(await l.arrayBuffer(),l.name)}),document.addEventListener("dragend",c),document.addEventListener("keydown",s=>{s.key==="Escape"&&(c(),M())}),n("inputSaveSlot").onchange=s=>{I=[1,2,3,4,5].includes(Number(s.target.value))?Number(s.target.value):1},n("inputSaveTitle").oninput=n("inputSaveTitle").onchange=s=>{s.isComposing||(s.target.value=i.limitTitle(s.target.value),d&&s.target.value!==U?o.title=s.target.value:delete o.title,d&&(d.title=s.target.value))},n("inputSaveTitle").oncompositionend=()=>n("inputSaveTitle").dispatchEvent(new Event("input")),n("inputSaveMoney").oninput=n("inputSaveMoney").onchange=s=>{const l=s.target.valueAsNumber;!Number.isFinite(l)&&s.type==="input"||(o.money=Number.isFinite(l)?Math.max(0,Math.min(65535,Math.trunc(l))):0,s.target.value=o.money,d&&(d.money=o.money))},n("btnMaxMoney").onclick=()=>{n("inputSaveMoney").value=65535,n("inputSaveMoney").dispatchEvent(new Event("change"))},n("inputSaveDonation").oninput=n("inputSaveDonation").onchange=s=>{const l=s.target.valueAsNumber;!Number.isFinite(l)&&s.type==="input"||(o.donationCount=Number.isFinite(l)?Math.max(0,Math.min(99,Math.trunc(l))):0,s.target.value=o.donationCount,d&&(d.donationCount=o.donationCount))},n("inputSaveProgress").onchange=s=>{const l=parseInt(s.target.value,10);o.mainProgress=Math.max(0,Math.min(65535,isNaN(l)?0:l)),d&&(d.mainProgress=o.mainProgress)},n("btnDownloadSave").onclick=()=>{if(!d||!R){alert("請先載入存檔！");return}try{Z();const s=i.patchSave(R,o);i.downloadSave(s,`ARESS${[1,2,3,4,5].includes(I)?I:1}.PRJ`)}catch(s){alert("無法下載存檔："+s.message)}},document.querySelectorAll(".roster-tab").forEach(s=>{s.onclick=()=>{document.querySelectorAll(".roster-tab").forEach(l=>l.classList.remove("active")),s.classList.add("active"),w=s.dataset.tab,h()}}),n("rosterSearch").oninput=s=>{q=s.target.value.trim().toLowerCase(),h()},n("btnMaxPartyStats").onclick=()=>{d&&confirm("確定要將目前隊伍中所有角色的基礎能力提升至上限嗎？")&&(d.characters.forEach(s=>{if(s.inParty){o.characters[s.id]||(o.characters[s.id]={}),o.characters[s.id].stats||(o.characters[s.id].stats={});const l=i.baseStats(s.stats,s.equipIds);i.STAT_KEYS.forEach(r=>{r!=="MOV"&&r!=="REN"&&(l[r]=i.STAT_LIMITS[r])}),s.stats=i.equippedStats(l,s.equipIds),o.characters[s.id].stats={...s.stats},y(s)}}),h(),S!=null&&E(S))},n("btnMaxPartyClasses").onclick=()=>{d&&confirm("確定要將目前隊伍中所有角色的 15 職系全部解鎖並升至 25 級嗎？")&&(d.characters.forEach(s=>{s.inParty&&(o.characters[s.id]||(o.characters[s.id]={}),s.classLevels=new Array(15).fill(25),s.currentLevel=25,o.characters[s.id].classLevels=s.classLevels.slice(),y(s))}),h(),S!=null&&E(S))},n("saveDrawer").onclick=s=>{s.target===n("saveDrawer")&&M()}}function Z(){if(n("inputSaveTitle")&&n("inputSaveTitle").dispatchEvent(new Event("change")),n("inputSaveMoney")&&n("inputSaveMoney").dispatchEvent(new Event("change")),n("inputSaveDonation")&&n("inputSaveDonation").dispatchEvent(new Event("change")),n("inputSaveProgress")){const t=parseInt(n("inputSaveProgress").value,10),e=Math.max(0,Math.min(65535,isNaN(t)?0:t)),a=d.raw[23]|d.raw[24]<<8,c=d.raw[20]|d.raw[21]<<8;(e!==a||o.mainProgress!==void 0||e<=71&&c!==i.unlockedLocations(e))&&(o.mainProgress=e)}if(d){const t=ee().map(a=>a.id),e=d.partyIds.slice(0,d.partySize);JSON.stringify(t)!==JSON.stringify(e)?o.partyIds=t:delete o.partyIds}}function V(){if(d){if(n("inputSaveSlot").value=I,n("inputSaveTitle").value=i.limitTitle(d.title||""),n("inputSaveMoney").value=d.money!=null?d.money:0,n("inputSaveDonation").value=Math.min(99,d.donationCount||0),n("inputSaveProgress")){const t=d.mainProgress??0;n("inputSaveProgress").querySelector(`option[value="${t}"]`)||n("inputSaveProgress").add(new Option(`${t} — 原存檔進度（不在主線表內）`,t)),n("inputSaveProgress").value=t}d.characters.forEach(K),G(),h()}}function G(){if(!d)return;const t=d.characters.filter(e=>e.inParty);n("tabPartyNum").textContent=t.length,n("tabNonPartyNum").textContent=d.characters.filter(e=>i.characterState(e)==="nonparty").length,n("tabDeadNum").textContent=d.characters.filter(e=>i.characterState(e)==="dead").length,$()}function ee(){return d?[...new Set([...d.partyIds.slice(0,d.partySize),...d.characters.map(e=>e.id)])].map(e=>d.characters[e]).filter(e=>e?.inParty):[]}function te(t){g=t==="inventory"?"inventory":"characters",M(),n("saveCharactersPane").hidden=g!=="characters",n("saveInventoryPane").hidden=g!=="inventory",n("saveCharacterFilters").hidden=g!=="characters",n("saveInventoryFilters").hidden=g!=="inventory",n("savePanel").querySelectorAll("[data-save-edit]").forEach(e=>{const a=e.dataset.saveEdit===g;e.classList.toggle("selected",a),e.setAttribute("aria-pressed",String(a))}),g==="inventory"&&$()}function F(t){const e=i.ITEM_RULES[t],a=n("inventorySearch").value.trim().toLowerCase(),c=n("inventoryCategory").value;return(!a||(i.getItemName(t)+" "+(e?.[3]||"")).toLowerCase().includes(a))&&(!c||e?.[4]===c)}function C(){const t=new Map;for(const e of d.inventory)t.set(e.itemId,(t.get(e.itemId)||0)+1);return t}function $(t=!1){if(!(!d||g!=="inventory"||!n("saveInventoryList")||N)){N=!0;try{const e=C(),a=[...e].filter(([r])=>F(r)).sort((r,u)=>r[0]-u[0]),c=i.INVENTORY_LIMIT-d.inventory.length,p=n("inventoryItem"),s=p.value,l=Object.keys(i.ITEM_RULES).map(Number).filter(r=>!i.ITEM_RULES[r][1]&&F(r));if(p.innerHTML=l.map(r=>`<option value="${r}">${m(k(r))}</option>`).join(""),s!==""&&l.includes(Number(s))&&(p.value=s),p.disabled=!l.length,n("inventoryAddCount").max=Math.max(1,c),n("inventoryAddCount").value=Math.max(1,Math.min(Math.max(1,c),Number(n("inventoryAddCount").value)||1)),n("btnAddInventory").disabled=!c||!l.length,n("btnClearInventory").disabled=!a.some(([r])=>i.canRemoveInventoryItem(r)),t===!0){n("saveInventoryList").querySelectorAll("[data-inventory-quantity]").forEach(r=>{const u=Number(r.dataset.inventoryQuantity),v=e.get(u);r.value=v,r.min=i.canRemoveInventoryItem(u)?0:v,r.max=v+c});return}n("saveInventoryList").innerHTML=a.length?a.map(([r,u])=>{const v=i.ITEM_RULES[r],b=i.canRemoveInventoryItem(r),f=v?.[4]||"未確認物品",ie=v?v[2]?`${v[2].toLocaleString()} G`:"非賣品":"未確認";return`<article class="save-inventory-card" data-inventory-id="${r}">
        <button class="save-inventory-remove" data-inventory-clear="${r}" aria-label="移除${m(i.getItemName(r))}" title="移除${m(i.getItemName(r))}" ${b?"":"disabled"}>×</button>
        <div class="save-inventory-card-heading">${v?x(r):'<span class="save-item-empty">—</span>'}<h3>${v&&!v[1]?`<button class="save-inventory-name" data-jump-item="${r}">${m(i.getItemName(r))}</button>`:m(i.getItemName(r))}</h3></div>
        <div class="save-inventory-card-meta"><div class="save-inventory-labels"><span>${m(f)}</span><span>${ie}</span></div>
          <input type="number" data-inventory-quantity="${r}" aria-label="${m(i.getItemName(r))}數量" min="${b?0:u}" max="${u+c}" value="${u}"></div>
      </article>`}).join(""):'<p class="empty-results">沒有符合篩選的持有物品，可在上方選擇物品新增。</p>'}finally{N=!1}}}function Y(t,e){o.inventory||(o.inventory=[]);const a=o.inventory.find(c=>c.slot===t);a?a.itemId=e:o.inventory.push({slot:t,itemId:e})}function A(t,e,a=!0){if(!d)return;const c=d.inventory,p=c.filter(v=>v.itemId===t).length,s=!!i.ITEM_RULES[t]&&!i.ITEM_RULES[t][1],l=i.canRemoveInventoryItem(t)?0:p,r=s?p+i.INVENTORY_LIMIT-c.length:p,u=Math.max(l,Math.min(r,Math.trunc(Number(e)||0)));if(u>p){const v=new Set(c.map(f=>f.slot));let b=u-p;for(let f=0;b&&f<i.INVENTORY_LIMIT;f++)v.has(f)||(c.push({slot:f,itemId:t,name:i.getItemName(t)}),Y(f,t),b--)}else if(u<p){let v=p-u;for(let b=c.length-1;v&&b>=0;b--)c[b].itemId===t&&(Y(c[b].slot,65535),c.splice(b,1),v--)}a&&$()}function ae(){for(const t of["inventorySearch","inventoryCategory"])n(t).addEventListener(t==="inventorySearch"?"input":"change",$);n("btnResetInventoryFilters").onclick=()=>{n("inventorySearch").value="",n("inventoryCategory").value="",$()},n("btnAddInventory").onclick=()=>{const t=Number(n("inventoryItem").value);if(n("btnAddInventory").disabled||!d)return;const e=C().get(t)||0,a=Math.max(1,Math.trunc(Number(n("inventoryAddCount").value)||1));A(t,e+a)},n("saveInventoryList").onclick=t=>{const e=t.target.closest("button");if(!e||e.disabled)return;const a=e.closest("[data-inventory-id]"),c=Number(a.dataset.inventoryId);e.hasAttribute("data-inventory-clear")&&A(c,0)},n("saveInventoryList").onchange=t=>{if(N)return;const e=t.target.closest("[data-inventory-quantity]");if(!e)return;const a=Number(e.dataset.inventoryQuantity);A(a,e.value,!1),$((C().get(a)||0)>0)},n("btnClearInventory").onclick=()=>{if(!d)return;const t=[...C()].filter(([a])=>F(a)&&i.canRemoveInventoryItem(a)),e=t.reduce((a,[,c])=>a+c,0);if(!(!e||!confirm(`清除目前篩選內的 ${e} 件物品？`))){for(const[a]of t)A(a,0,!1);$()}}}function se(t,e){const a=d.characters[t];t===0||!a||(a.statusByte=e==="dead"?a.statusByte|128:a.statusByte&127,o.characters[t]||(o.characters[t]={}),o.characters[t].statusByte=a.statusByte,ne(t,e==="party"))}function ne(t,e){const a=d?.characters[t];!a||t===0&&!e||(a.inParty=e,G(),h(),S!=null&&E(S))}function h(){const t=n("saveCharGrid");if(!t||!d)return;let e=d.characters.slice();if(w==="party"?e=e.filter(a=>a.inParty):w==="nonparty"?e=e.filter(a=>i.characterState(a)==="nonparty"):w==="dead"&&(e=e.filter(a=>i.characterState(a)==="dead")),q&&(e=e.filter(a=>a.name.toLowerCase().includes(q)||a.shortName.toLowerCase().includes(q)||a.className.toLowerCase().includes(q))),!e.length){t.innerHTML='<div class="profile-empty" style="grid-column:1/-1;">無符合條件的角色</div>';return}t.innerHTML=e.map(a=>{const c=a.calcStats;return`
        <article class="save-char-card ${a.inParty?"in-party":""}" data-char-id="${a.id}" tabindex="0" role="button" aria-label="編輯${m(a.name)}">
          <div class="card-top">
            <div class="card-portrait-wrap">
              ${j(a)}
            </div>
            <div class="card-title-wrap">
              <h3 class="card-char-name">${m(a.name)}${i.characterState(a)==="dead"?'<small class="save-dead-label">死亡</small>':""}</h3>
              <div class="card-char-meta">
                <span>Lv.${a.currentLevel}</span>
                <span>${m(a.className)}</span>

              </div>
            </div>
          </div>

          <div class="card-stat-bars">
            <div class="card-stat-row">
              <span class="card-stat-lbl">生命力</span>
              <span class="card-stat-val">${c.hp.toLocaleString()}</span>
            </div>
            <div class="card-stat-row">
              <span class="card-stat-lbl">攻擊力</span>
              <span class="card-stat-val">${c.atk.toLocaleString()}</span>
            </div>
            <div class="card-stat-row">
              <span class="card-stat-lbl">防禦力</span>
              <span class="card-stat-val">${c.def.toLocaleString()}</span>
            </div>
            <div class="card-stat-row">
              <span class="card-stat-lbl">魔法力</span>
              <span class="card-stat-val">${c.mag.toLocaleString()}</span>
            </div>
            <div class="card-stat-row">
              <span class="card-stat-lbl">抗魔力</span>
              <span class="card-stat-val">${c.ama.toLocaleString()}</span>
            </div>
            <div class="card-stat-row">
              <span class="card-stat-lbl">移動力</span>
              <span class="card-stat-val">${c.mov}</span>
            </div>
          </div>
        </article>
      `}).join(""),t.querySelectorAll(".save-char-card").forEach(a=>{a.onkeydown=c=>{(c.key==="Enter"||c.key===" ")&&(c.preventDefault(),a.click())},a.onclick=()=>{const c=Number(a.dataset.charId);re(c)}})}function re(t){S=t,E(t),n("saveDrawer").hidden=!1,n("btnCloseDrawer").focus()}function M(){S=null,n("saveDrawer")&&(n("saveDrawer").hidden=!0),h()}function K(t){const e=i.baseStats(t.stats,t.equipIds),a=t.equipIds.map((c,p)=>i.canEquip(c,t.classId,p)?c:65535);a.every((c,p)=>c===t.equipIds[p])||(t.equipIds=a,t.equipNames=a.map(i.getItemName),t.stats=i.equippedStats(e,a),o.characters[t.id]||(o.characters[t.id]={}),Object.assign(o.characters[t.id],{equipIds:a.slice(),stats:{...t.stats}}),y(t))}function E(t){const e=d.characters[t];if(!e)return;const a=n("saveDrawerPanel"),c=e.calcStats,p=i.CLASS_NAMES.map((l,r)=>`<option value="${r}" ${e.classId===r?"selected":""}>${l}</option>`).join("");function s(l,r,u){let v=`<option value="65535" ${r===65535?"selected":""}>（無裝備）</option>`;return P()&&P().item_names&&P().item_names.forEach((b,f)=>{i.canEquip(f,e.classId,l)&&!i.ITEM_RULES[f]?.[1]&&(v+=`<option value="${f}" ${r===f?"selected":""}>${m(k(f))}</option>`)}),`<div class="save-equip-control"><span data-equip-icon="${l}">${x(r)}</span><select class="equip-select" data-slot="${l}" aria-label="選擇裝備">${v}</select></div>`}a.innerHTML=`
      <div class="drawer-header profile-heading character-profile-heading">
        <div class="drawer-char-header">
          <div class="drawer-portrait">${j(e)}</div>
          <div class="drawer-char-info">
            <div class="save-name-row"><h2>${m(e.name)}</h2><select id="selCharacterState" aria-label="角色狀態" ${e.id===0?"disabled":""}>${[["party","已加入"],["dead","死亡"],["nonparty","未加入"]].map(([l,r])=>`<option value="${l}" ${i.characterState(e)===l?"selected":""}>${r}</option>`).join("")}</select></div>
            <dl class="character-identity">
              <div><dt>姓名</dt><dd>${m(e.fullName||e.name)}</dd></div>
              <div><dt>性別</dt><dd>${e.sex}</dd></div>
              <div><dt>年齡</dt><dd>${e.age}</dd></div>

              <div><dt>種族</dt><dd data-save-race>${m(e.raceName)}</dd></div>
              <div><dt>職系</dt><dd><select id="selDrawerClass">${p}</select></dd></div>
            </dl>
          </div>
        </div>
        <button id="btnCloseDrawer" class="drawer-close" aria-label="關閉">×</button>
      </div>
      <div id="saveBattleStats">${J(c)}</div>
      <section class="formula-section-card character-attributes">
        <h3><span>基礎能力</span><button id="btnMaxCharStats" class="btn-subtle">能力全滿</button></h3>
        <div class="stats-edit-grid">
          ${i.STAT_KEYS.filter(l=>!["MOV","REN"].includes(l)).map(l=>{const r=i.baseStats(e.stats,e.equipIds)[l];return`<div class="stat-edit-box"><label for="saveStat-${l}">${i.STAT_NAMES[l]}</label><div class="stat-edit-value"><span data-stat-display="${l}">${r}</span><input id="saveStat-${l}" type="number" class="input-stat" data-stat="${l}" aria-label="${i.STAT_NAMES[l]}" min="0" max="${i.STAT_LIMITS[l]}" value="${r}"></div></div>`}).join("")}
        </div>
      </section>

      <!-- 裝備槽位設定 -->
      <section class="formula-section-card">
        <h3><span>裝備槽位設定</span><button id="btnStrongestEquipment" class="btn-subtle">最強裝備</button></h3>
        <div class="equip-slots-grid">
          <div class="equip-slot-item">
            <span class="equip-slot-label">武器</span>
            ${s(0,e.equipIds[0])}
          </div>
          <div class="equip-slot-item">
            <span class="equip-slot-label">鎧甲</span>
            ${s(1,e.equipIds[1])}
          </div>
          <div class="equip-slot-item">
            <span class="equip-slot-label">盾／手部</span>
            ${s(2,e.equipIds[2])}
          </div>
          <div class="equip-slot-item">
            <span class="equip-slot-label">物品 1</span>
            ${s(3,e.equipIds[3])}
          </div>
          <div class="equip-slot-item">
            <span class="equip-slot-label">物品 2</span>
            ${s(4,e.equipIds[4])}
          </div>
          <div class="equip-slot-item">
            <span class="equip-slot-label">物品 3</span>
            ${s(5,e.equipIds[5])}
          </div>
          <div class="equip-slot-item">
            <span class="equip-slot-label">物品 4</span>
            ${s(6,e.equipIds[6])}
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
          ${i.CLASS_NAMES.map((l,r)=>{const u=e.classLevels[r],v=u!==255;return`
              <div class="class-level-item ${v?"unlocked":""}">
                <span>${l}</span>
                <div class="class-level-inputs">
                  <label style="font-size:16px;color:var(--muted);">Lv</label>
                  <input type="number" class="input-class-lv" data-class-idx="${r}" min="0" max="25" value="${v?u:""}" placeholder="未開放">
                </div>
              </div>
            `}).join("")}
        </div>
      </section>
    `,n("btnCloseDrawer").onclick=M,n("btnStrongestEquipment").onclick=()=>{var r;const l=i.baseStats(e.stats,e.equipIds);for(let u=0;u<3;u++){const b=[...a.querySelector(`.equip-select[data-slot="${u}"]`).options].find(f=>f.value!=="65535");e.equipIds[u]=b?Number(b.value):65535}e.equipNames=e.equipIds.map(i.getItemName),e.stats=i.equippedStats(l,e.equipIds),(r=o.characters)[t]||(r[t]={}),Object.assign(o.characters[t],{equipIds:e.equipIds.slice(),stats:{...e.stats}}),y(e),h(),E(t)},n("selCharacterState").onchange=l=>se(t,l.target.value),n("selDrawerClass").onchange=l=>{const r=parseInt(l.target.value,10);e.classId=r,e.className=i.CLASS_NAMES[r]||`職系 #${r}`,e.classLevels[r]===255&&(e.classLevels[r]=0),e.currentLevel=e.classLevels[r],K(e),o.characters[t]||(o.characters[t]={}),o.characters[t].classId=r,o.characters[t].classLevels=e.classLevels.slice(),y(e),E(t),h()},a.querySelectorAll(".input-stat").forEach(l=>{l.oninput=r=>{const u=r.target.dataset.stat,v=Math.max(0,Math.min(i.STAT_LIMITS[u],parseInt(r.target.value,10)||0)),b=i.baseStats(e.stats,e.equipIds);b[u]=v,e.stats=i.equippedStats(b,e.equipIds),r.target.value=v,a.querySelector(`[data-stat-display="${u}"]`).textContent=v,o.characters[t]||(o.characters[t]={}),o.characters[t].stats||(o.characters[t].stats={}),o.characters[t].stats={...e.stats},y(e),O(e.calcStats),h()}}),n("btnMaxCharStats").onclick=()=>{const l=i.baseStats(e.stats,e.equipIds);i.STAT_KEYS.forEach(r=>{r!=="MOV"&&r!=="REN"&&(l[r]=i.STAT_LIMITS[r])}),e.stats=i.equippedStats(l,e.equipIds),o.characters[t]||(o.characters[t]={}),o.characters[t].stats=Object.assign({},e.stats),y(e),E(t)},a.querySelectorAll(".equip-select").forEach(l=>{l.onchange=r=>{const u=parseInt(r.target.dataset.slot,10),v=parseInt(r.target.value,10);if(!i.canEquip(v,e.classId,u))return;const b=i.baseStats(e.stats,e.equipIds);e.equipIds[u]=v,e.stats=i.equippedStats(b,e.equipIds),e.equipNames[u]=i.getItemName(v),o.characters[t]||(o.characters[t]={}),o.characters[t].equipIds||(o.characters[t].equipIds=e.equipIds.slice()),o.characters[t].equipIds[u]=v,o.characters[t].stats={...e.stats},y(e),O(e.calcStats),a.querySelector(`[data-equip-icon="${u}"]`).innerHTML=x(v),h()}}),a.querySelectorAll(".input-class-lv").forEach(l=>{l.onchange=r=>{const u=parseInt(r.target.dataset.classIdx,10),v=r.target.value.trim(),b=v===""?255:Math.max(0,Math.min(25,parseInt(v,10)||0));e.classLevels[u]=b,e.classId===u&&b!==255&&(e.currentLevel=b),o.characters[t]||(o.characters[t]={}),o.characters[t].classLevels||(o.characters[t].classLevels=e.classLevels.slice()),o.characters[t].classLevels[u]=b,r.target.value=b===255?"":b,y(e),O(e.calcStats),h()}}),n("btnMaxCharClasses").onclick=()=>{e.classLevels=new Array(15).fill(25),e.currentLevel=25,o.characters[t]||(o.characters[t]={}),o.characters[t].classLevels=e.classLevels.slice(),y(e),E(t),h()}}function O(t){n("saveBattleStats")&&(n("saveBattleStats").innerHTML=J(t))}window.AressSaveEditorUI={init:z,render:()=>{z(),d&&V()},loadSampleSave:T}})();
