// screens/WorkHoursEntry.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from 'react-native';
import { supabase } from '../supabaseClient'; // Import Supabase klijenta
import { CheckBox } from 'react-native-elements'; // Import Checkbox
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker

const WorkHoursEntry = ({ userId, navigation }) => {
  const [hourlyRate, setHourlyRate] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hoursWorked, setHoursWorked] = useState('');
  const [isHoliday, setIsHoliday] = useState(false);

  const handleAddHours = async () => {
    if (!hourlyRate || !hoursWorked) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Povećaj satnicu za 50% ako su sati odrađeni u posebnim uvjetima
    let adjustedRate = parseFloat(hourlyRate);
    if (isHoliday) {
      adjustedRate *= 1.5;
    }

    const earnings = adjustedRate * parseFloat(hoursWorked);

    // Unos podataka u bazu Supabase
    const { error } = await supabase.from('work_hours').insert([
      {
        user_id: userId,
        hourly_rate: adjustedRate,
        date: date.toISOString().split('T')[0], // Spremanje datuma u formatu YYYY-MM-DD
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
    }
  };

  // Funkcija za otvaranje date picker-a
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
        title="Blagdan/Nedjelja/Noćni sati"
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
