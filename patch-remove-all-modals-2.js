const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html') && f !== 'login.html' && f !== 'register.html');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Hard replace of the whole modal block up to a safe common element like the product detail modal
  content = content.replace(/<!-- Modal de Login \/ Cuenta -->[\s\S]*?(?=<!-- Modal Detalle del Producto -->)/g, '');
  
  // Also clean up any other stray login/register modal divs just in case
  content = content.replace(/<div class="modal-overlay" id="login-modal-overlay">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g, '');
  content = content.replace(/<div class="modal-overlay" id="register-modal-overlay">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g, '');

  fs.writeFileSync(file, content, 'utf8');
}
console.log('All login/register modals removed properly');
