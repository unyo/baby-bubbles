// Copies ../index.html into a JS module so the Expo app can load it into a
// WebView without a server. Runs automatically before `npm start`.
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', '..', 'index.html');
const out = path.join(__dirname, '..', 'webapp.generated.js');
const html = fs.readFileSync(src, 'utf8');
fs.writeFileSync(
  out,
  '// Generated from ../index.html by scripts/embed-html.js. Do not edit.\n' +
    'export default ' + JSON.stringify(html) + ';\n'
);
console.log('Embedded index.html -> webapp.generated.js');
