import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderDemo } from '../src/html.js';
import { buildCss } from '../tokens.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.mkdirSync(path.join(root, 'demo'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'tokens.css'), buildCss());
fs.writeFileSync(path.join(root, 'demo', 'index.html'), renderDemo());
