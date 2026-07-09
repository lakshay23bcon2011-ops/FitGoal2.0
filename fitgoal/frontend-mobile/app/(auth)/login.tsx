import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import GymBackground from '../../components/GymBackground';
import { Mail, Lock, ChevronRight } from 'lucide-react-native';
import { Link } from 'expo-router';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token, user } = response.data.data;
        await login(token, user);
      } else {
        Alert.alert('Login Failed', response.data.message || 'Invalid credentials');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Something went wrong. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GymBackground>
      <SafeAreaView className="flex-1">
        <StyledView className="flex-1 px-6 justify-center">
          <StyledView className="mb-10">
            <StyledText className="text-accent-lime text-4xl font-bold mb-2">FitGoal</StyledText>
            <StyledText className="text-text-primary text-2xl font-bold">Welcome Back, Beast</StyledText>
            <StyledText className="text-text-secondary text-sm">Sign in to continue your journey.</StyledText>
          </StyledView>

          <StyledView className="space-y-4">
            <StyledView className="bg-background-secondary border border-border rounded-2xl flex-row items-center px-4 py-4">
              <Mail size={20} color="#a0a0b0" />
              <StyledTextInput
                className="flex-1 ml-3 text-text-primary"
                placeholder="Email Address"
                placeholderTextColor="#606070"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </StyledView>

            <StyledView className="bg-background-secondary border border-border rounded-2xl flex-row items-center px-4 py-4">
              <Lock size={20} color="#a0a0b0" />
              <StyledTextInput
                className="flex-1 ml-3 text-text-primary"
                placeholder="Password"
                placeholderTextColor="#606070"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </StyledView>
          </StyledView>

          <StyledTouchableOpacity className="mt-4 self-end">
            <StyledText className="text-accent-lime text-sm font-bold">Forgot Password?</StyledText>
          </StyledTouchableOpacity>

          <StyledTouchableOpacity
            onPress={handleLogin}
            disabled={isSubmitting}
            className="bg-accent-lime py-5 rounded-2xl items-center flex-row justify-center mt-10 shadow-lg shadow-accent-lime/20"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#0a0a0f" />
            ) : (
              <>
                <StyledText className="text-background-primary font-bold text-lg">Login</StyledText>
                <ChevronRight size={20} color="#0a0a0f" className="ml-1" />
              </>
            )}
          </StyledTouchableOpacity>

          <StyledView className="flex-row justify-center mt-8">
            <StyledText className="text-text-secondary">Don't have an account? </StyledText>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <StyledText className="text-accent-lime font-bold">Sign Up</StyledText>
              </TouchableOpacity>
            </Link>
          </StyledView>
        </StyledView>
      </SafeAreaView>
    </GymBackground>
  );
}
