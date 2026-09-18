const fs = require('fs');
let content = fs.readFileSync('css/style.css', 'utf8');

// The sticky footer technique requires html and body to have min-height: 100vh
// and body to be a flex container.

content = content.replace(
  /body,\r?\nhtml \{\r?\n\s*height: 100%;\r?\n\}/g,
  `body,\nhtml {\n  min-height: 100vh;\n  margin: 0;\n  padding: 0;\n}`
);

fs.writeFileSync('css/style.css', content, 'utf8');
console.log('Flex layout min-height patched.');
