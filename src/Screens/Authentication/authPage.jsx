import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true); // true=login, false=signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Placeholder handler for login & sign up
  const handleLogin = () => {
    // TODO: Implement backend API integration
    console.log('Login pressed:', { email, password });
  };

  const handleSignup = () => {
    // TODO: Implement backend API integration
    console.log('Signup pressed:', { email, password });
  };

  // Clear fields when switching
  const handleSwitch = () => {
    setIsLogin((prev) => !prev);
    setEmail('');
    setPassword('');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{isLogin ? 'Login' : 'Sign Up'}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize='none'
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={isLogin ? handleLogin : handleSignup}
      >
        <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Sign Up'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSwitch}>
        <Text style={styles.switchText}>
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff'
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#bbb',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9'
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginVertical: 16,
    width: '100%',
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
  },
  switchText: {
    color: '#007AFF',
    marginTop: 4,
    fontSize: 15
  }
});
