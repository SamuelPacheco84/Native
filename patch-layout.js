const fs = require('fs');
let content = fs.readFileSync('css/style.css', 'utf8');

// Update body, html to use flexbox for sticky footer
content = content.replace(
  /body,\r?\nhtml\s*\{\r?\n\s*font-family/g,
  `body,\nhtml {\n  height: 100%;\n}\n\nbody {\n  display: flex;\n  flex-direction: column;\n  font-family`
);

// We also need to set flex: 1 on the main content sections.
// Right now they might not be wrapped in a main, but they are between header and footer.
// An easy fix for the global layout is setting margin-top: auto on the footer so it pushes itself down
content = content.replace(
  /#main-footer \{\r?\n\s*background-color/g,
  `#main-footer {\n  margin-top: auto;\n  background-color`
);

fs.writeFileSync('css/style.css', content, 'utf8');
console.log('Flex layout patched.');
