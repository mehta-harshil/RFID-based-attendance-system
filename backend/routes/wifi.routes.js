const express = require('express');
const router = express.Router();
const wifiController = require('../controllers/wifi.controller');

// @route   POST api/wifi/save
// @desc    Save/Upsert Wi-Fi configuration
// @access  Public
router.post('/save', wifiController.saveWifiList);

// @route   GET api/wifi/:moduleId
// @desc    Get Wi-Fi configuration for a module
// @access  Public
router.get('/:moduleId', wifiController.getWifi);

// @route   DELETE api/wifi/:moduleId
// @desc    Delete Wi-Fi configuration
// @access  Public
router.delete('/:moduleId', wifiController.deleteWifi);

// @route   DELETE api/wifi/factory-reset/:moduleId
// @desc    Factory reset all Wi-Fi for module
// @access  Public
router.delete('/factory-reset/:moduleId', wifiController.factoryReset);

module.exports = router;
