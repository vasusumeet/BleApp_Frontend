import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';

const API_URL = 'http://bleapp-production.up.railway.app/api/data';


const ViewData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then(response => response.json())
      .then(json => setData(json))
      .catch(error => {
        console.error('Error fetching data:', error);
      })
      .finally(() => setLoading(false));
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text>Status: {item.Status}</Text>
      <Text>Roll: {item.Roll}</Text>
      <Text>Pitch: {item.Pitch}</Text>
      <Text>Steps: {item.Steps}</Text>
      <Text>Shakes: {item.Shakes}</Text>
      <Text>Scratches: {item.Scratches}</Text>
      <Text>Jumps: {item.Jumps}</Text>
      <Text>Licks: {item.Licks}</Text>
      <Text>FreeFalls: {item.FreeFalls}</Text>
      <Text>Date: {new Date(item.dateCreated).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>View Data</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item._id}
          renderItem={renderItem}
        />
      )}
    </View>
  )
}

export default ViewData;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 48,
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 18,
    alignSelf: 'center',
  },
  itemContainer: {
    padding: 12,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  }
});
