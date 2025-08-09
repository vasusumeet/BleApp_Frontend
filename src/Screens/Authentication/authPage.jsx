import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
// import GoogleSignin, statusCodes from '@react-native-google-signin/google-signin';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true); // true=login, false=signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Placeholder handler for login & sign up
  const handleLogin = () => {
    // backendAPI Here
    console.log('Login pressed:', { email, password });
  };

  const handleSignup = () => {
    // backend API here
    console.log('Signup pressed:', { email, password });
  };

  // Google Sign-In placeholder
  const handleGoogleLogin = async () => {
    // TODO: Integrate Google Sign-In logic here
    console.log('Google Login pressed');
  };

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
        placeholderTextColor="#666"
        autoCapitalize='none'
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#666"
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

      {/* Google Login Button */}
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <Text style={styles.googleButtonText}>Login with Google</Text>
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
  },
  googleButton: {
    marginTop: 16,
    backgroundColor: '#DB4437', // Google's red
    padding: 13,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center'
  },
  googleButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
  }
});
