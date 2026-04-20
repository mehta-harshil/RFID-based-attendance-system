const Wifi = require('../models/Wifi');

exports.saveWifiList = async (req, res) => {
  try {
    const { moduleId, wifiList } = req.body;
    
    // If the list is empty, we don't save. We use factoryReset or delete for removal.
    if (!wifiList || wifiList.length === 0) {
       return res.json({ message: 'No Wi-Fi to save.' });
    }

    // Since requirement is limit 1, we take the first item
    const wifiData = wifiList[0];
    
    // Upsert the Wi-Fi configuration for this module
    const updatedWifi = await Wifi.findOneAndUpdate(
      { moduleId },
      { name: wifiData.name, password: wifiData.password },
      { new: true, upsert: true }
    );
    
    res.json({ message: 'Wi-Fi configuration saved successfully!', wifi: updatedWifi });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while saving Wi-Fi.' });
  }
};

exports.getWifi = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const wifi = await Wifi.findOne({ moduleId });
    
    if (!wifi) {
      return res.status(404).json({ message: 'Wi-Fi configuration not found for this module.' });
    }
    
    // Expected format for ESP32
    res.json({
      wifi: {
        [wifi.name]: wifi.password
      },
      module_id: moduleId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching Wi-Fi.' });
  }
};

exports.deleteWifi = async (req, res) => {
  try {
    const { moduleId } = req.params;
    await Wifi.findOneAndDelete({ moduleId });
    res.json({ message: 'Wi-Fi deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while deleting Wi-Fi.' });
  }
};

exports.factoryReset = async (req, res) => {
  try {
    const { moduleId } = req.params;
    await Wifi.deleteMany({ moduleId });
    res.json({ message: 'Factory reset successful! All Wi-Fi configurations cleared.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during factory reset.' });
  }
};
