import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Animated, ImageBackground } from 'react-native';
import WorkHoursEntry from './WorkHoursEntry';
import { supabase } from '../supabaseClient';
import { DeviceMotion } from 'expo-sensors'; 

const DashboardScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [position, setPosition] = useState(new Animated.ValueXY({ x: 0, y: 0 }));

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching user:', error);
      } else if (data.session) {
        setUser(data.session.user);
      }
    };

    fetchUser();

    const subscription = DeviceMotion.addListener((motion) => {
      const { x, y } = motion.accelerationIncludingGravity;

      Animated.spring(position, {
        toValue: { x: x * 10, y: y * 10 },
        useNativeDriver: true,
      }).start();
    });

    return () => {
      subscription.remove();
    };
  }, [position]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert('Error', `Failed to log out: ${error.message}`);
    } else {
      Alert.alert('Success', 'Logged out successfully');
      navigation.navigate('LoginScreen');
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Učitavanje korisnika...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.animatedContainer, { transform: position.getTranslateTransform() }]}>
        <ImageBackground
          source={require('../assets/background.png')}
          style={styles.background}
          resizeMode="cover"
        >
          <Text style={styles.title}>Kalkulator studentske place</Text>
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
        </ImageBackground>
      </Animated.View>
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
  animatedContainer: {
    flex: 1,
    width: '100%',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;
