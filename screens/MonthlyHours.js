import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { supabase } from '../supabaseClient';
import { BarChart } from 'react-native-chart-kit';

const MonthlyHours = ({ route, navigation }) => {
  const { userId } = route.params;
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    const fetchGroupedHours = async () => {
      const { data, error } = await supabase
        .from('work_hours')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        Alert.alert('Error', `Failed to fetch data: ${error.message}`);
        console.error('Fetch Error:', error);
        return;
      }

      const groupedData = {};
      data.forEach((item) => {
        const date = new Date(item.date);
        const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;

        if (!groupedData[monthYear]) {
          groupedData[monthYear] = {
            monthYear,
            totalHours: 0,
            totalEarnings: 0,
          };
        }

        groupedData[monthYear].totalHours += item.hours_worked;
        groupedData[monthYear].totalEarnings += item.earnings;
      });

      const formattedData = Object.values(groupedData);
      setMonthlyData(formattedData);
    };

    fetchGroupedHours();
  }, [userId]);

  const chartData = {
    labels: monthlyData.map(item => item.monthYear),
    datasets: [
      {
        data: monthlyData.map(item => item.totalEarnings),
      },
    ],
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.monthYear}</Text>
      <Text style={styles.cell}>{item.totalHours} h</Text>
      <Text style={styles.cell}>{item.totalEarnings.toFixed(2)} €</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pregled radnih sati po mjesecu</Text>
      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>Mjesec</Text>
        <Text style={styles.headerCell}>Ukupno sati</Text>
        <Text style={styles.headerCell}>Ukupna zarada</Text>
      </View>
      <FlatList
        data={monthlyData}
        keyExtractor={(item) => item.monthYear}
        renderItem={renderItem}
        ListEmptyComponent={<Text>Nema unesenih sati.</Text>}
      />
      {monthlyData.length > 0 && (
        <BarChart
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
          }}
          style={styles.chart}
        />
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('WorkHoursList', { userId })}
      >
        <Text style={styles.buttonText}>Natrag na dnevne sate</Text>
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
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#f0f0f0',
  },
  headerCell: {
    width: '30%',
    fontWeight: 'bold',
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default MonthlyHours;
