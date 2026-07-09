import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { styled } from 'nativewind';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import GymBackground from '../../components/GymBackground';
import { Mail, Lock, User as UserIcon, ChevronRight, Weight, ArrowRight } from 'lucide-react-native';
import { Link, useRouter } from 'expo-router';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function RegisterScreen() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    weight: '',
    height: '',
    gender: 'male',
    goal: 'maintain',
    activityLevel: 'moderate'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/register', {
        ...formData,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height)
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        await login(token, user);
      } else {
        Alert.alert('Registration Failed', response.data.message);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.email || !formData.password)) {
      Alert.alert('Error', 'Please fill in basic details');
      return;
    }
    setStep(step + 1);
  };

  return (
    <GymBackground>
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-10">
          <StyledView className="mb-8">
            <StyledText className="text-accent-lime text-4xl font-bold mb-2">FitGoal</StyledText>
            <StyledText className="text-text-primary text-2xl font-bold">Join the Pack</StyledText>
            <StyledText className="text-text-secondary text-sm">Step {step} of 2: {step === 1 ? 'Credentials' : 'Physical Stats'}</StyledText>
          </StyledView>

          {step === 1 ? (
            <StyledView className="space-y-4">
              <InputGroup icon={<UserIcon size={20} color="#a0a0b0" />} placeholder="Full Name" value={formData.name} onChange={(val) => setFormData({...formData, name: val})} />
              <InputGroup icon={<Mail size={20} color="#a0a0b0" />} placeholder="Email Address" value={formData.email} onChange={(val) => setFormData({...formData, email: val})} keyboardType="email-address" />
              <InputGroup icon={<Lock size={20} color="#a0a0b0" />} placeholder="Password" value={formData.password} onChange={(val) => setFormData({...formData, password: val})} secureTextEntry />

              <StyledTouchableOpacity onPress={nextStep} className="bg-accent-lime py-5 rounded-2xl items-center flex-row justify-center mt-6">
                <StyledText className="text-background-primary font-bold text-lg">Next</StyledText>
                <ArrowRight size={20} color="#0a0a0f" className="ml-2" />
              </StyledTouchableOpacity>
            </StyledView>
          ) : (
            <StyledView className="space-y-4">
              <InputGroup icon={<Weight size={20} color="#a0a0b0" />} placeholder="Weight (kg)" value={formData.weight} onChange={(val) => setFormData({...formData, weight: val})} keyboardType="numeric" />
              <InputGroup icon={<UserIcon size={20} color="#a0a0b0" />} placeholder="Height (cm)" value={formData.height} onChange={(val) => setFormData({...formData, height: val})} keyboardType="numeric" />
              <InputGroup icon={<UserIcon size={20} color="#a0a0b0" />} placeholder="Age" value={formData.age} onChange={(val) => setFormData({...formData, age: val})} keyboardType="numeric" />

              <StyledTouchableOpacity onPress={handleRegister} disabled={isSubmitting} className="bg-accent-lime py-5 rounded-2xl items-center flex-row justify-center mt-6">
                {isSubmitting ? <ActivityIndicator color="#0a0a0f" /> : <StyledText className="text-background-primary font-bold text-lg">Finish & Calculate Targets</StyledText>}
              </StyledTouchableOpacity>

              <StyledTouchableOpacity onPress={() => setStep(1)} className="mt-4 items-center">
                <StyledText className="text-text-secondary font-bold">Back</StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          )}

          <StyledView className="flex-row justify-center mt-8">
            <StyledText className="text-text-secondary">Already have an account? </StyledText>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <StyledText className="text-accent-lime font-bold">Log In</StyledText>
              </TouchableOpacity>
            </Link>
          </StyledView>
        </ScrollView>
      </SafeAreaView>
    </GymBackground>
  );
}

function InputGroup({ icon, placeholder, value, onChange, ...props }: any) {
  return (
    <StyledView className="bg-background-secondary border border-border rounded-2xl flex-row items-center px-4 py-4 mb-4">
      {icon}
      <StyledTextInput
        className="flex-1 ml-3 text-text-primary"
        placeholder={placeholder}
        placeholderTextColor="#606070"
        value={value}
        onChangeText={onChange}
        {...props}
      />
    </StyledView>
  );
}
