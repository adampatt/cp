
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

const rawData = fs.readFileSync(path.join(__dirname, 'vehicles.json'), 'utf8');
let vehicles = JSON.parse(rawData);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/api/vehicles', (req, res) => {
    res.json(vehicles);
});

