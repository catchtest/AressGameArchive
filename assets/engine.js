(function (root) {
  'use strict';
  const initial = () => ({pc:0,scene:null,left:null,right:null,window:false,body:'',speaker:'',color:0,kind:'start',notes:[]});
  function instructionIndex(event,target) {
    let index=event.instructions.findIndex(r=>r.offset===target);
    if(index<0)index=event.instructions.findIndex(r=>r.offset>target);
    if(index<0)throw Error('跳轉落點不在已解析指令邊界');
    return index;
  }
  function expandConditions(data) {
    // The bundle stores each condition string once; restore the reader's in-memory shape.
    const texts=data.condition_texts;
    for(const event of data.events)for(const row of event.instructions){
      if(row.condition_id!==undefined){
        row.entry_condition_text=texts[row.condition_id];
        delete row.condition_id;
      }
      if(row.condition_group_ids){
        row.entry_condition_groups=row.condition_group_ids.map(group=>group.map(id=>texts[id]));
        delete row.condition_group_ids;
      }
    }
  }
  function advance(event, previous, guided=false, target) {
    const s=JSON.parse(JSON.stringify(previous));s.notes=[];s.body='';s.speaker='';delete s.branch;delete s.battle;delete s.choice;delete s.rewards;delete s.characters;delete s.amount;delete s.classUnlocks;delete s.endingFaceIds;delete s.conditionGroups;
    if(target!==undefined)s.pc=instructionIndex(event,target);
    for(let guard=0;guard<event.instructions.length+1;guard++){
      const r=event.instructions[s.pc++];
      if(!r){s.kind='end';s.window=false;return s;}
      if(r.suppress_reader)continue;
      const condition=r.entry_condition_text||'';
      if(condition.includes('戰鬥中死亡'))continue;
      s.offset=r.offset;s.hex=r.hex;s.condition=condition;s.conditionGroups=r.entry_condition_groups||[];s.specialEvent=r.special_event||'';const op=parseInt(r.opcode,16);
      if(r.portrait_reset)[s.left,s.right]=r.portrait_reset;
      if(op===0)s.window=true;
      else if(op===1)s.left=r.portrait;
      else if(op===2)s.right=r.portrait;
      else if(op===3)s.window=false;
      else if(op===4)s.left=null;
      else if(op===5)s.right=null;
      else if(op===6||op===7){const body=r.display_body||r.body||r.text||'';if(!body.trim())continue;if(r.scene)s.scene=r.scene;s.kind='dialogue';s.speaker=op===6?r.speaker||'':'';s.body=body;s.color=op===6?r.args[1]:0;s.textId=r.dialogue_id;s.endingFaceIds=r.ending_face_ids||[];if(!s.window)s.notes.push('此路徑未記錄開窗指令，閱讀器仍以對話框呈現文字；不是遊戲畫面的完整模擬。');return s;}
      else if(op===0x40){
        const rewards=[{id:r.args[0]+256*r.args[1],condition:r.entry_condition_text||'',offset:r.offset}];
        while(s.pc<event.instructions.length){
          const next=event.instructions[s.pc],nextOp=parseInt(next.opcode,16);
          if(nextOp===0x40){s.pc++;rewards.push({id:next.args[0]+256*next.args[1],condition:next.entry_condition_text||'',offset:next.offset});s.offset=next.offset;s.hex=next.hex;continue;}
          if(!guided&&next.branch_target!==undefined){s.pc++;continue;}
          break;
        }
        s.kind='reward';s.rewards=rewards;s.condition='';return s;
      }
      else if(op===0x30||op===0x31){
        const characters=[r.args[0]];
        while(s.pc<event.instructions.length&&[0x30,0x31].includes(parseInt(event.instructions[s.pc].opcode,16))){const next=event.instructions[s.pc++];characters.push(next.args[0]);s.offset=next.offset;s.hex=next.hex;}
        s.kind='party';s.partyAction='join';s.characters=characters;return s;
      }
      else if(op===0x50||op===0x51){
        const characters=[r.args[0]];
        while(s.pc<event.instructions.length&&[0x50,0x51].includes(parseInt(event.instructions[s.pc].opcode,16))){const next=event.instructions[s.pc++];characters.push(next.args[0]);s.offset=next.offset;s.hex=next.hex;}
        s.kind='party';s.partyAction='leave';s.characters=characters;return s;
      }
      else if(op===0x61){s.kind='item-loss';s.rewards=[{id:r.args[0]+256*r.args[1],condition:r.entry_condition_text||'',offset:r.offset}];return s;}
      else if(op===0xd0){s.kind='money';s.amount=r.args[0]+256*r.args[1];return s;}
      else if(op===0xb0){
        if(r.class_unlock_batch){s.kind='class-unlock';s.classUnlocks=r.class_unlock_batch.map(row=>({characterId:row.character_id,classId:row.class_id}));return s;}
        if(r.defer_class_unlock)continue;
        s.kind='class-unlock';s.classUnlocks=[{characterId:r.args[0],classId:r.args[1]}];return s;
      }
      else if(op===0xb1){/* B0 already presented the newly opened class. */}
      else if(op===0x10){s.scene=r.scene;if(event.id>=130){s.kind='scene';return s;}}
      else if(op===0xff){if(guided){s.kind='end';s.window=false;return s;}s.notes.push('事件結束標記；逐段模式仍保留後續靜態內容');}
      else if(op===0x74){s.kind='choice';s.choice={firstTarget:event.instructions[s.pc]?.offset,secondTarget:r.branch_target,options:['答應','拒絕']};return s;}
      else if(op===0x72){
        // The archive's normal reader walks source order so every conditional
        // dialogue variant remains reviewable with its appearance condition.
        // Guided playback follows the game's jump and shows one actual route.
        if(guided)s.pc=instructionIndex(event,r.branch_target);
      }
      else if(op===0x20){s.kind='battle';s.battle={field:r.field};if(guided)s.branch={...r};return s;}
      else if(r.branch_target!==undefined){
        if(guided){s.kind=op===0x20?'battle':'branch';s.branch={...r};return s;}
        s.notes.push(r.description);
      }else if(![8,0x11,0x90,0x91,0x92,0xa0].includes(op))s.notes.push(r.description);
    }
    throw Error('指令步數超過事件長度');
  }
  // Count reader frames, not bytecode instructions. Control instructions and
  // grouped rewards can consume many instructions without adding a screen.
  function frames(event, previous=initial(), guided=false) {
    const result=[];
    let state=previous;
    for(let guard=0;guard<=event.instructions.length;guard++){
      const target=state.kind==='choice'?state.choice.firstTarget:undefined;
      state=advance(event,state,guided,target);
      if(state.kind==='end')return result;
      result.push(state);
      if(state.kind==='branch')return result;
    }
    throw Error('劇情路徑未能結束');
  }
  const api={initial,advance,frames,expandConditions};if(typeof module!=='undefined')module.exports=api;else root.AressReader=api;
})(typeof globalThis!=='undefined'?globalThis:this);
