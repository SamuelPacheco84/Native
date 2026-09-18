const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Remove login modal
  content = content.replace(/<div class="modal-overlay" id="login-modal-overlay">[\s\S]*?<!-- Modal de Registro -->/g, '<!-- Modal de Registro -->');
  content = content.replace(/<!-- Modal de Login \/ Cuenta -->[\s\S]*?<!-- Modal de Registro -->/g, '<!-- Modal de Registro -->');
  
  // Remove register modal
  content = content.replace(/<div class="modal-overlay" id="register-modal-overlay">[\s\S]*?<!-- Modal Detalle del Producto -->/g, '<!-- Modal Detalle del Producto -->');
  content = content.replace(/<!-- Modal de Registro -->[\s\S]*?<!-- Modal Detalle del Producto -->/g, '<!-- Modal Detalle del Producto -->');
  content = content.replace(/<!-- Modal de Registro -->[\s\S]*?<\/body>/g, '</body>');

  fs.writeFileSync(file, content, 'utf8');
}
console.log('All login/register modals removed');
