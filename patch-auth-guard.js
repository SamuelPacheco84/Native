const fs = require('fs');

const authGuardScript = `
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Login check for Perfil links
      document.querySelectorAll('a[href="perfil.html"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
          if(!localStorage.getItem('nativa_user_email')) {
            e.preventDefault();
            window.location.href = 'login.html';
          }
        });
      });
    });
  </script>
</body>
`;

const files = fs.readdirSync('.').filter(f => f.endsWith('.html') && f !== 'login.html' && f !== 'register.html');

for (let file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if(!content.includes('// Login check for Perfil links')) {
    content = content.replace('</body>', authGuardScript);
    fs.writeFileSync(file, content, 'utf8');
  }
}
console.log('Auth guard added to all pages.');
