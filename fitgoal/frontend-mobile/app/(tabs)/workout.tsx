import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { styled } from 'nativewind';
import { Dumbbell, Plus, Play, History, Trophy, Clock, Zap } from 'lucide-react-native';
import GymBackground from '../../components/GymBackground';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function WorkoutScreen() {
  const [activeTab, setActiveTab] = useState('Track');

  return (
    <GymBackground>
      <SafeAreaView className="flex-1">
        <StyledView className="px-4 pt-6">
          <StyledText className="text-text-primary text-3xl font-bold mb-6">Train Hard</StyledText>

          <StyledView className="flex-row bg-background-secondary p-1 rounded-2xl border border-border mb-8">
            <StyledTouchableOpacity
              onPress={() => setActiveTab('Track')}
              className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'Track' ? 'bg-accent-orange' : ''}`}
            >
              <StyledText className={`font-bold ${activeTab === 'Track' ? 'text-background-primary' : 'text-text-secondary'}`}>Track</StyledText>
            </StyledTouchableOpacity>
            <StyledTouchableOpacity
              onPress={() => setActiveTab('Plans')}
              className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'Plans' ? 'bg-accent-orange' : ''}`}
            >
              <StyledText className={`font-bold ${activeTab === 'Plans' ? 'text-background-primary' : 'text-text-secondary'}`}>AI Plans</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>

        <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
          {activeTab === 'Track' ? (
            <>
              {/* Quick Stats */}
              <StyledView className="flex-row justify-between mb-8">
                <StatCard icon={<History size={16} color="#ff6600" />} label="Sessions" value="24" />
                <StatCard icon={<Trophy size={16} color="#ccff00" />} label="Streak" value="5" />
                <StatCard icon={<Zap size={16} color="#ff2d55" />} label="Volume" value="12.5k" />
              </StyledView>

              <StyledText className="text-text-primary font-bold text-xl mb-4">Current Session</StyledText>

              <StyledTouchableOpacity className="bg-accent-orange p-6 rounded-[32px] items-center justify-center mb-6 flex-row active:scale-95 transition-all">
                <Play size={24} color="#0a0a0f" fill="#0a0a0f" />
                <StyledText className="text-background-primary font-bold text-xl ml-3">Start New Workout</StyledText>
              </StyledTouchableOpacity>

              <StyledText className="text-text-primary font-bold text-xl mb-4">Recent History</StyledText>

              <WorkoutHistoryItem
                title="Push Day - Hypertrophy"
                date="Yesterday"
                duration="65 min"
                exercises="6 Exercises"
              />
              <WorkoutHistoryItem
                title="Leg Day - Destroyer"
                date="3 days ago"
                duration="80 min"
                exercises="5 Exercises"
              />
            </>
          ) : (
            <StyledView className="items-center py-10">
              <StyledView className="bg-background-glass p-8 rounded-full mb-6">
                <Zap size={60} color="#ff6600" />
              </StyledView>
              <StyledText className="text-text-primary text-2xl font-bold text-center mb-2">AI Workout Architect</StyledText>
              <StyledText className="text-text-secondary text-center mb-8 px-6">
                Generate a custom training program based on your goals, equipment, and schedule.
              </StyledText>

              <StyledTouchableOpacity className="bg-background-secondary border border-accent-orange/30 px-8 py-4 rounded-2xl w-full items-center active:bg-accent-orange/10">
                <StyledText className="text-accent-orange font-bold text-lg">Generate My Plan</StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          )}

          <StyledView className="h-10" />
        </ScrollView>
      </SafeAreaView>
    </GymBackground>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <StyledView className="bg-background-secondary p-4 rounded-3xl border border-border w-[31%] items-center">
      <StyledView className="mb-2">{icon}</StyledView>
      <StyledText className="text-text-primary font-bold text-lg">{value}</StyledText>
      <StyledText className="text-text-secondary text-[10px] uppercase font-bold tracking-tighter">{label}</StyledText>
    </StyledView>
  );
}

function WorkoutHistoryItem({ title, date, duration, exercises }: any) {
  return (
    <StyledTouchableOpacity className="bg-background-secondary p-5 rounded-3xl border border-border mb-4 flex-row justify-between items-center active:opacity-80">
      <StyledView>
        <StyledText className="text-text-primary font-bold text-lg mb-1">{title}</StyledText>
        <StyledView className="flex-row items-center">
          <StyledText className="text-text-secondary text-xs">{date}</StyledText>
          <StyledText className="text-text-secondary text-xs mx-2">•</StyledText>
          <Clock size={12} color="#a0a0b0" className="mr-1" />
          <StyledText className="text-text-secondary text-xs">{duration}</StyledText>
        </StyledView>
      </StyledView>
      <StyledView className="items-end">
        <StyledText className="text-accent-orange font-bold text-sm">{exercises}</StyledText>
        <Plus size={20} color="#a0a0b0" className="mt-1" />
      </StyledView>
    </StyledTouchableOpacity>
  );
}
