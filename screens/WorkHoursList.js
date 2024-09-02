import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { supabase } from '../supabaseClient';
import { LineChart } from 'react-native-chart-kit';

const WorkHoursList = ({ navigation, route }) => {
  const [workHours, setWorkHours] = useState([]);
  const userId = route.params.userId;

  useEffect(() => {
    const fetchWorkHours = async () => {
      const { data, error } = await supabase
        .from('work_hours')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching work hours:', error);
      } else {
        setWorkHours(data);
      }
    };

    fetchWorkHours();
  }, [userId]);

  
  const chartData = {
    labels: workHours.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        data: workHours.map(item => item.earnings),
        strokeWidth: 2,
      },
    ],
  };

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
      {workHours.length > 0 && (
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#e26a00',
            backgroundGradientFrom: '#fb8c00',
            backgroundGradientTo: '#ffa726',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#ffa726',
            },
          }}
          bezier
          style={styles.chart}
        />
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('MonthlyHours', { userId })}
      >
        <Text style={styles.buttonText}>Prikaži mjesečne sate</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('DashboardScreen')}
      >
        <Text style={styles.buttonText}>Natrag na unos sati</Text>
      </TouchableOpacity>
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
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
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default WorkHoursList;
