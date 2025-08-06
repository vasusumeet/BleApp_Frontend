import React, { createContext, useState } from 'react';
export const ConnectedDevicesContext = createContext();

export const ConnectedDevicesProvider = ({ children }) => {
  const [connectedDevices, setConnectedDevices] = useState([]);

  const addConnectedDevice = (device) => {
    setConnectedDevices(prev =>
      prev.some(d => d.id === device.id) ? prev : [...prev, device]
    );
  };
  const removeConnectedDevice = (id) => {
    setConnectedDevices(prev => prev.filter(d => d.id !== id));
  };

  return (
    <ConnectedDevicesContext.Provider value={{
      connectedDevices, addConnectedDevice, removeConnectedDevice
    }}>
      {children}
    </ConnectedDevicesContext.Provider>
  )
}
