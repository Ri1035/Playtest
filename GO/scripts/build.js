// Build script: copies the latest animation HTML into dist/ as index.html
// (Cloudflare Pages serves the dist/ directory).
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = path.join(root, 'chaldea-animation.html');
const dist = path.join(root, 'dist');

fs.mkdirSync(dist, { recursive: true });
fs.copyFileSync(src, path.join(dist, 'index.html'));

console.log('[build] dist/index.html <- chaldea-animation.html (%d bytes)', fs.statSync(path.join(dist, 'index.html')).size);
