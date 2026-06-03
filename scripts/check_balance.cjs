const fs = require('fs');
const path = 'src/App.jsx';
const s = fs.readFileSync(path, 'utf8');
let stack = [];
let inStr = null;
for (let i = 0; i < s.length; i++) {
  const ch = s[i];
  if (inStr) {
    if (ch === '\\') { i++; continue; }
    if (ch === inStr) inStr = null;
    continue;
  }
  if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
  if (ch === '(' || ch === '{' || ch === '[') stack.push({ ch, i });
  else if (ch === ')' || ch === '}' || ch === ']') {
    if (stack.length === 0) { console.log('Unmatched closing', ch, 'at', i); process.exit(1); }
    const top = stack[stack.length - 1];
    if ((top.ch === '(' && ch === ')') || (top.ch === '{' && ch === '}') || (top.ch === '[' && ch === ']')) stack.pop();
    else { console.log('Mismatched', top, ch, 'at', i); process.exit(1); }
  }
}
if (stack.length) {
  console.log('Unmatched openings (last 10):');
  stack.slice(-10).forEach(it => console.log(it));
  process.exit(1);
}
console.log('All balanced');
