const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');
let newHtml = indexHtml.replace(/<div class="modal-overlay" id="login-modal-overlay">[\s\S]*?<!-- Modal de Registro -->/g, '<!-- Modal de Registro -->');
newHtml = newHtml.replace(/<!-- Modal de Registro -->[\s\S]*?<!-- Modal Detalle del Producto -->/g, '<!-- Modal Detalle del Producto -->');
fs.writeFileSync('index.html', newHtml, 'utf8');

// Also update the button href
let patched = newHtml.replace(
  '<a href="perfil.html" class="nav-action-btn" id="open-login-btn"', 
  '<a href="login.html" class="nav-action-btn" id="open-login-btn"'
);
fs.writeFileSync('index.html', patched, 'utf8');
console.log('Modals removed');
