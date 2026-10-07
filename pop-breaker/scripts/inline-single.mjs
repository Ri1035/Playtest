// 构建后处理：将 dist 内联为单文件 index.single.html（用于 Cloudflare Pages 直传部署）
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
let html = readFileSync(join(dist, 'index.html'), 'utf8');

html = html.replace(/<link rel="stylesheet" crossorigin href="\.\/([^"]+)">/g, (_, href) => {
  const css = readFileSync(join(dist, href), 'utf8');
  return `<style>\n${css}\n</style>`;
});

html = html.replace(/<script type="module" crossorigin src="\.\/([^"]+)"><\/script>/g, (_, src) => {
  const js = readFileSync(join(dist, src), 'utf8');
  return `<script type="module">\n${js}\n</script>`;
});

html = html.replace(/href="\/favicon\.svg"/, () => {
  const svg = readFileSync(join(dist, 'favicon.svg'), 'utf8');
  return `href="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"`;
});

writeFileSync(join(dist, 'index.single.html'), html);

// 同时输出部署载荷目录（根文件必须命名为 index.html）
const payload = new URL('../dist-single/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
import { mkdirSync } from 'node:fs';
mkdirSync(payload, { recursive: true });
writeFileSync(join(payload, 'index.html'), html);
console.log(`single-file OK: ${(html.length / 1024).toFixed(1)} kB (dist/index.single.html + dist-single/index.html)`);
