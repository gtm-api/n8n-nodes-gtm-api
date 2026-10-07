// Copy node icons and codex files next to their compiled .js files. n8n resolves `file:` icons
// relative to the node file, and reads a node's codex (search aliases, categories, documentation
// links) from `<node>.node.json` beside `<node>.node.js`.
const { cpSync, mkdirSync } = require('fs');
const { dirname, join } = require('path');

const copies = [
  ['credentials/gtmapi.svg', 'dist/credentials/gtmapi.svg'],
  ['credentials/gtmapi.dark.svg', 'dist/credentials/gtmapi.dark.svg'],
  ['nodes/GtmApi/gtmapi.svg', 'dist/nodes/GtmApi/gtmapi.svg'],
  ['nodes/GtmApi/gtmapi.dark.svg', 'dist/nodes/GtmApi/gtmapi.dark.svg'],
  ['nodes/GtmApiTrigger/gtmapi.svg', 'dist/nodes/GtmApiTrigger/gtmapi.svg'],
  ['nodes/GtmApiTrigger/gtmapi.dark.svg', 'dist/nodes/GtmApiTrigger/gtmapi.dark.svg'],
  ['nodes/GtmApi/GtmApi.node.json', 'dist/nodes/GtmApi/GtmApi.node.json'],
  ['nodes/GtmApiTrigger/GtmApiTrigger.node.json', 'dist/nodes/GtmApiTrigger/GtmApiTrigger.node.json'],
];

for (const [from, to] of copies) {
  mkdirSync(dirname(join(__dirname, '..', to)), { recursive: true });
  cpSync(join(__dirname, '..', from), join(__dirname, '..', to));
}
