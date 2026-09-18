const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');

// Also update javascript that opens the modal
let patched = indexHtml.replace(
  "if (openLoginBtn && loginModal) {", 
  "if (false) {"
);

patched = patched.replace(
  "if (openLoginBtn && loginModal)", 
  "if (false)"
);

// We should also look into all HTML files and ensure the link to perfil/login points to login.html instead of a button
fs.writeFileSync('index.html', patched, 'utf8');
