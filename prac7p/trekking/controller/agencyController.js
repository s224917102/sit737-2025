const Agency = require('../model/agencyModel');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');

// Create Agency
const createAgency = asyncHandler(async (req, res) => {
  const { name, email, phone, address, description, image, services } = req.body;

  if (!name || !email || !phone || !address || !description || !image || !services) {
    res.status(400);
    throw new Error('All fields (name, email, phone, address, description, image, services) are required');
  }

  const agency = new Agency({
    name,
    email,
    phone,
    address,
    description,
    image, // Add the image URL
    services, // Add the services array
  });

  const createdAgency = await agency.save();
  res.status(201).json(createdAgency);
});

// Get All Agencies
const getAgencies = asyncHandler(async (req, res) => {
  const agencies = await Agency.find({});
  res.json(agencies);
});

// Get Agency by ID
const getAgencyById = asyncHandler(async (req, res) => {
  const agencyId = req.params.id.trim();

  // Validate if the ID is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(agencyId)) {
    res.status(400);
    throw new Error('Invalid Agency ID');
  }

  const agency = await Agency.findById(agencyId);
  if (agency) {
    res.json(agency);
  } else {
    res.status(404);
    throw new Error('Agency not found');
  }
});

// Update Agency
const updateAgency = asyncHandler(async (req, res) => {
  const agencyId = req.params.id.trim();
  const { name, email, phone, address, description, image, services } = req.body;

  // Validate if the ID is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(agencyId)) {
    res.status(400);
    throw new Error('Invalid Agency ID');
  }

  const agency = await Agency.findById(agencyId);
  if (agency) {
    agency.name = name || agency.name;
    agency.email = email || agency.email;
    agency.phone = phone || agency.phone;
    agency.address = address || agency.address;
    agency.description = description || agency.description;
    agency.image = image || agency.image;
    agency.services = services || agency.services;

    const updatedAgency = await agency.save();
    res.json(updatedAgency);
  } else {
    res.status(404).json({ message: 'Agency not found' });
  }
});

// Delete Agency
const deleteAgency = asyncHandler(async (req, res) => {
  const agencyId = req.params.id.trim();

  // Validate if the ID is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(agencyId)) {
    res.status(400);
    throw new Error('Invalid Agency ID');
  }

  const agency = await Agency.findById(agencyId);

  if (agency) {
    // Using deleteOne instead of remove
    await agency.deleteOne();
    res.json({ message: 'Agency removed successfully' });
  } else {
    res.status(404).json({ message: 'Agency not found' });
  }
});

// Export all functions
module.exports = {
  createAgency,
  getAgencies,
  getAgencyById,
  updateAgency,
  deleteAgency,
};
