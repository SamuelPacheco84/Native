const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Re-write the profile link to explicitly just be an anchor to perfil.html
  // Or handle the authentication check logic (if auth, go to perfil; if not, go to login.html)
  
  // Clean up old login modal ids
  content = content.replace(/id="open-login-btn"/g, 'id="nav-perfil-btn"');
  
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Navigation patched');
