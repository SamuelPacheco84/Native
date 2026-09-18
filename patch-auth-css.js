const fs = require('fs');
['login.html', 'register.html'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace('.auth-logo {', `.auth-logo-text { font-family: 'Montserrat', sans-serif; font-size: 64px; font-weight: 700; color: var(--verde-bosque); letter-spacing: -2px; margin-bottom: 20px; z-index: 1; display: flex; align-items: center; justify-content: center; position: relative; }
    .auth-logo-text::after { content: ''; position: absolute; bottom: 8px; width: 60px; height: 3px; background: var(--verde-natural); border-radius: 2px; }
    .auth-logo {`);
  fs.writeFileSync(file, content, 'utf8');
});
console.log('Logo patched');
