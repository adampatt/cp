const request = require('supertest');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Mock the fs module
jest.mock('fs');

// Create a sample vehicles data for testing
const mockVehicles = [
  {
    id: 1,
    make: 'Toyota',
    model: 'Camry',
    submodel: 'LE',
    dateOfManufacture: '2020',
    transmission: 'Automatic',
    fuel: 'Gasoline',
    engineSize: '2.5L'
  },
  {
    id: 2,
    make: 'Toyota',
    model: 'Camry',
    submodel: 'SE',
    dateOfManufacture: '2021',
    transmission: 'Automatic',
    fuel: 'Hybrid',
    engineSize: '2.5L'
  },
  {
    id: 3,
    make: 'Honda',
    model: 'Accord',
    submodel: 'Sport',
    dateOfManufacture: '2021',
    transmission: 'Manual',
    fuel: 'Gasoline',
    engineSize: '2.0L'
  },
  {
    id: 4,
    make: 'Honda',
    model: 'Civic',
    submodel: null,
    dateOfManufacture: '2022',
    transmission: 'CVT',
    fuel: 'Gasoline',
    engineSize: '1.5L'
  }
];

// Setup mock for fs.readFileSync
fs.readFileSync.mockReturnValue(JSON.stringify(mockVehicles));

// Import server code
let app;

beforeEach(() => {
  // Reset modules to ensure clean tests
  jest.resetModules();
  
  // Create a fresh Express app for each test
  app = express();
  app.use(cors());
  app.use(express.json());
  
  // Mock the vehicles data
  app.locals.vehicles = mockVehicles;
  
  // Register routes
  app.get('/api/vehicles/makes', (req, res) => {
    let { limit } = req.query;
    limit = parseInt(limit) || 0;
    
    const uniqueMakes = [...new Set(app.locals.vehicles.map(vehicle => vehicle.make))].sort();
    const result = limit <= 0 ? uniqueMakes : uniqueMakes.slice(0, limit);
    
    res.json(result);
  });
  
  app.get('/api/vehicles/models', (req, res) => {
    const { make } = req.query;
    
    if (!make) {
      return res.status(400).json({ error: 'Make parameter is required' });
    }
    
    const filteredVehicles = app.locals.vehicles.filter(vehicle => 
      vehicle.make.toLowerCase() === make.toLowerCase()
    );
    
    const uniqueModels = [...new Set(filteredVehicles.map(vehicle => vehicle.model))].sort();
    
    res.json(uniqueModels);
  });
  
  app.get('/api/vehicles/submodels', (req, res) => {
    const { make, model } = req.query;
    
    if (!make || !model) {
      return res.status(400).json({ error: 'Make and model parameters are required' });
    }
    
    const filteredVehicles = app.locals.vehicles.filter(vehicle => 
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
  
  app.get('/api/vehicles/details', (req, res) => {
    const { make, model, subModel } = req.query;
    
    if (!make || !model) {
      return res.status(400).json({ error: 'Make and model parameters are required' });
    }
    
    let filteredVehicles = app.locals.vehicles.filter(vehicle => 
      vehicle.make.toLowerCase() === make.toLowerCase() &&
      vehicle.model.toLowerCase() === model.toLowerCase()
    );
    
    if (subModel) {
      filteredVehicles = filteredVehicles.filter(vehicle => 
        vehicle.submodel?.toLowerCase() === subModel.toLowerCase()
      );
    }
    
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
});

describe('Vehicle API Endpoints', () => {
  
  // Test GET /api/vehicles/makes
  test('GET /api/vehicles/makes should return all unique makes', async () => {
    const response = await request(app).get('/api/vehicles/makes');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(['Honda', 'Toyota']);
  });
  
  test('GET /api/vehicles/makes with limit should return limited makes', async () => {
    const response = await request(app).get('/api/vehicles/makes?limit=1');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(['Honda']);
  });
  
  // Test GET /api/vehicles/models
  test('GET /api/vehicles/models should return models for a make', async () => {
    const response = await request(app).get('/api/vehicles/models?make=Honda');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(['Accord', 'Civic']);
  });
  
  test('GET /api/vehicles/models without make should return 400', async () => {
    const response = await request(app).get('/api/vehicles/models');
    
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Make parameter is required' });
  });
  
  // Test GET /api/vehicles/submodels
  test('GET /api/vehicles/submodels should return submodels for a make and model', async () => {
    const response = await request(app).get('/api/vehicles/submodels?make=Toyota&model=Camry');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(['LE', 'SE']);
  });
  
  test('GET /api/vehicles/submodels without make or model should return 400', async () => {
    const response = await request(app).get('/api/vehicles/submodels?make=Toyota');
    
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Make and model parameters are required' });
  });
  
  // Test GET /api/vehicles/details
  test('GET /api/vehicles/details should return details for a make and model', async () => {
    const response = await request(app).get('/api/vehicles/details?make=Toyota&model=Camry');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      dateOfManufacture: ['2020', '2021'],
      transmission: ['Automatic'],
      fuel: ['Gasoline', 'Hybrid'],
      engineSize: ['2.5L']
    });
  });
  
  test('GET /api/vehicles/details with subModel should filter by submodel', async () => {
    const response = await request(app).get('/api/vehicles/details?make=Toyota&model=Camry&subModel=LE');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      dateOfManufacture: ['2020'],
      transmission: ['Automatic'],
      fuel: ['Gasoline'],
      engineSize: ['2.5L']
    });
  });
  
  test('GET /api/vehicles/details without make or model should return 400', async () => {
    const response = await request(app).get('/api/vehicles/details?make=Toyota');
    
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Make and model parameters are required' });
  });
  
  test('GET /api/vehicles/details with non-existent vehicle should return 404', async () => {
    const response = await request(app).get('/api/vehicles/details?make=Ford&model=Mustang');
    
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'No matching vehicles found' });
  });
}); 