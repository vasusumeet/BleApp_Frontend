import { StyleSheet, Text, View, Button } from 'react-native';
import React from 'react';

const Home = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 20, fontWeight: '500' }}>Home</Text>
      <Button
        title="Connect BLE"
        onPress={() => navigation.navigate('Connect')}
      />
      <View style={{ height: 18 }} />
      <Button
        title="View Connected Devices"
        onPress={() => navigation.navigate('ConnectedDevices')}
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
