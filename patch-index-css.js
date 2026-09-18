const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Optional: remove any residual JS logic that might throw errors because elements are null.
// But we already disabled the trigger to open the modal, so it should be fine.

fs.writeFileSync('index.html', content, 'utf8');
