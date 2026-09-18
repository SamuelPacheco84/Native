const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The event listener is likely attached somewhere else or earlier, let's find it.
html = html.replace(
  /if \(\s*openLoginBtn\s*\)\s*{\s*openLoginBtn.addEventListener\('click',\s*\(\)\s*=>\s*{\s*loginModal.classList.add\('active'\);\s*}\);\s*}/g,
  ""
);

html = html.replace(
  /if \(\s*openLoginBtn\s*&&\s*loginModal\s*\)\s*{\s*openLoginBtn.addEventListener\('click',\s*\(e\)\s*=>\s*{\s*e.preventDefault\(\);\s*loginModal.classList.add\('active'\);\s*}\);\s*}/g,
  ""
);

fs.writeFileSync('index.html', html, 'utf8');
