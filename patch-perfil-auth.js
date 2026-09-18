const fs = require('fs');
let content = fs.readFileSync('perfil.html', 'utf8');

const authGuardPerfil = `
  <script>
    // Perfil auth guard
    if (!localStorage.getItem('nativa_user_email')) {
      window.location.href = 'login.html';
    }
  </script>
</head>`;

if(!content.includes('// Perfil auth guard')) {
  content = content.replace('</head>', authGuardPerfil);
  fs.writeFileSync('perfil.html', content, 'utf8');
  console.log('Perfil guarded');
}
