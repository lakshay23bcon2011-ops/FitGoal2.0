import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { styled } from 'nativewind';
import { Settings, User, Target, Activity, Droplets, LogOut, ChevronRight, Award } from 'lucide-react-native';
import GymBackground from '../../components/GymBackground';
import { useAuth } from '../../context/AuthContext';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  if (!user) return null;

  return (
    <GymBackground>
      <SafeAreaView className="flex-1">
        <ScrollView className="px-6 pt-6" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <StyledView className="flex-row justify-between items-center mb-8">
            <StyledText className="text-text-primary text-3xl font-bold">Profile</StyledText>
            <StyledTouchableOpacity className="bg-background-secondary p-2 rounded-xl border border-border">
              <Settings size={20} color="#ffffff" />
            </StyledTouchableOpacity>
          </StyledView>

          {/* Profile Info */}
          <StyledView className="items-center mb-8">
            <StyledView className="w-24 h-24 rounded-full border-2 border-accent-lime p-1 mb-4">
              <StyledView className="w-full h-full rounded-full bg-background-secondary items-center justify-center overflow-hidden">
                <User size={48} color="#a0a0b0" />
              </StyledView>
            </StyledView>
            <StyledText className="text-text-primary text-2xl font-bold">{user.name}</StyledText>
            <StyledText className="text-text-secondary text-sm">{user.email}</StyledText>

            <StyledView className="flex-row mt-4">
              <StyledView className="bg-accent-lime/10 px-4 py-1 rounded-full border border-accent-lime/20 flex-row items-center mr-2">
                <Award size={14} color="#ccff00" />
                <StyledText className="text-accent-lime text-xs font-bold ml-1">Elite Tier</StyledText>
              </StyledView>
              <StyledView className="bg-background-secondary px-4 py-1 rounded-full border border-border">
                <StyledText className="text-text-secondary text-xs font-bold">Lvl 24</StyledText>
              </StyledView>
            </StyledView>
          </StyledView>

          {/* Stats Row */}
          <StyledView className="flex-row justify-between mb-8">
            <ProfileStat label="Weight" value={user.weight || '--'} unit="kg" />
            <ProfileStat label="Height" value={user.height || '--'} unit="cm" />
            <ProfileStat label="Age" value={user.age || '--'} unit="yrs" />
          </StyledView>

          {/* Settings Groups */}
          <StyledText className="text-text-primary font-bold text-xl mb-4">My Goals</StyledText>
          <StyledView className="bg-background-secondary rounded-3xl border border-border mb-8 overflow-hidden">
            <ProfileMenuItem
              icon={<Target size={20} color="#ccff00" />}
              label="Fitness Goal"
              value={user.goal?.toUpperCase() || 'Not Set'}
            />
            <ProfileMenuItem
              icon={<Activity size={20} color="#ff6600" />}
              label="Activity Level"
              value={user.activityLevel?.replace('_', ' ').toUpperCase() || 'Not Set'}
            />
            <ProfileMenuItem
              icon={<Droplets size={20} color="#3b82f6" />}
              label="Water Target"
              value={`${(user.targetWater / 1000).toFixed(1)} Liters`}
              isLast
            />
          </StyledView>

          <StyledText className="text-text-primary font-bold text-xl mb-4">Account</StyledText>
          <StyledView className="bg-background-secondary rounded-3xl border border-border mb-10 overflow-hidden">
            <ProfileMenuItem
              icon={<User size={20} color="#ffffff" />}
              label="Edit Profile"
            />
            <StyledTouchableOpacity onPress={handleLogout} className="flex-row items-center justify-between p-5 active:bg-red-500/5">
              <StyledView className="flex-row items-center">
                <StyledView className="bg-red-500/10 p-2 rounded-xl mr-4">
                  <LogOut size={20} color="#ff2d55" />
                </StyledView>
                <StyledText className="text-accent-red font-bold">Logout</StyledText>
              </StyledView>
            </StyledTouchableOpacity>
          </StyledView>

          <StyledView className="h-10" />
        </ScrollView>
      </SafeAreaView>
    </GymBackground>
  );
}

function ProfileStat({ label, value, unit }: any) {
  return (
    <StyledView className="bg-background-secondary p-4 rounded-3xl border border-border w-[31%] items-center">
      <StyledText className="text-text-secondary text-[10px] uppercase font-bold mb-1">{label}</StyledText>
      <StyledView className="flex-row items-baseline">
        <StyledText className="text-text-primary font-bold text-xl">{value}</StyledText>
        <StyledText className="text-text-secondary text-[10px] ml-0.5">{unit}</StyledText>
      </StyledView>
    </StyledView>
  );
}

function ProfileMenuItem({ icon, label, value, isLast }: any) {
  return (
    <StyledTouchableOpacity className={`flex-row items-center justify-between p-5 active:bg-white/5 ${!isLast ? 'border-b border-border' : ''}`}>
      <StyledView className="flex-row items-center">
        <StyledView className="bg-background-glass p-2 rounded-xl mr-4">
          {icon}
        </StyledView>
        <StyledText className="text-text-primary font-medium">{label}</StyledText>
      </StyledView>
      <StyledView className="flex-row items-center">
        {value && <StyledText className="text-text-secondary mr-2">{value}</StyledText>}
        <ChevronRight size={18} color="#606070" />
      </StyledView>
    </StyledTouchableOpacity>
  );
}
