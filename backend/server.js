
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


// Returns all unique makes
app.get('/api/vehicles/makes', (req, res) => {
    let { limit }  = req.query;
    

    limit = parseInt(limit) || 0;
    
    // Extract unique makes using Set
    const uniqueMakes = [...new Set(vehicles.map(vehicle => vehicle.make))].sort();
    
    // If limit is 0 or negative, return all makes
    const result = limit <= 0 ? uniqueMakes : uniqueMakes.slice(0, limit);
    
    res.json(result);
  });
  
// Returns all unique models for a make
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


// Returns all unique submodels for a make and model filtering out vehicles without submodel
app.get('/api/vehicles/submodels', (req, res) => {
const { make, model } = req.query;

if (!make || !model) {
    return res.status(400).json({ error: 'Make and model parameters are required' });
}

const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.make.toLowerCase() === make.toLowerCase() &&
    vehicle.model.toLowerCase() === model.toLowerCase()
);


const uniqueSubModels = [...new Set(
    filteredVehicles
    .filter(vehicle => vehicle.submodel)
    .map(vehicle => vehicle.submodel)
)].sort();

res.json(uniqueSubModels);
});

// Returns all details for a vehicle
app.get('/api/vehicles/details', (req, res) => {
    const { make, model, subModel } = req.query;

    if (!make || !model || !subModel) {
        return res.status(400).json({ error: 'Make, model, and submodel parameters are required' });
    }
    

    let filteredVehicles = vehicles.filter(vehicle => 
        vehicle.make.toLowerCase() === make.toLowerCase() &&
        vehicle.model.toLowerCase() === model.toLowerCase() &&
        vehicle.submodel.toLowerCase() === subModel.toLowerCase()
      );

      if (filteredVehicles.length === 0) {
        return res.status(404).json({ error: 'No matching vehicles found' });
      }

      const details = {
        dateOfManufacture: [...new Set(filteredVehicles.map(vehicle => vehicle.dateOfManufacture))].sort(),
        transmission: [...new Set(filteredVehicles.map(vehicle => vehicle.transmission))].sort(),
        fuel: [...new Set(filteredVehicles.map(vehicle => vehicle.fuel))].sort(),
        engineSize: [...new Set(filteredVehicles.map(vehicle => vehicle.engineSize))].sort(),
      };
      
      res.json(details);
});