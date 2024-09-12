import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from 'react-native';
import { supabase } from '../supabaseClient';
import { CheckBox } from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';

// Konfiguracija za notifikacije
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
    const requestNotificationPermission = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert('Permissions required', 'Enable notifications in your settings.');
        }
      }
    };

    requestNotificationPermission();

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
        placeholderTextColor="#bbb"
      />

      <View style={styles.dateContainer}>
        <Text style={styles.dateLabel}>Datum:</Text>
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
        placeholderTextColor="#bbb"
      />

      <CheckBox
        title={<Text style={styles.checkboxLabel}>Blagdan/Nedjelja/Noćni sati</Text>}
        checked={isHoliday}
        onPress={() => setIsHoliday(!isHoliday)}
        textStyle={{ color: '#000' }}
      />

      <Button title="Dodaj" onPress={handleAddHours} color="#2196F3" />
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
    color: '#fff',
  },
  input: {
    width: '80%',
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#fff',
    backgroundColor: '#000',
    color: '#fff',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateLabel: {
    marginRight: 10,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  checkboxLabel: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default WorkHoursEntry;
