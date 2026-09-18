const fs = require('fs');
let content = fs.readFileSync('scripts/generate-product-pages.js', 'utf8');

// Remove Contacto from nav
content = content.replace(/<li><a href="contact\.html"><i class="fas fa-envelope"><\/i> Contacto<\/a><\/li>\r?\n?/g, '');

// Add to footer
const footerLinksHtml = `
        <div class="footer-links" style="display: flex; gap: 20px; align-items: center;">
          <a href="contact.html" style="color: var(--blanco); text-decoration: none; font-size: 14.5px; font-weight: 500; transition: color 0.3s;" onmouseover="this.style.color=\\'var(--verde-natural)\\'" onmouseout="this.style.color=\\'var(--blanco)\\'"><i class="fas fa-envelope" style="margin-right: 5px;"></i> Contacto</a>
        </div>`;

// Wait, the quotes in the JS script generator are backticks.
// Let's do a replace that's safe:
content = content.replace(/(<div class="footer-brand">[\s\S]*?<\/div>)/, `$1\n        <div class="footer-links" style="display: flex; gap: 20px; align-items: center;">\n          <a href="contact.html" style="color: var(--blanco); text-decoration: none; font-size: 14.5px; font-weight: 500; transition: color 0.3s;" onmouseover="this.style.color='var(--verde-natural)'" onmouseout="this.style.color='var(--blanco)'"><i class="fas fa-envelope" style="margin-right: 5px;"></i> Contacto</a>\n        </div>`);

fs.writeFileSync('scripts/generate-product-pages.js', content, 'utf8');
console.log('Script patched.');
