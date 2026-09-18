const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

const footerLinksHtml = `
        <div class="footer-links" style="display: flex; gap: 20px; align-items: center;">
          <a href="contact.html" style="color: var(--blanco); text-decoration: none; font-size: 14.5px; font-weight: 500; transition: color 0.3s;" onmouseover="this.style.color='var(--verde-natural)'" onmouseout="this.style.color='var(--blanco)'"><i class="fas fa-envelope" style="margin-right: 5px;"></i> Contacto</a>
        </div>
`;

for (let file of files) {
  let html = fs.readFileSync(file, 'utf8');
  
  // Remove Contacto from nav
  html = html.replace(/<li>\s*<a[^>]*href="contact\.html"[^>]*>.*?<\/a>\s*<\/li>\r?\n?/g, '');
  
  // Insert into footer if not already there
  if (!html.includes('class="footer-links"')) {
    html = html.replace(/(<div class="footer-brand">[\s\S]*?<\/div>)/, `$1\n${footerLinksHtml}`);
  }
  
  fs.writeFileSync(file, html, 'utf8');
}
console.log('Update complete.');
