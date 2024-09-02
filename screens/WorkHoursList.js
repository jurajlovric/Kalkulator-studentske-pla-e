// screens/WorkHoursList.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { supabase } from '../supabaseClient'; // Import Supabase klijenta

const WorkHoursList = ({ navigation, route }) => {
  const [workHours, setWorkHours] = useState([]);
  const userId = route.params.userId;

  useEffect(() => {
    const fetchWorkHours = async () => {
      const { data, error } = await supabase
        .from('work_hours')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching work hours:', error);
      } else {
        setWorkHours(data);
      }
    };

    fetchWorkHours();
  }, [userId]);

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.date}</Text>
      <Text style={styles.cell}>{item.hours_worked} h</Text>
      <Text style={styles.cell}>{item.earnings.toFixed(2)} €</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prikaz dnevnih zarada</Text>
      <FlatList
        data={workHours}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text>Nema unesenih sati.</Text>}
      />
      <Button
        title="Natrag na unos sati"
        onPress={() => navigation.navigate('DashboardScreen')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cell: {
    width: '30%',
    textAlign: 'center',
  },
});

export default WorkHoursList;
