// Node runner for the Claude Design generator: concatenates content.js + generate.js
// (as the design tool's run_script did) and writes site/** into docs/.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dir, '..');
const src = fs.readFileSync(path.join(dir,'content.js'),'utf8') + '\n' + fs.readFileSync(path.join(dir,'generate.js'),'utf8');
const saveFile = async (p, data) => {
  const f = path.join(root, p.replace(/^site\//, 'docs/'));
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, data);
};
const log = (...a) => console.log(...a);
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
await new AsyncFunction('saveFile', 'log', src)(saveFile, log);
