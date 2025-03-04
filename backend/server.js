
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

app.get('/api/vehicles/makes', (req, res) => {
    let { limit }  = req.query;
    

    limit = parseInt(limit) || 0;
    
    // Extract unique makes using Set
    const uniqueMakes = [...new Set(vehicles.map(vehicle => vehicle.make))].sort();
    
    // If limit is 0 or negative, return all makes
    const result = limit <= 0 ? uniqueMakes : uniqueMakes.slice(0, limit);
    
    res.json(result);
  });
  

  app.get('/api/vehicles/models', (req, res) => {
    const { make } = req.query;
    
    if (!make) {
      return res.status(400).json({ error: 'Make parameter is required' });
    }
    
    
    const filteredVehicles = vehicles.filter(vehicle => 
      vehicle.make.toLowerCase() === make.toLowerCase()
    );
    
    const uniqueModels = [...new Set(filteredVehicles.map(vehicle => vehicle.model))].sort();
    
    res.json(uniqueModels);
  });