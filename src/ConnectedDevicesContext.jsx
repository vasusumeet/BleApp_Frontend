import React, { createContext, useState } from 'react';
export const ConnectedDevicesContext = createContext();

export const ConnectedDevicesProvider = ({ children }) => {
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [deviceData, setDeviceData] = useState({}); // { [deviceId]: latestValue }

  const addConnectedDevice = (device) => {
    setConnectedDevices(prev =>
      prev.some(d => d.id === device.id) ? prev : [...prev, device]
    );
  };
  const removeConnectedDevice = (id) => {
    setConnectedDevices(prev => prev.filter(d => d.id !== id));
    setDeviceData(prev => {
      const newData = { ...prev };
      delete newData[id];
      return newData;
    });
  };

  // Add a way to update data for a device
  const updateDeviceData = (deviceId, value) => {
    setDeviceData(prev => ({
      ...prev,
      [deviceId]: value,
    }));
  };

  return (
    <ConnectedDevicesContext.Provider value={{
      connectedDevices, addConnectedDevice, removeConnectedDevice,
      deviceData, updateDeviceData
    }}>
      {children}
    </ConnectedDevicesContext.Provider>
  )
};
