const fs = require('fs');
const s = fs.readFileSync('src/App.jsx','utf8');
let stack = [];
let inStr = null;
const checkpoints = new Set([5000,10000,20000,40000,60000,80000,100000,120000,140000,146000]);
for (let i = 0; i < s.length; i++) {
  const ch = s[i];
  if (inStr) {
    if (ch==='\\') { i++; continue; }
    if (ch===inStr) inStr=null; continue;
  }
  if (ch==='"' || ch==="'" || ch==='`') { inStr=ch; continue; }
  if (ch==='('||ch==='{'||ch==='[') stack.push({ch,i});
  else if (ch===')'||ch==='}'||ch===']'){
    if (stack.length===0) { console.log('Unmatched closing',ch,'at',i); process.exit(1); }
    const top=stack[stack.length-1];
    if((top.ch==='('&&ch===')')||(top.ch==='{')||(top.ch==='{'&&ch==='}')) stack.pop();
    else if((top.ch==='['&&ch===']')) stack.pop();
    else { console.log('Mismatch at',i, 'top', top, 'found', ch); process.exit(1); }
  }
  if (checkpoints.has(i)) console.log('index',i,'stacklen',stack.length);
}
console.log('done, stacklen',stack.length); if (stack.length) console.log(stack.slice(-10));
