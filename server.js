const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static assets and html files from the root directory
app.use(express.static(__dirname, { extensions: ['html'] }));

// Fallback to index.html for unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
