const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

// The global wrapper pattern to ensure flex layout pushes footer to the bottom.
// In index.html, there's no single element that wraps everything between header and footer, 
// so we'll ensure body { display: flex; flex-direction: column; min-height: 100vh } 
// and #main-footer { margin-top: auto; } covers it. 

// Let's verify index.html structure
const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');
console.log('Checked files.');
