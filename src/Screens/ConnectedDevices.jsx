import React, { useContext, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, Button } from 'react-native';
import { ConnectedDevicesContext } from '../ConnectedDevicesContext';
import { BleManager } from 'react-native-ble-plx';

const manager = new BleManager();

const getDeviceName = device => device.name || device.localName || 'Unnamed';

const ConnectedDevices = () => {
  const { connectedDevices, removeConnectedDevice, deviceData, updateDeviceData } = useContext(ConnectedDevicesContext);
  const [listeningOn, setListeningOn] = useState({}); // { [deviceId]: { service, char } }
  const [exploreInfo, setExploreInfo] = useState({}); // { [deviceId]: { loading, services, error } }
  const [showDetails, setShowDetails] = useState({}); // { [deviceId]: boolean }

  const handleDisconnect = async (device) => {
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

  const exploreDevice = async (device) => {
    setExploreInfo(prev => ({ ...prev, [device.id]: { loading: true, services: [], error: '' } }));
    setShowDetails(prev => ({ ...prev, [device.id]: true }));
    try {
      const fullDevice = await device.discoverAllServicesAndCharacteristics();
      const services = await fullDevice.services();
      let serviceList = [];
      for (const service of services) {
        const chars = await fullDevice.characteristicsForService(service.uuid);
        serviceList.push({
          uuid: service.uuid,
          characteristics: chars.map(char => ({
            uuid: char.uuid,
            properties: char.properties || [],
            isReadable: char.isReadable,
            isWritableWithResponse: char.isWritableWithResponse,
            isWritableWithoutResponse: char.isWritableWithoutResponse,
            isNotifiable: char.isNotifiable,
            isNotifying: char.isNotifying,
            isIndicatable: char.isIndicatable
          }))
        });
      }
      setExploreInfo(prev => ({
        ...prev,
        [device.id]: { loading: false, services: serviceList, error: '' }
      }));
    } catch (err) {
      setExploreInfo(prev => ({
        ...prev,
        [device.id]: { loading: false, services: [], error: err.message || String(err) }
      }));
    }
  };

  // Subscribe to a specific characteristic and update context state live as data arrives
  const startListening = async (device, serviceUuid, charUuid) => {
    setListeningOn(prev => ({
      ...prev,
      [device.id]: { service: serviceUuid, char: charUuid }
    }));
    try {
      const fullDevice = await device.discoverAllServicesAndCharacteristics();
      manager.monitorCharacteristicForDevice(
        device.id,
        serviceUuid,
        charUuid,
        (error, characteristic) => {
          if (error) {
            Alert.alert('Listen Error', error.message);
            setListeningOn(prev => ({ ...prev, [device.id]: null }));
            return;
          }
          if (characteristic?.value) {
            // Decoding BLE value (adjust logic if your device sends binary, hex, or JSON)
            const decoded = Buffer.from(characteristic.value, 'base64').toString('ascii');
            updateDeviceData(device.id, decoded);
          }
        }
      );
      Alert.alert('Listening', `Listening to ${charUuid} from ${getDeviceName(device)}`);
    } catch (err) {
      Alert.alert('Error', err.message);
      setListeningOn(prev => ({ ...prev, [device.id]: null }));
    }
  };

  // UI: Service/Characteristic explorer, use FlatList
  const renderServiceDetails = (deviceId, device) => {
    const info = exploreInfo[deviceId];
    if (!info) return null;
    if (info.loading) return <Text style={styles.dataLabel}>Loading services...</Text>;
    if (info.error) return <Text style={{ color: 'red' }}>Error: {info.error}</Text>;
    if (!info.services.length) return <Text style={styles.dataLabel}>No services found.</Text>;

    return (
      <View style={{ marginTop: 6, maxHeight: 260 }}>
        <Text style={styles.dataLabel}>Services and Characteristics:</Text>
        <FlatList
          data={info.services}
          keyExtractor={service => service.uuid}
          renderItem={({ item: service }) => (
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.service}>Service: {service.uuid}</Text>
              <FlatList
                data={service.characteristics}
                keyExtractor={char => char.uuid}
                renderItem={({ item: char }) => (
                  <View style={styles.characteristic}>
                    <Text style={styles.charUuid}>↳ Characteristic: {char.uuid}</Text>
                    <Text style={styles.charProps}>
                      Props: {char.properties && char.properties.length
                        ? char.properties.join(', ')
                        : [
                            'Readable', char.isReadable && 'Y',
                            'Writable', (char.isWritableWithResponse || char.isWritableWithoutResponse) && 'Y',
                            'Notifiable', (char.isNotifiable || char.isNotifying || char.isIndicatable) && 'Y'
                          ].filter(Boolean).join(', ')
                      }
                    </Text>
                    {(char.isNotifiable || char.isIndicatable) && (
                      <Button
                        title={
                          (listeningOn[device.id] &&
                          listeningOn[device.id].service === service.uuid &&
                          listeningOn[device.id].char === char.uuid)
                            ? "Listening..."
                            : "Listen to Data"
                        }
                        onPress={() => startListening(device, service.uuid, char.uuid)}
                        disabled={
                          listeningOn[device.id] &&
                          listeningOn[device.id].service === service.uuid &&
                          listeningOn[device.id].char === char.uuid
                        }
                        color="#43a047"
                      />
                    )}
                  </View>
                )}
                nestedScrollEnabled
              />
            </View>
          )}
          nestedScrollEnabled
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Connected Devices</Text>
      {connectedDevices.length === 0 ? (
        <Text style={styles.empty}>No devices connected yet.</Text>
      ) : (
        <FlatList
          data={connectedDevices}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.deviceItem}>
              <Text style={styles.name}>{getDeviceName(item)}</Text>
              <Text style={styles.id}>{item.id}</Text>
              <Text style={styles.dataLabel}>Latest Data:</Text>
              <Text style={styles.dataValue}>
                {deviceData[item.id] ? deviceData[item.id] : 'No data yet.'}
              </Text>
              <TouchableOpacity
                style={styles.disconnectBtn}
                onPress={() => handleDisconnect(item)}
              >
                <Text style={{ color: 'red' }}>Disconnect</Text>
              </TouchableOpacity>
              <Button
                title={showDetails[item.id] ? "Hide Details" : "Explore Services"}
                onPress={() =>
                  showDetails[item.id]
                    ? setShowDetails(prev => ({ ...prev, [item.id]: false }))
                    : exploreDevice(item)
                }
                color="#0066cc"
              />
              {showDetails[item.id] && renderServiceDetails(item.id, item)}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 40 },
  header: { fontSize: 22, fontWeight: '600', marginBottom: 18, alignSelf: 'center' },
  empty: { color: '#888', alignSelf: 'center', marginTop: 24 },
  deviceItem: { padding: 14, borderBottomColor: '#ddd', borderBottomWidth: 1 },
  name: { fontWeight: '600', fontSize: 16 },
  id: { color: '#999', fontSize: 12, marginBottom: 4 },
  dataLabel: { color: '#555', fontWeight: '500' },
  dataValue: { color: '#228b22', fontSize: 15, marginBottom: 8 },
  disconnectBtn: { alignSelf: 'flex-end', marginTop: 10 },
  service: { fontWeight: 'bold', color: '#175199' },
  characteristic: { paddingLeft: 14, marginBottom: 5 },
  charUuid: { color: '#444', fontSize: 13 },
  charProps: { color: '#996', fontSize: 12, marginLeft: 6, marginBottom: 4 }
});

export default ConnectedDevices;
