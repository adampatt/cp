// app.js
const express = require('express');
const app = express();
const port = 3001;

// Define a simple route:
app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

// Start the server:
app.listen(port, () => {
  console.log(`Express server running at http://localhost:${port}`);
});
