import {
  StyleSheet, Text, View, Button,
  FlatList, TouchableOpacity, Modal, Pressable, Platform,
  PermissionsAndroid, Alert
} from 'react-native';
import React, { useEffect, useState, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { BleManager } from 'react-native-ble-plx';
import { ConnectedDevicesContext } from '../ConnectedDevicesContext'; // ADD THIS

const manager = new BleManager();

const Connect = () => {
  const navigation = useNavigation();
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  // Pull addConnectedDevice from context
  const { addConnectedDevice } = useContext(ConnectedDevicesContext); // ADD THIS

  useEffect(() => {
    checkPermissions();
    return () => {
      manager.destroy();
    };
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        const allGranted = Object.values(granted).every(
          v => v === PermissionsAndroid.RESULTS.GRANTED
        );
        setHasPermission(allGranted);
        return allGranted;
      } catch (err) {
        setHasPermission(false);
        return false;
      }
    } else {
      setHasPermission(true);
      return true;
    }
  };

  const handleStartScan = async () => {
    if (!hasPermission) {
      setShowPermissionModal(true);
    } else {
      startScan();
    }
  };

  const handlePermissionModal = async () => {
    setShowPermissionModal(false);
    const granted = await checkPermissions();
    if (granted) {
      startScan();
    } else {
      Alert.alert('Permission denied', 'Bluetooth (and location) permission is required.');
    }
  };

  const startScan = () => {
    setDevices([]);
    setScanning(true);

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        setScanning(false);
        return;
      }
      if (device && device.id) {
        setDevices(prevDevices => {
          if (!prevDevices.some(d => d.id === device.id)) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }
    });

    setTimeout(() => {
      manager.stopDeviceScan();
      setScanning(false);
    }, 10000);
  };

  const dedupedDevices = [...new Map(devices.map(item => [item.id, item])).values()];
  const getDeviceName = device => device.name || device.localName || 'Unnamed';

  const connectToDevice = async (device) => {
    try {
      const connectedDevice = await manager.connectToDevice(device.id);
      addConnectedDevice(connectedDevice); // <<== ADD THIS
      Alert.alert('Connected', `Connected to ${getDeviceName(connectedDevice)} (${connectedDevice.id})`);
    } catch (e) {
      Alert.alert('Connection failed', e.message);
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.header}>Connect</Text>
      <Button
        title={scanning ? 'Scanning...' : 'Start BLE Scan'}
        onPress={handleStartScan}
        disabled={scanning}
      />
      <Button
        style={{ padding: '10' }}
        title="View Connected Devices"
        onPress={() => navigation.navigate('ConnectedDevices')}
      />

      <Modal
        visible={showPermissionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPermissionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
              Bluetooth Permission Required
            </Text>
            <Text style={{ marginBottom: 15 }}>
              This app needs Bluetooth (and location) permission to scan for nearby devices.
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Pressable
                style={styles.modalButton}
                onPress={() => setShowPermissionModal(false)}>
                <Text style={{ color: 'red' }}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.modalButton}
                onPress={handlePermissionModal}>
                <Text style={{ color: 'blue' }}>Allow & Continue</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        data={dedupedDevices}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.deviceItem} onPress={() => connectToDevice(item)}>
            <Text>{getDeviceName(item)}</Text>
            <Text style={styles.deviceId}>{item.id}</Text>
          </TouchableOpacity>
        )}
        style={{ marginTop: 16, width: '100%' }}
      />
    </View>
  );
};

export default Connect;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 18,
    alignSelf: 'center',
  },
  deviceItem: {
    padding: 12,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  deviceId: {
    color: '#999',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '82%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
  }
});
