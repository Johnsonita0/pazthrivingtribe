const fs = require('fs');
const s = fs.readFileSync('src/App.jsx','utf8');
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
    if (stack.length === 0) { console.log('Unmatched closing', ch, 'at', i); console.log('Context:', s.slice(i-80,i+80)); console.log('Stack is empty'); process.exit(1); }
    const top = stack[stack.length - 1];
    if ((top.ch === '(' && ch === ')') || (top.ch === '{' && ch === '}') || (top.ch === '[' && ch === ']')) stack.pop();
    else { console.log('Mismatched top', top, 'found closing', ch, 'at', i); console.log('Context:', s.slice(i-80,i+80)); console.log('Recent stack:', stack.slice(-10)); process.exit(1); }
  }
}
if (stack.length) {
  console.log('Unmatched openings (last 10):');
  stack.slice(-10).forEach(it => console.log(it, 'context:', s.slice(it.i-40,it.i+40)));
  process.exit(1);
}
console.log('All balanced');
