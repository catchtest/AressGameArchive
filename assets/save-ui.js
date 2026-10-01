/**
 * ARESS .PRJ 存檔編輯器 UI 互動控制器
 */
(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const reference = () => typeof D === 'undefined' ? null : D;
  const portrait = c => `<i class="sprite-image" role="img" aria-label="${esc(c.name)}" style="--sprite-image:url(&quot;portraits/FACE_SPRITE.png&quot;);--sprite-size:1600% 1300%;--sprite-position:${c.id % 16 / 15 * 100}% ${Math.floor(c.id / 16) / 12 * 100}%"></i>`;
  const Core = window.AressSaveCore;

  const itemIcon = id => id === 65535 ? '<span class="save-item-empty" aria-hidden="true">—</span>' : `<span class="item-icon item-sprite" aria-hidden="true" style="background-position:${id%16/15*100}% ${Math.floor(id/16)/23*100}%"></span>`;
  function refreshCharacter(c) {
    c.stats.MOV = Core.movement(c.classId, c.classLevels);
    c.stats.REN = Core.weaponRange(c.equipIds[0]);
    c.calcStats = Core.calculateDerivedStats(c.stats, c.equipIds, c.classId, c.classLevels);
  }
  function battleStats(cs) {
    const rows = [['生命力','HP','hp','txtHpTotal',65535,true],['攻擊力','ATK','atk','txtAtkTotal',9999],['魔法力','MTK','mag','txtMagTotal',9999],['防禦力','DEF','def','txtDefTotal',9999],['抗魔力','MDF','ama','txtAmaTotal',9999],['移動','MOV','mov','txtMovTotal',5],['射程','REN','ren','txtRenTotal',5]];
    return '<dl class="battle-stats">'+rows.map(([label,abbr,key,id,max,wide])=>{
      const meter = key === 'mov' || key === 'ren' ? `<span class="stat-pips ${key === 'ren' ? 'stat-pips-range' : ''}" aria-hidden="true">${Array.from({length:5},(_,index)=>`<i class="${index<cs[key]?'filled':''}"></i>`).join('')}</span>` : `<span class="stat-bar ${key==='hp'?'stat-bar-hp':''}" aria-hidden="true"><i style="width:${Math.min(100,cs[key]/max*100)}%"></i></span>`;
      return `<div class="battle-stat ${wide?'battle-stat-wide':''}"><dt>${label}<small class="stat-abbr">${abbr}</small></dt><dd id="${id}">${cs[key].toLocaleString()}</dd>${meter}</div>`;
    }).join('')+'</dl>';
  }
  // 狀態
  let boundHost = null;
  let loadingSave = null;
  const SAVE_PROGRESS_OPTIONS = [{"code":0,"label":"歐克之森林"},{"code":1,"label":"山賊之谷"},{"code":2,"label":"山澗"},{"code":3,"label":"內歐里亞村 · 初訪"},{"code":4,"label":"米內巴之町"},{"code":5,"label":"內歐里亞村 · 再次來訪"},{"code":6,"label":"盜賊之城堡"},{"code":7,"label":"內歐里亞村 · 三度來訪"},{"code":8,"label":"神殿"},{"code":9,"label":"古戰場"},{"code":10,"label":"尼可姆斯村 · 初訪"},{"code":11,"label":"岩場"},{"code":12,"label":"沙丘"},{"code":13,"label":"沙漠街道"},{"code":14,"label":"赤色沙漠"},{"code":15,"label":"卡斯尼爾城"},{"code":16,"label":"尼可姆斯村 · 再次來訪"},{"code":17,"label":"沙漠"},{"code":18,"label":"特魯遜郊外 · 初訪"},{"code":19,"label":"奧西亞村"},{"code":20,"label":"庫爾之森林"},{"code":21,"label":"洛花村"},{"code":22,"label":"新馬爾山"},{"code":23,"label":"特魯遜郊外 · 再次來訪"},{"code":24,"label":"特魯遜城"},{"code":25,"label":"塔吉內烏斯國境 · 初訪"},{"code":26,"label":"尼卡歐港町"},{"code":27,"label":"布洛亞港"},{"code":28,"label":"阿姆斯之館"},{"code":29,"label":"布洛亞島火山口"},{"code":30,"label":"火山洞窟"},{"code":31,"label":"塔吉內烏斯國境 · 再次來訪"},{"code":32,"label":"南端之城堡"},{"code":33,"label":"怒爾河"},{"code":34,"label":"平原"},{"code":35,"label":"達瑞斯村"},{"code":36,"label":"塔吉內烏斯城門"},{"code":37,"label":"塔吉內烏斯城"},{"code":38,"label":"黃金山"},{"code":39,"label":"肯托亞村"},{"code":40,"label":"理可路城堡"},{"code":41,"label":"沼地"},{"code":42,"label":"階理士鎮"},{"code":43,"label":"卡特亞神殿"},{"code":44,"label":"小妖精森林"},{"code":45,"label":"宋爾玄鎮"},{"code":46,"label":"送爾玄堡"},{"code":47,"label":"烏卡那吉爾城 · 初訪"},{"code":48,"label":"頓亞橋 · 初訪"},{"code":49,"label":"烏卡那吉爾城 · 再次來訪"},{"code":50,"label":"山小屋"},{"code":51,"label":"頓亞橋 · 再次來訪"},{"code":52,"label":"背石堡"},{"code":53,"label":"塔兒亞山"},{"code":54,"label":"維斯帕尼亞王國"},{"code":55,"label":"拉納鎮"},{"code":56,"label":"拉切斯塔湖"},{"code":57,"label":"森林入口"},{"code":58,"label":"維斯帕森林 · 初訪"},{"code":59,"label":"維斯帕尼亞"},{"code":60,"label":"尼亞斯地下神殿"},{"code":61,"label":"龍之宅邸"},{"code":62,"label":"傳說之街 · 初訪"},{"code":63,"label":"古代的洞窟"},{"code":64,"label":"傳說之街 · 再次來訪"},{"code":65,"label":"維斯帕森林 · 再次來訪"},{"code":66,"label":"維斯帕尼亞城 · 進入"},{"code":67,"label":"維斯帕尼亞城 · 戰鬥一"},{"code":68,"label":"維斯帕尼亞城 · 戰鬥二"},{"code":69,"label":"維斯帕尼亞城 · 戰鬥三"},{"code":70,"label":"維斯帕尼亞城 · 戰鬥四"},{"code":71,"label":"主線結束"}];
  let currentSave = null;
  let rawBuffer = null;
  let originalTitle = '';
  let currentFilename = 'ARESS1.PRJ';
  let activeTab = 'party'; // 'party' | 'all' | 'nonparty'
  let searchQuery = '';
  let selectedCharId = null;

  // 暫存修改的 patches
  let patches = {
    characters: {}
  };

  /**
   * 初始化存檔編輯器
   */
  async function init() {
    const host = $('savePanel');
    if (!host) return;

    if (!host.dataset.rendered) {
      renderSkeleton(host);
      host.dataset.rendered = 'true';
    }

    if (boundHost !== host) { bindGlobalEvents(); boundHost = host; }
    if (!currentSave) {
      loadingSave ||= loadSampleSave('assets/ARESS1.PRJ', 'ARESS1.PRJ');
      await loadingSave;
      loadingSave = null;
    }
    renderSidebar();
  }

  /**
   * 載入範例存檔
   */
  async function loadSampleSave(url, filename) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('無法讀取 ' + url);
      const arrayBuffer = await res.arrayBuffer();
      loadSaveFromBuffer(arrayBuffer, filename);
    } catch (err) {
      alert('載入存檔失敗：' + err.message);
    }
  }

  /**
   * 從 ArrayBuffer 載入存檔
   */
  function loadSaveFromBuffer(buffer, filename) {
    try {
      const bytes = new Uint8Array(buffer);
      const parsed = Core.parseSave(bytes);
      rawBuffer = bytes;
      currentFilename = filename || 'ARESS1.PRJ';
      patches = { characters: {} };
      currentSave = parsed;
      originalTitle = parsed.title;
      closeDrawer();
      renderSaveData();
    } catch (err) {
      alert('解析存檔失敗：' + err.message);
    }
  }

  /**
   * 渲染整體骨架
   */
  function renderSkeleton(host) {
    host.innerHTML = `
      <div class="save-header-row">
          <div class="save-title-box">
            <h1>存檔編輯器</h1>
            <span id="saveFileBadge" class="save-file-badge">尚未載入存檔</span>
          </div>
          <div class="save-action-group">
            <input type="file" id="saveFileInput" accept=".PRJ,.prj" hidden>
            <button id="btnUploadSave" class="btn-subtle" title="上傳電腦中的 ARESS*.PRJ 檔案">選擇 PRJ 存檔</button>
            <button id="btnLoadSample1" class="btn-subtle" title="載入範例存檔（含全角色、滿級體驗）">載入範例存檔 (滿級)</button>
            <button id="btnLoadSample0" class="btn-subtle" title="載入初始遊戲存檔">載入初始存檔</button>
            <button id="btnDownloadSave" class="btn-gold" title="回存二進位並下載為 ARESS1.PRJ">下載存檔 (.PRJ)</button>
          </div>
        </div>

      <div class="save-top-card">
        <!-- 存檔基本資訊 -->
        <div class="save-meta-grid">
          <div class="meta-field">
            <label>存檔標題（最多 18 位元組）</label>
            <div class="meta-input-group">
              <input type="text" id="inputSaveTitle" maxlength="18" placeholder="輸入存檔標題">
            </div>
          </div>

          <div class="meta-field">
            <label>持有金錢（最多 65,535）</label>
            <div class="meta-input-group save-money-group">
              <input type="number" id="inputSaveMoney" min="0" max="65535" placeholder="0">
              <button id="btnMaxMoney" class="btn-subtle" title="將金錢改為最大值 65535G">全滿</button>
            </div>
          </div>

          <div class="meta-field">
            <label>神殿奉獻次數</label>
            <div class="meta-input-group">
              <input type="number" id="inputSaveDonation" min="0" max="255" placeholder="0">
            </div>
          </div>

          <div class="meta-field meta-progress">
            <label>主線進度</label>
            <div class="meta-input-group">
              <select id="inputSaveProgress">${SAVE_PROGRESS_OPTIONS.map(row => `<option value="${row.code}">${row.code} — ${esc(row.label)}</option>`).join('')}</select>
            </div>

          </div>
        </div>


      </div>

      <!-- 角色篩選與捷徑功能 -->
      <div class="save-roster-toolbar">
        <div class="roster-tabs">
          <button class="roster-tab active" data-tab="party">已加入 (<span id="tabPartyNum">0</span>)</button>
          <button class="roster-tab" data-tab="all">全部角色 (64)</button>
          <button class="roster-tab" data-tab="dead">死亡 (<span id="tabDeadNum">0</span>)</button>
          <button class="roster-tab" data-tab="nonparty">未加入 (<span id="tabNonPartyNum">0</span>)</button>
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
    `;
  }

  /**
   * 綁定全局事件
   */
  function bindGlobalEvents() {
    const fileInput = $('saveFileInput');
    $('btnUploadSave').onclick = () => fileInput.click();

    fileInput.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => loadSaveFromBuffer(ev.target.result, file.name);
      reader.onerror = () => alert('無法讀取存檔。');
      reader.readAsArrayBuffer(file);
      e.target.value = '';
    };

    $('btnLoadSample1').onclick = () => loadSampleSave('assets/ARESS1.PRJ', 'ARESS1.PRJ');
    $('btnLoadSample0').onclick = () => loadSampleSave('assets/ARESS0.PRJ', 'ARESS1.PRJ');

    // Only actual file drags on the save page show the viewport overlay.
    const dropzone = $('saveDropzone');
    let dragDepth = 0;
    const hideDrop = () => { dragDepth = 0; dropzone.hidden = true; };
    const isFileDrag = e => !$('savePanel').hidden && [...(e.dataTransfer?.types || [])].includes('Files');
    document.addEventListener('dragenter', e => { if (isFileDrag(e)) { e.preventDefault(); dragDepth++; dropzone.hidden = false; } });
    document.addEventListener('dragover', e => { if (isFileDrag(e)) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; dropzone.hidden = false; } });
    document.addEventListener('dragleave', e => { if (isFileDrag(e) && (--dragDepth <= 0 || !e.relatedTarget)) hideDrop(); });
    document.addEventListener('drop', async e => {
      if (!isFileDrag(e)) return;
      e.preventDefault(); hideDrop();
      const file = e.dataTransfer.files[0];
      if (file) loadSaveFromBuffer(await file.arrayBuffer(), file.name);
    });
    document.addEventListener('dragend', hideDrop);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { hideDrop(); closeDrawer(); } });
    $('eventList').addEventListener('click', e => {
      if ($('savePanel').hidden) return;
      const increment = e.target.closest('[data-inventory-add]');
      const decrement = e.target.closest('[data-inventory-remove]');
      if (increment) changeInventory(Number(increment.dataset.inventoryAdd),1);
      if (decrement) changeInventory(Number(decrement.dataset.inventoryRemove),-1);
      const remove = e.target.closest('[data-save-remove]');
      const open = e.target.closest('[data-save-character]');
      if (remove) setPartyMembership(Number(remove.dataset.saveRemove), false);
      else if (open) openDrawer(Number(open.dataset.saveCharacter));
    });

    // 標題、金錢、奉獻輸入更新
    $('inputSaveTitle').oninput = $('inputSaveTitle').onchange = e => {
      if (currentSave && e.target.value !== originalTitle) patches.title = e.target.value;
      else delete patches.title;
      if (currentSave) currentSave.title = e.target.value;
    };

    $('inputSaveMoney').oninput = $('inputSaveMoney').onchange = e => {
      const val = e.target.valueAsNumber;
      if (!Number.isFinite(val) && e.type === 'input') return;
      patches.money = Number.isFinite(val) ? Math.max(0, Math.min(65535, Math.trunc(val))) : 0;
      e.target.value = patches.money;
      if (currentSave) currentSave.money = patches.money;
    };

    $('btnMaxMoney').onclick = () => {
      $('inputSaveMoney').value = 65535;
      $('inputSaveMoney').dispatchEvent(new Event('change'));
    };

    $('inputSaveDonation').onchange = e => {
      const val = parseInt(e.target.value, 10) || 0;
      patches.donationCount = Math.max(0, Math.min(255, val));
      if (currentSave) currentSave.donationCount = patches.donationCount;
    };

    $('inputSaveProgress').onchange = e => {
      const val = parseInt(e.target.value, 10);
      patches.mainProgress = Math.max(0, Math.min(65535, isNaN(val) ? 0 : val));
      if (currentSave) currentSave.mainProgress = patches.mainProgress;
    };

    // 回存下載
    $('btnDownloadSave').onclick = () => {
      if (!currentSave || !rawBuffer) {
        alert('請先載入存檔！');
        return;
      }
      // 將各項修改打包進 rawBuffer
      try {
        syncPatchesFromUI();
        const patched = Core.patchSave(rawBuffer, patches);
        Core.downloadSave(patched, currentFilename || 'ARESS1.PRJ');
      } catch (error) { alert('無法下載存檔：' + error.message); }
    };

    // 分頁切換
    document.querySelectorAll('.roster-tab').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.roster-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTab = btn.dataset.tab;
        renderCharGrid();
      };
    });

    // 搜尋
    $('rosterSearch').oninput = e => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderCharGrid();
    };

    // 批次功能：全隊能力 255
    $('btnMaxPartyStats').onclick = () => {
      if (!currentSave) return;
      if (!confirm('確定要將目前隊伍中所有角色的基礎能力提升至上限嗎？')) return;
      currentSave.characters.forEach(c => {
        if (c.inParty) {
          if (!patches.characters[c.id]) patches.characters[c.id] = {};
          if (!patches.characters[c.id].stats) patches.characters[c.id].stats = {};
          const base = Core.baseStats(c.stats, c.equipIds);
          Core.STAT_KEYS.forEach(k => { if (k !== 'MOV' && k !== 'REN') base[k] = Core.STAT_LIMITS[k]; });
          c.stats = Core.equippedStats(base, c.equipIds);
          patches.characters[c.id].stats = {...c.stats};
          refreshCharacter(c);
        }
      });
      renderCharGrid();
      if (selectedCharId != null) renderDrawer(selectedCharId);
    };

    // 批次功能：全隊職業滿級
    $('btnMaxPartyClasses').onclick = () => {
      if (!currentSave) return;
      if (!confirm('確定要將目前隊伍中所有角色的 15 職系全部解鎖並升至 25 級嗎？')) return;
      currentSave.characters.forEach(c => {
        if (c.inParty) {
          if (!patches.characters[c.id]) patches.characters[c.id] = {};
          c.classLevels = new Array(15).fill(25);
          c.currentLevel = 25;
          patches.characters[c.id].classLevels = c.classLevels.slice();
          refreshCharacter(c);
        }
      });
      renderCharGrid();
      if (selectedCharId != null) renderDrawer(selectedCharId);
    };

    // 抽屜遮罩點擊關閉
    $('saveDrawer').onclick = e => {
      if (e.target === $('saveDrawer')) closeDrawer();
    };
  }

  /**
   * 同步 UI 資料至 patches
   */
  function syncPatchesFromUI() {
    if ($('inputSaveTitle')) $('inputSaveTitle').dispatchEvent(new Event('change'));
    if ($('inputSaveMoney')) $('inputSaveMoney').dispatchEvent(new Event('change'));
    if ($('inputSaveDonation')) patches.donationCount = parseInt($('inputSaveDonation').value, 10) || 0;
    if ($('inputSaveProgress')) {
      const pv = parseInt($('inputSaveProgress').value, 10);
      const progress = Math.max(0, Math.min(65535, isNaN(pv) ? 0 : pv));
      const original = currentSave.raw[0x17] | currentSave.raw[0x18] << 8;
      const openLocations = currentSave.raw[0x14] | currentSave.raw[0x15] << 8;
      if (progress !== original || patches.mainProgress !== undefined || (progress <= 71 && openLocations !== Core.unlockedLocations(progress))) patches.mainProgress = progress;
    }

    if (currentSave) {
      // 隊伍名單
      const party = partyCharacters().map(c => c.id);
      const original = currentSave.partyIds.slice(0, currentSave.partySize);
      if (JSON.stringify(party) !== JSON.stringify(original)) patches.partyIds = party;
      else delete patches.partyIds;
    }
  }

  /**
   * 渲染載入後的存檔資料
   */
  function renderSaveData() {
    if (!currentSave) return;

    $('saveFileBadge').textContent = `${currentFilename} (${currentSave.raw.length.toLocaleString()} bytes)`;
    $('inputSaveTitle').value = currentSave.title || '';
    $('inputSaveMoney').value = currentSave.money != null ? currentSave.money : 0;
    $('inputSaveDonation').value = currentSave.donationCount != null ? currentSave.donationCount : 0;
    if ($('inputSaveProgress')) {
      const code = currentSave.mainProgress ?? 0;
      if (!$('inputSaveProgress').querySelector(`option[value="${code}"]`)) {
        $('inputSaveProgress').add(new Option(`${code} — 原存檔進度（不在主線表內）`, code));
      }
      $('inputSaveProgress').value = code;
    }

    currentSave.characters.forEach(sanitizeEquipment);
    updatePartyCountDisplay();
    renderCharGrid();
  }

  /**
   * 更新隊伍數量統計
   */
  function updatePartyCountDisplay() {
    if (!currentSave) return;
    const partyChars = currentSave.characters.filter(c => c.inParty);
    if ($('txtPartyCount')) $('txtPartyCount').textContent = partyChars.length;
    $('tabPartyNum').textContent = partyChars.length;
    $('tabNonPartyNum').textContent = currentSave.characters.filter(c => Core.characterState(c) === 'nonparty').length;
    $('tabDeadNum').textContent = currentSave.characters.filter(c => Core.characterState(c) === 'dead').length;
    renderSidebar();
  }

  function partyCharacters() {
    if (!currentSave) return [];
    const ids = [...new Set([...currentSave.partyIds.slice(0, currentSave.partySize), ...currentSave.characters.map(c => c.id)])];
    return ids.map(id => currentSave.characters[id]).filter(c => c?.inParty);
  }

  function renderSidebar() {
    if (!$('savePanel') || $('savePanel').hidden) return;
    const list = $('eventList');
    list.hidden = false;
    if (!currentSave) { list.innerHTML='<h2 class="save-party-heading">持有物品</h2>'; return; }
    const counts = new Map();
    for (const entry of currentSave.inventory) counts.set(entry.itemId,(counts.get(entry.itemId)||0)+1);
    list.innerHTML = `<h2 class="save-party-heading">持有物品（${currentSave.inventory.length}／${Core.INVENTORY_LIMIT}）</h2>
      <div class="save-inventory-add"><select id="inventoryItem" aria-label="選擇新增物品">${Object.keys(Core.ITEM_RULES).filter(id=>!Core.ITEM_RULES[id][1]).map(id=>`<option value="${id}">${esc(Core.getItemName(Number(id)))}</option>`).join('')}</select>
      <button id="btnAddInventory" ${currentSave.inventory.length>=Core.INVENTORY_LIMIT?'disabled':''}>＋ 新增</button></div>
      <div class="save-inventory-list">${[...counts].map(([id,count])=>`<div class="save-inventory-row">${itemIcon(id)}<span>${esc(Core.getItemName(id))}</span><div class="save-inventory-quantity"><button data-inventory-remove="${id}" aria-label="減少${esc(Core.getItemName(id))}">−</button><b>${count}</b><button data-inventory-add="${id}" ${currentSave.inventory.length>=Core.INVENTORY_LIMIT?'disabled':''} aria-label="增加${esc(Core.getItemName(id))}">＋</button></div></div>`).join('')}</div>`;
    $('btnAddInventory').onclick = () => changeInventory(Number($('inventoryItem').value),1);
  }

  function changeInventory(itemId,delta) {
    const inventory = currentSave.inventory;
    let slot;
    if (delta > 0) {
      if (inventory.length >= Core.INVENTORY_LIMIT || !Core.ITEM_RULES[itemId]) return;
      const used = new Set(inventory.map(entry=>entry.slot));
      slot = Array.from({length:Core.INVENTORY_LIMIT},(_,i)=>i).find(i=>!used.has(i));
      inventory.push({slot,itemId,name:Core.getItemName(itemId)});
    } else {
      const index = inventory.findIndex(entry=>entry.itemId===itemId);
      if (index < 0) return;
      slot = inventory.splice(index,1)[0].slot;
    }
    if (!patches.inventory) patches.inventory = [];
    const existing = patches.inventory.find(entry=>entry.slot===slot);
    const value = delta>0?itemId:65535;
    if (existing) existing.itemId=value; else patches.inventory.push({slot,itemId:value});
    renderSidebar();
  }

  function setCharacterState(id,state) {
    const c = currentSave.characters[id];
    if (id === 0 || !c) return;
    c.statusByte = state === 'dead' ? c.statusByte | 128 : c.statusByte & 127;
    if (!patches.characters[id]) patches.characters[id] = {};
    patches.characters[id].statusByte = c.statusByte;
    setPartyMembership(id,state==='party');
  }

  function setPartyMembership(id, inParty) {
    const character = currentSave?.characters[id];
    if (!character || (id === 0 && !inParty)) return;
    character.inParty = inParty;
    updatePartyCountDisplay();
    renderCharGrid();
    if (selectedCharId != null) renderDrawer(selectedCharId);
  }

  /**
   * 渲染角色卡片清單
   */
  function renderCharGrid() {
    const grid = $('saveCharGrid');
    if (!grid || !currentSave) return;

    let chars = currentSave.characters.slice();

    // 頁籤過濾
    if (activeTab === 'party') {
      chars = chars.filter(c => c.inParty);
    } else if (activeTab === 'nonparty') {
      chars = chars.filter(c => Core.characterState(c) === 'nonparty');
    } else if (activeTab === 'dead') {
      chars = chars.filter(c => Core.characterState(c) === 'dead');
    }

    // 搜尋過濾
    if (searchQuery) {
      chars = chars.filter(c => {
        return c.name.toLowerCase().includes(searchQuery) ||
               c.shortName.toLowerCase().includes(searchQuery) ||
               c.className.toLowerCase().includes(searchQuery);
      });
    }

    if (!chars.length) {
      grid.innerHTML = '<div class="profile-empty" style="grid-column:1/-1;">無符合條件的角色</div>';
      return;
    }

    grid.innerHTML = chars.map(c => {
      const cs = c.calcStats;
      return `
        <article class="save-char-card ${c.inParty ? 'in-party' : ''}" data-char-id="${c.id}" tabindex="0" role="button" aria-label="編輯${esc(c.name)}">
          <div class="card-top">
            <div class="card-portrait-wrap">
              ${portrait(c)}
            </div>
            <div class="card-title-wrap">
              <h3 class="card-char-name">${esc(c.name)}${Core.characterState(c)==='dead'?'<small class="save-dead-label">死亡</small>':''}</h3>
              <div class="card-char-meta">
                <span>Lv.${c.currentLevel}</span>
                <span>${esc(c.className)}</span>

              </div>
            </div>
          </div>

          <div class="card-stat-bars">
            <div class="card-stat-row">
              <span class="card-stat-lbl">生命力</span>
              <span class="card-stat-val">${cs.hp.toLocaleString()}</span>
            </div>
            <div class="card-stat-row">
              <span class="card-stat-lbl">攻擊力</span>
              <span class="card-stat-val">${cs.atk.toLocaleString()}</span>
            </div>
            <div class="card-stat-row">
              <span class="card-stat-lbl">防禦力</span>
              <span class="card-stat-val">${cs.def.toLocaleString()}</span>
            </div>
            <div class="card-stat-row">
              <span class="card-stat-lbl">魔法力</span>
              <span class="card-stat-val">${cs.mag.toLocaleString()}</span>
            </div>
            <div class="card-stat-row">
              <span class="card-stat-lbl">抗魔力</span>
              <span class="card-stat-val">${cs.ama.toLocaleString()}</span>
            </div>
            <div class="card-stat-row">
              <span class="card-stat-lbl">移動力</span>
              <span class="card-stat-val">${cs.mov}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // 綁定卡片點擊
    grid.querySelectorAll('.save-char-card').forEach(card => {
      card.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); } };
      card.onclick = () => {
        const id = Number(card.dataset.charId);
        openDrawer(id);
      };
    });
  }

  /**
   * 開啟角色詳細抽屜
   */
  function openDrawer(charId) {
    selectedCharId = charId;
    renderDrawer(charId);
    $('saveDrawer').hidden = false;
    $('btnCloseDrawer').focus();
  }

  /**
   * 關閉抽屜
   */
  function closeDrawer() {
    selectedCharId = null;
    if ($('saveDrawer')) $('saveDrawer').hidden = true;
    renderCharGrid();
  }

  /**
   * 渲染角色詳細抽屜內容
   */
  function sanitizeEquipment(c) {
    const base = Core.baseStats(c.stats,c.equipIds);
    const equipment = c.equipIds.map((id,slot)=>Core.canEquip(id,c.classId,slot)?id:65535);
    if (equipment.every((id,slot)=>id===c.equipIds[slot])) return;
    c.equipIds=equipment; c.equipNames=equipment.map(Core.getItemName);
    c.stats=Core.equippedStats(base,equipment);
    if (!patches.characters[c.id]) patches.characters[c.id]={};
    Object.assign(patches.characters[c.id],{equipIds:equipment.slice(),stats:{...c.stats}});
    refreshCharacter(c);
  }

  function renderDrawer(charId) {
    const c = currentSave.characters[charId];
    if (!c) return;

    const panel = $('saveDrawerPanel');
    const cs = c.calcStats;

    // 產生職系下拉選單選項
    const classOptions = Core.CLASS_NAMES.map((name, idx) => {
      return `<option value="${idx}" ${c.classId === idx ? 'selected' : ''}>${name}</option>`;
    }).join('');

    // 產生武器、防具等裝備選項
    function buildEquipSelect(slotIdx, currentId, filterCat) {
      let opts = `<option value="65535" ${currentId === 65535 ? 'selected' : ''}>（無裝備）</option>`;
      if (reference() && reference().item_names) {
        reference().item_names.forEach((name, id) => {
          if (Core.canEquip(id,c.classId,slotIdx) && !Core.ITEM_RULES[id]?.[1]) {
            const p = Core.getItemPower(id);
            let detail = '';
            if (p.atk) detail += ` [攻+${p.atk}]`;
            if (p.def) detail += ` [防+${p.def}]`;
            if (p.mag) detail += ` [魔+${p.mag}]`;
            if (p.amag) detail += ` [抗+${p.amag}]`;
            opts += `<option value="${id}" ${currentId === id ? 'selected' : ''}>${esc(name)}${detail}</option>`;
          }
        });
      }
      return `<div class="save-equip-control"><span data-equip-icon="${slotIdx}">${itemIcon(currentId)}</span><select class="equip-select" data-slot="${slotIdx}" aria-label="選擇裝備">${opts}</select></div>`;
    }

    panel.innerHTML = `
      <div class="drawer-header profile-heading character-profile-heading">
        <div class="drawer-char-header">
          <div class="drawer-portrait">${portrait(c)}</div>
          <div class="drawer-char-info">
            <div class="save-name-row"><h2>${esc(c.name)}</h2><select id="selCharacterState" aria-label="角色狀態" ${c.id===0?'disabled':''}>${[['party','已加入'],['dead','死亡'],['nonparty','未加入']].map(([state,label])=>`<option value="${state}" ${Core.characterState(c)===state?'selected':''}>${label}</option>`).join('')}</select></div>
            <dl class="character-identity">
              <div><dt>姓名</dt><dd>${esc(c.fullName || c.name)}</dd></div>
              <div><dt>性別</dt><dd>${c.sex}</dd></div>
              <div><dt>年齡</dt><dd>${c.age}</dd></div>

              <div><dt>種族</dt><dd data-save-race>${esc(c.raceName)}</dd></div>
              <div><dt>職系</dt><dd><select id="selDrawerClass">${classOptions}</select></dd></div>
            </dl>
          </div>
        </div>
        <button id="btnCloseDrawer" class="drawer-close" aria-label="關閉">×</button>
      </div>
      <div id="saveBattleStats">${battleStats(cs)}</div>
      <section class="formula-section-card character-attributes">
        <h3><span>基礎能力</span><button id="btnMaxCharStats" class="btn-subtle">此角色能力全滿</button></h3>
        <div class="stats-edit-grid">
          ${Core.STAT_KEYS.filter(key => !['MOV','REN'].includes(key)).map(key => {
            const value = Core.baseStats(c.stats, c.equipIds)[key];
            return `<div class="stat-edit-box"><label for="saveStat-${key}">${Core.STAT_NAMES[key]}</label><div class="stat-edit-value"><span data-stat-display="${key}">${value}</span><input id="saveStat-${key}" type="number" class="input-stat" data-stat="${key}" aria-label="${Core.STAT_NAMES[key]}" min="0" max="${Core.STAT_LIMITS[key]}" value="${value}"></div></div>`;
          }).join('')}
        </div>
      </section>

      <!-- 裝備槽位設定 -->
      <section class="formula-section-card">
        <h3>裝備槽位設定</h3>
        <div class="equip-slots-grid">
          <div class="equip-slot-item">
            <span class="equip-slot-label">武器</span>
            ${buildEquipSelect(0, c.equipIds[0])}
          </div>
          <div class="equip-slot-item">
            <span class="equip-slot-label">鎧甲</span>
            ${buildEquipSelect(1, c.equipIds[1])}
          </div>
          <div class="equip-slot-item">
            <span class="equip-slot-label">盾／手部</span>
            ${buildEquipSelect(2, c.equipIds[2])}
          </div>
          <div class="equip-slot-item">
            <span class="equip-slot-label">物品 1</span>
            ${buildEquipSelect(3, c.equipIds[3])}
          </div>
          <div class="equip-slot-item">
            <span class="equip-slot-label">物品 2</span>
            ${buildEquipSelect(4, c.equipIds[4])}
          </div>
          <div class="equip-slot-item">
            <span class="equip-slot-label">物品 3</span>
            ${buildEquipSelect(5, c.equipIds[5])}
          </div>
          <div class="equip-slot-item">
            <span class="equip-slot-label">物品 4</span>
            ${buildEquipSelect(6, c.equipIds[6])}
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
          ${Core.CLASS_NAMES.map((name, idx) => {
            const lv = c.classLevels[idx];
            const unlocked = lv !== 0xFF;
            return `
              <div class="class-level-item ${unlocked ? 'unlocked' : ''}">
                <span>${name}</span>
                <div class="class-level-inputs">
                  <label style="font-size:16px;color:var(--muted);">Lv</label>
                  <input type="number" class="input-class-lv" data-class-idx="${idx}" min="0" max="25" value="${unlocked ? lv : ''}" placeholder="未開放">
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    `;

    // 綁定抽屜內各項互動事件
    $('btnCloseDrawer').onclick = closeDrawer;

    // 隊伍切換
    $('selCharacterState').onchange = e => setCharacterState(charId,e.target.value);

    // 職業變更
    $('selDrawerClass').onchange = e => {
      const classId = parseInt(e.target.value, 10);
      c.classId = classId;
      c.className = Core.CLASS_NAMES[classId] || `職系 #${classId}`;
      if (c.classLevels[classId] === 255) c.classLevels[classId] = 0;
      c.currentLevel = c.classLevels[classId];
      sanitizeEquipment(c);
      if (!patches.characters[charId]) patches.characters[charId] = {};
      patches.characters[charId].classId = classId;
      patches.characters[charId].classLevels = c.classLevels.slice();
      refreshCharacter(c);
      renderDrawer(charId);
      renderCharGrid();
    };

    // 屬性調整 -> 即時連動公式
    panel.querySelectorAll('.input-stat').forEach(input => {
      input.oninput = e => {
        const k = e.target.dataset.stat;
        const val = Math.max(0, Math.min(Core.STAT_LIMITS[k], parseInt(e.target.value, 10) || 0));
        const base = Core.baseStats(c.stats, c.equipIds);
        base[k] = val;
        c.stats = Core.equippedStats(base, c.equipIds);
        e.target.value = val;
        panel.querySelector(`[data-stat-display="${k}"]`).textContent = val;

        if (!patches.characters[charId]) patches.characters[charId] = {};
        if (!patches.characters[charId].stats) patches.characters[charId].stats = {};
        patches.characters[charId].stats = {...c.stats};

        // 重新計算公式
        refreshCharacter(c);
        updateFormulaDisplay(c.calcStats);
        renderCharGrid();
      };
    });

    // 此角色能力全滿
    $('btnMaxCharStats').onclick = () => {
      const base = Core.baseStats(c.stats, c.equipIds);
      Core.STAT_KEYS.forEach(k => { if (k !== 'MOV' && k !== 'REN') base[k] = Core.STAT_LIMITS[k]; });
      c.stats = Core.equippedStats(base, c.equipIds);
      if (!patches.characters[charId]) patches.characters[charId] = {};
      patches.characters[charId].stats = Object.assign({}, c.stats);
      refreshCharacter(c);
      renderDrawer(charId);
    };

    // 裝備切換 -> 即時連動公式
    panel.querySelectorAll('.equip-select').forEach(select => {
      select.onchange = e => {
        const slot = parseInt(e.target.dataset.slot, 10);
        const eqId = parseInt(e.target.value, 10);
        if (!Core.canEquip(eqId,c.classId,slot)) return;
        const base = Core.baseStats(c.stats, c.equipIds);
        c.equipIds[slot] = eqId;
        c.stats = Core.equippedStats(base, c.equipIds);
        c.equipNames[slot] = Core.getItemName(eqId);

        if (!patches.characters[charId]) patches.characters[charId] = {};
        if (!patches.characters[charId].equipIds) patches.characters[charId].equipIds = c.equipIds.slice();
        patches.characters[charId].equipIds[slot] = eqId;
        patches.characters[charId].stats = {...c.stats};

        // 重新計算公式
        refreshCharacter(c);
        updateFormulaDisplay(c.calcStats);
        panel.querySelector(`[data-equip-icon="${slot}"]`).innerHTML = itemIcon(eqId);
        renderCharGrid();
      };
    });

    // 職系等級變更
    panel.querySelectorAll('.input-class-lv').forEach(input => {
      input.onchange = e => {
        const idx = parseInt(e.target.dataset.classIdx, 10);
        const text = e.target.value.trim();
        const lv = text === '' ? 0xFF : Math.max(0, Math.min(25, parseInt(text, 10) || 0));
        c.classLevels[idx] = lv;
        if (c.classId === idx && lv !== 0xFF) c.currentLevel = lv;

        if (!patches.characters[charId]) patches.characters[charId] = {};
        if (!patches.characters[charId].classLevels) patches.characters[charId].classLevels = c.classLevels.slice();
        patches.characters[charId].classLevels[idx] = lv;
        e.target.value = lv === 255 ? '' : lv;
        refreshCharacter(c);
        updateFormulaDisplay(c.calcStats);
        renderCharGrid();
      };
    });

    // 一鍵此角色全職業滿級
    $('btnMaxCharClasses').onclick = () => {
      c.classLevels = new Array(15).fill(25);
      c.currentLevel = 25;
      if (!patches.characters[charId]) patches.characters[charId] = {};
      patches.characters[charId].classLevels = c.classLevels.slice();
      refreshCharacter(c);
      renderDrawer(charId);
      renderCharGrid();
    };
  }

  /**
   * 即時更新公式顯示區塊
   */
  function updateFormulaDisplay(cs) {
    if ($('saveBattleStats')) $('saveBattleStats').innerHTML = battleStats(cs);
  }

  window.AressSaveEditorUI = {
    init,
    renderSidebar,
    render: () => {
      init();
      if (currentSave) renderSaveData();
    },
    loadSampleSave
  };
})();
