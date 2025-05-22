const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');

const { createAgency, 
  getAgencies, 
  getAgencyById, 
  updateAgency, 
  deleteAgency 
} = require('../controller/agencyController');

const router = express.Router();

router.route('/')
.get(getAgencies);

router.route('/')
.post(protect, admin, createAgency);

router.route('/:id')
.get(getAgencyById)
.put(protect, admin, updateAgency)
.delete(protect, admin, deleteAgency);

module.exports = router;