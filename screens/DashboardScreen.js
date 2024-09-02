// screens/DashboardScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import WorkHoursEntry from './WorkHoursEntry'; // Import forme za unos sati
import { supabase } from '../supabaseClient'; // Import Supabase klijenta

const DashboardScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      // Dohvati trenutnu sesiju korisnika
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching user:', error);
      } else if (data.session) {
        setUser(data.session.user); // Postavljanje korisnika iz sesije
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert('Error', `Failed to log out: ${error.message}`);
    } else {
      Alert.alert('Success', 'Logged out successfully');
      navigation.navigate('LoginScreen'); // Preusmjeravanje na ekran za prijavu
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Učitavanje korisnika...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ulogirali ste se</Text>
      <WorkHoursEntry userId={user.id} navigation={navigation} />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('WorkHoursList', { userId: user.id })}
      >
        <Text style={styles.buttonText}>Prikaži unesene sate</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Odjava</Text>
      </TouchableOpacity>
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
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default DashboardScreen;
