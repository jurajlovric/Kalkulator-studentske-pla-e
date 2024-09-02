import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../supabaseClient';

const SignUpScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (userCheckError && userCheckError.code !== 'PGRST116') { 
      Alert.alert('Error', `Failed to check username: ${userCheckError.message}`);
      return;
    }

    if (existingUser) {
      Alert.alert('Error', 'Username already taken');
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      Alert.alert('Sign Up Error', signUpError.message);
      return;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData?.session?.user) {
      Alert.alert('Error', 'Failed to retrieve user data after sign up.');
      console.error('Session Error:', sessionError);
      return;
    }

    const userId = sessionData.session.user.id;

    const { error: insertError } = await supabase.from('users').insert([
      {
        id: userId,
        username,
        email,
      },
    ]);

    if (insertError) {
      Alert.alert('Error', `Failed to insert user data into the database: ${insertError.message}`);
      console.error('Insert Error:', insertError);
    } else {
      Alert.alert('Success', 'User registered successfully');
      navigation.navigate('LoginScreen');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={text => setUsername(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={text => setEmail(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={text => setPassword(text)}
      />
      <Button title="Sign Up" onPress={handleSignUp} />
      <Button title="Back to Login" onPress={() => navigation.navigate('LoginScreen')} />
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
});

export default SignUpScreen;
