const fs = require('fs');
let content = fs.readFileSync('scripts/generate-product-pages.js', 'utf8');

// Insert auth guard into the template
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
</body>`;

content = content.replace('</body>', authGuardScript);
fs.writeFileSync('scripts/generate-product-pages.js', content, 'utf8');
console.log('Script patched for auth guard.');
