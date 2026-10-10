/* eslint-disable @typescript-eslint/no-require-imports -- Executes transpiled CommonJS artwork at export time. */
// Export the existing artwork; no screenshot or external map service needed.
const fs = require('node:fs');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const sharp = require('sharp');

function load(file, imports = {}) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const compiled = { exports: {} };
  new Function('require', 'module', 'exports', source)(
    (name) => imports[name] ?? require(name), compiled, compiled.exports,
  );
  return compiled.exports;
}

async function main() {
  const data = load('src/lib/map-data.ts');
  const { MapArt } = load('src/components/journey/map-art.tsx', { '@/lib/map-data': data });
  const svg = renderToStaticMarkup(React.createElement(MapArt))
    .replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="1000"');
  await sharp(Buffer.from(svg)).webp({ quality: 85 }).toFile('public/map.webp');
  const mobile = svg.replace('<g data-map-road="true"', '<g style="display:none" data-map-road="true"');
  await sharp(Buffer.from(mobile)).webp({ quality: 85 }).toFile('public/map-mobile.webp');
  const route = `<path d="${data.ROUTE_D}" fill="none" stroke="#e52222" stroke-width="3" stroke-dasharray="8 7" opacity=".35"/><path d="M952 -120 L952 274 Q952 300 926 300 L768 300 Q742 300 742 326 L742 340" fill="none" stroke="#e52222" stroke-width="4"/><circle cx="742" cy="340" r="15" fill="#e52222" opacity=".15"/><circle cx="742" cy="340" r="8" fill="white"/><circle cx="742" cy="340" r="5.5" fill="#e52222"/>`;
  const loading = svg.replace('viewBox="0 0 1100 1000"', 'viewBox="420 0 680 1000"').replace('width="1100"', 'width="680"').replace('</svg>', `${route}</svg>`);
  await sharp(Buffer.from(loading)).webp({ quality: 85 }).toFile('public/map-loading.webp');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
