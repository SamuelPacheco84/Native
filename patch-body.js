const fs = require('fs');
let content = fs.readFileSync('css/style.css', 'utf8');

// Also make sure .apartado-perfil-section stretches to fill the space
// if there is empty space on very large screens.
content = content.replace(
  /\.apartado-perfil-section \{\r?\n\s*padding: 40px 0 70px 0;/g,
  `.apartado-perfil-section {\n  padding: 40px 0 70px 0;\n  flex: 1;`
);

fs.writeFileSync('css/style.css', content, 'utf8');
console.log('Main section flex patched.');
