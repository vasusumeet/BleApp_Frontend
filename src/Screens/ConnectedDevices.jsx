import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { ConnectedDevicesContext } from '../ConnectedDevicesContext';

const getDeviceName = device => device.name || device.localName || 'Unnamed';

const ConnectedDevices = () => {
  const { connectedDevices, removeConnectedDevice } = useContext(ConnectedDevicesContext);

  const handleDisconnect = async (device) => {
    Alert.alert(
      'Disconnect Device',
      `Are you sure you want to disconnect ${getDeviceName(device)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: 'destructive',
          onPress: async () => {
            try {
              await device.cancelConnection();
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
              <TouchableOpacity
                style={styles.disconnectBtn}
                onPress={() => handleDisconnect(item)}
              >
                <Text style={{ color: 'red' }}>Disconnect</Text>
              </TouchableOpacity>
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
  disconnectBtn: { alignSelf: 'flex-end', marginTop: 10 },
});

export default ConnectedDevices;
