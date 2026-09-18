const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Make sure the link correctly points to login.html or uses the generic JS to redirect 
  content = content.replace(
    /<a href="perfil.html"[^>]*id="nav-perfil-btn"[^>]*>/g,
    '<a href="perfil.html" class="nav-action-btn" id="nav-perfil-btn" aria-label="Mi Perfil y Pedidos" title="Perfil y Mis Pedidos">'
  );
  
  content = content.replace(
    /<a href="login.html"[^>]*id="nav-perfil-btn"[^>]*>/g,
    '<a href="perfil.html" class="nav-action-btn" id="nav-perfil-btn" aria-label="Mi Perfil y Pedidos" title="Perfil y Mis Pedidos">'
  );

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Navigation to perfil patched');
