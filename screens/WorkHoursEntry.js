// screens/WorkHoursEntry.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from 'react-native';
import { supabase } from '../supabaseClient'; // Import Supabase klijenta
import { CheckBox } from 'react-native-elements'; // Import Checkbox
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker
import * as Notifications from 'expo-notifications'; // Import za notifikacije

// Postavljanje konfiguracije za prikaz notifikacija
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const WorkHoursEntry = ({ userId, navigation }) => {
  const [hourlyRate, setHourlyRate] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hoursWorked, setHoursWorked] = useState('');
  const [isHoliday, setIsHoliday] = useState(false);
  const [averageEarnings, setAverageEarnings] = useState(0);

  useEffect(() => {
    // Funkcija za traženje dozvole za notifikacije
    const requestNotificationPermission = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert('Permissions required', 'Enable notifications in your settings.');
        }
      }
    };

    // Pozivanje funkcije za traženje dozvole
    requestNotificationPermission();

    // Dohvati prosječnu zaradu korisnika
    const fetchAverageEarnings = async () => {
      const { data, error } = await supabase
        .from('work_hours')
        .select('earnings')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching earnings:', error);
      } else {
        const totalEarnings = data.reduce((sum, record) => sum + record.earnings, 0);
        const avg = data.length ? totalEarnings / data.length : 0;
        setAverageEarnings(avg);
      }
    };

    fetchAverageEarnings();
  }, [userId]);

  // Funkcija za slanje obavijesti
  const sendNotification = async (message) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Obavijest o zaradi',
        body: message,
      },
      trigger: null,
    });
  };

  const handleAddHours = async () => {
    if (!hourlyRate || !hoursWorked) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    let adjustedRate = parseFloat(hourlyRate);
    if (isHoliday) {
      adjustedRate *= 1.5;
    }

    const earnings = adjustedRate * parseFloat(hoursWorked);

    const { error } = await supabase.from('work_hours').insert([
      {
        user_id: userId,
        hourly_rate: adjustedRate,
        date: date.toISOString().split('T')[0],
        hours_worked: parseFloat(hoursWorked),
        holiday_hours: isHoliday ? 1 : 0,
        earnings,
      },
    ]);

    if (error) {
      Alert.alert('Error', `Failed to add work hours: ${error.message}`);
      console.error('Insert Error:', error);
    } else {
      Alert.alert('Success', 'Work hours added successfully');
      navigation.navigate('WorkHoursList', { userId });

      // Provjeri je li trenutna zarada iznad ili ispod prosjeka i pošalji notifikaciju
      if (earnings > averageEarnings) {
        sendNotification(`Današnja zarada je iznad prosjeka: ${earnings.toFixed(2)} €`);
      } else if (earnings < averageEarnings) {
        sendNotification(`Današnja zarada je ispod prosjeka: ${earnings.toFixed(2)} €`);
      }
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unos dnevne satnice</Text>
      <TextInput
        style={styles.input}
        placeholder="Satnica"
        keyboardType="numeric"
        value={hourlyRate}
        onChangeText={setHourlyRate}
      />

      <View style={styles.dateContainer}>
        <Text style={styles.label}>Datum:</Text>
        <Button title={date.toLocaleDateString()} onPress={showDatepicker} />
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Količina sati odrađena"
        keyboardType="numeric"
        value={hoursWorked}
        onChangeText={setHoursWorked}
      />

      <CheckBox
        title={<Text>Blagdan/Nedjelja/Noćni sati</Text>}
        checked={isHoliday}
        onPress={() => setIsHoliday(!isHoliday)}
      />

      <Button title="Dodaj" onPress={handleAddHours} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderRadius: 5,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    marginRight: 10,
  },
});

export default WorkHoursEntry;
