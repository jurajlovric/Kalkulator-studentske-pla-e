// screens/MonthlyHours.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { supabase } from '../supabaseClient'; // Import Supabase klijenta

const MonthlyHours = ({ route }) => {
  const { userId } = route.params;
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    // Funkcija za dohvat i grupiranje podataka po mjesecu i godini
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

      // Grupiranje podataka po mjesecu i godini
      const groupedData = {};
      data.forEach((item) => {
        const date = new Date(item.date);
        const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`; // Formatiranje kao MM-YYYY

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

      // Konvertiranje grupiranih podataka u polje za prikaz
      const formattedData = Object.values(groupedData);
      setMonthlyData(formattedData);
    };

    fetchGroupedHours();
  }, [userId]);

  // Renderiranje svakog retka tablice
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
});

export default MonthlyHours;
