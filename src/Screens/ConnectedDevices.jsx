import React, { useContext, useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { ConnectedDevicesContext } from '../ConnectedDevicesContext';
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

const manager = new BleManager();

const SERVICE_UUID = '12345678-1234-4321-1234-56789ABCDEF0';      
const PASSWORD_CHAR_UUID = '12345678-1234-4321-1234-56789ABCDEF2'; 
const DATA_CHAR_UUID = '12345678-1234-4321-1234-56789ABCDEF1';     
const PASSWORD_VALUE = 'swe123';                                   

const getDeviceName = device => device.name || device.localName || 'Unnamed';

const ConnectedDevices = () => {
  const { connectedDevices, removeConnectedDevice, deviceData, updateDeviceData } = useContext(ConnectedDevicesContext);

  const [sendingPassword, setSendingPassword] = useState({});
  const [listening, setListening] = useState({});
  const [subscriptionRefs, setSubscriptionRefs] = useState({});
  const [receivedData, setReceivedData] = useState({});


  useEffect(() => {
    return () => {
      Object.values(subscriptionRefs).forEach(sub => sub?.remove && sub.remove());
    };
  }, [subscriptionRefs]);

  const handleDisconnect = async (device) => {
  
    if (subscriptionRefs[device.id]) {
      subscriptionRefs[device.id].remove();
    }
    
    setSubscriptionRefs(prev => {
      const p = { ...prev };
      delete p[device.id];
      return p;
    });
    setListening(prev => ({ ...prev, [device.id]: false }));
    setSendingPassword(prev => ({ ...prev, [device.id]: false }));
    setReceivedData(prev => ({ ...prev, [device.id]: null }));

    // Disconnect device
    Alert.alert(
      'Disconnect Device',
      `Are you sure you want to disconnect ${getDeviceName(device)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await device.cancelConnection?.();
              removeConnectedDevice(device.id);
              Alert.alert('Disconnected', `Device ${getDeviceName(device)} disconnected`);
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          }
        }
      ]
    );
  };

  const sendPassword = async (device) => {
    setSendingPassword(prev => ({ ...prev, [device.id]: true }));
    setReceivedData(prev => ({ ...prev, [device.id]: null }));
    try {
      await device.discoverAllServicesAndCharacteristics();
      await device.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        PASSWORD_CHAR_UUID,
        Buffer.from(PASSWORD_VALUE).toString('base64')
      );
      Alert.alert('Password sent!', 'Ready for Roll/Pitch notification');
      setSendingPassword(prev => ({ ...prev, [device.id]: false }));
    } catch (err) {
      Alert.alert('Error sending password', err.message);
      setSendingPassword(prev => ({ ...prev, [device.id]: false }));
    }
  };

 
  const listenForData = async (device) => {
    setListening(prev => ({ ...prev, [device.id]: true }));
    setReceivedData(prev => ({ ...prev, [device.id]: null }));

    try {
      await device.discoverAllServicesAndCharacteristics();

      
      if (subscriptionRefs[device.id]) {
        subscriptionRefs[device.id].remove();
      }

      let receivedChunks = [];

      const subscription = manager.monitorCharacteristicForDevice(
        device.id,
        SERVICE_UUID,
        DATA_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            Alert.alert('Listen error', error.message);
            setListening(prev => ({ ...prev, [device.id]: false }));
            return;
          }
          if (characteristic?.value) {
            const asciiVal = Buffer.from(characteristic.value, 'base64').toString('ascii');
            
            receivedChunks.push(asciiVal);
            setReceivedData(prev => ({ ...prev, [device.id]: asciiVal }));
            updateDeviceData(device.id, asciiVal);  
          }
        }
      );

      setSubscriptionRefs(prev => ({ ...prev, [device.id]: subscription }));

      
      setTimeout(() => {
        subscription.remove();
        setSubscriptionRefs(prev => ({ ...prev, [device.id]: null }));
        setListening(prev => ({ ...prev, [device.id]: false }));

        
        const collectedData = receivedChunks.join('\n');
        setReceivedData(prev => ({ ...prev, [device.id]: collectedData }));
        updateDeviceData(device.id, collectedData);

        Alert.alert('Data Listening Complete', collectedData || 'No data received.');

      }, 10000);

      Alert.alert('Listening', `Listening for Data on ${DATA_CHAR_UUID} for 10 seconds`);
    } catch (err) {
      Alert.alert('Error starting listener', err.message);
      setListening(prev => ({ ...prev, [device.id]: false }));
    }
  };

  
  const renderDeviceItem = ({ item }) => (
    <View style={styles.deviceItem}>
      <Text style={styles.name}>{getDeviceName(item)}</Text>
      <Text style={styles.id}>{item.id}</Text>

      {/* Show latest recorded data from notification/characteristic */}
      <Text style={styles.dataLabel}>Latest Data:</Text>
      <Text style={styles.dataValue}>
        {receivedData[item.id] || deviceData[item.id] || 'No data yet.'}
      </Text>

      <TouchableOpacity style={styles.disconnectBtn} onPress={() => handleDisconnect(item)}>
        <Text style={{ color: 'red' }}>Disconnect</Text>
      </TouchableOpacity>

      {/* Send password button */}
      <Button
        title={sendingPassword[item.id] ? 'Sending Password...' : 'Send Password'}
        onPress={() => sendPassword(item)}
        color="#0066cc"
        disabled={sendingPassword[item.id] || listening[item.id]}
      />

      {/* Listen for Roll/Pitch data */}
      <View style={{ marginTop: 10 }}>
        <Button
          title={listening[item.id] ? 'Listening...' : 'Listen for Data'}
          onPress={() => listenForData(item)}
          color="#43a047"
          disabled={listening[item.id] || sendingPassword[item.id]}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Connected Devices</Text>
      {connectedDevices.length === 0 ? (
        <Text style={styles.empty}>No devices connected yet.</Text>
      ) : (
        <FlatList
          data={connectedDevices}
          keyExtractor={item => item.id}
          renderItem={renderDeviceItem}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 40 },
  header: { fontSize: 22, fontWeight: '600', marginBottom: 18, alignSelf: 'center' },
  empty: { color: '#888', alignSelf: 'center', marginTop: 24 },
  deviceItem: { padding: 14, borderBottomColor: '#ddd', borderBottomWidth: 1, marginBottom: 8 },
  name: { fontWeight: '600', fontSize: 16 },
  id: { color: '#999', fontSize: 12, marginBottom: 4 },
  dataLabel: { color: '#555', fontWeight: '500', marginTop: 8 },
  dataValue: { color: '#228b22', fontSize: 15, marginBottom: 8 },
  disconnectBtn: { alignSelf: 'flex-end', marginTop: 10 },
});

export default ConnectedDevices;
