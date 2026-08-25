// Copy node icons next to their compiled .js files; n8n resolves `file:` icons
// relative to the node file.
const { cpSync, mkdirSync } = require('fs');
const { dirname, join } = require('path');

const copies = [
  ['credentials/gtmapi.svg', 'dist/credentials/gtmapi.svg'],
  ['nodes/GtmApi/gtmapi.svg', 'dist/nodes/GtmApi/gtmapi.svg'],
  ['nodes/GtmApiTrigger/gtmapi.svg', 'dist/nodes/GtmApiTrigger/gtmapi.svg'],
];

for (const [from, to] of copies) {
  mkdirSync(dirname(join(__dirname, '..', to)), { recursive: true });
  cpSync(join(__dirname, '..', from), join(__dirname, '..', to));
}
