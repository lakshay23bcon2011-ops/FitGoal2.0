import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { Flame, Droplets, Utensils, Dumbbell } from 'lucide-react-native';
import GymBackground from '../../components/GymBackground';
import { useAuth } from '../../context/AuthContext';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function Dashboard() {
  const { user } = useAuth();

  // Fallback values if user data is still loading or incomplete
  const targets = {
    calories: user?.targetCalories || 2000,
    protein: user?.targetProtein || 150,
    carbs: user?.targetCarbs || 200,
    fat: user?.targetFat || 60,
  };

  // Mock data for "Consumed" (This would usually come from a 'useQuery' hook calling /api/foodlog)
  const consumed = {
    calories: 680,
    protein: 45,
    carbs: 82,
    fat: 22,
  };

  const remainingCalories = targets.calories - consumed.calories;

  return (
    <GymBackground>
      <SafeAreaView className="flex-1">
        <ScrollView className="px-4 py-6" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <StyledView className="flex-row justify-between items-center mb-8">
            <StyledView>
              <StyledText className="text-text-secondary text-sm">Welcome back,</StyledText>
              <StyledText className="text-text-primary text-3xl font-bold">{user?.name.split(' ')[0] || 'Warrior'}</StyledText>
            </StyledView>
            <StyledView className="bg-background-secondary px-3 py-1.5 rounded-full border border-border flex-row items-center">
              <Flame size={18} color="#ccff00" />
              <StyledText className="text-accent-lime font-bold ml-1.5">12 Days</StyledText>
            </StyledView>
          </StyledView>

          {/* Calorie Ring Section */}
          <StyledView className="bg-background-glass p-8 rounded-[40px] border border-border items-center justify-center mb-8">
            <StyledView className="w-56 h-56 rounded-full border-[10px] border-background-glass items-center justify-center relative">
              <StyledView
                className="absolute w-full h-full rounded-full border-[10px] border-accent-lime"
                style={{
                  borderRightColor: 'transparent',
                  borderBottomColor: 'transparent',
                  opacity: 0.8,
                  transform: [{ rotate: `${(consumed.calories / targets.calories) * 360}deg` }]
                }}
              />

              <StyledText className="text-text-primary text-5xl font-bold font-mono tracking-tighter">{remainingCalories}</StyledText>
              <StyledText className="text-text-secondary text-sm uppercase tracking-widest mt-1">kcal left</StyledText>
            </StyledView>

            <StyledView className="flex-row justify-between w-full mt-8 px-2">
              <StyledView className="items-center">
                <StyledText className="text-text-primary font-bold">{targets.calories}</StyledText>
                <StyledText className="text-text-secondary text-[10px] uppercase">Goal</StyledText>
              </StyledView>
              <StyledView className="items-center">
                <StyledText className="text-text-primary font-bold">{consumed.calories}</StyledText>
                <StyledText className="text-text-secondary text-[10px] uppercase">Eaten</StyledText>
              </StyledView>
              <StyledView className="items-center">
                <StyledText className="text-text-primary font-bold">0</StyledText>
                <StyledText className="text-text-secondary text-[10px] uppercase">Burned</StyledText>
              </StyledView>
            </StyledView>
          </StyledView>

          {/* Macros Grid */}
          <StyledView className="flex-row justify-between mb-8">
            <MacroCard
              label="Protein"
              value={`${consumed.protein}g`}
              target={`${targets.protein}g`}
              color="bg-accent-lime"
              progress={consumed.protein / targets.protein}
            />
            <MacroCard
              label="Carbs"
              value={`${consumed.carbs}g`}
              target={`${targets.carbs}g`}
              color="bg-accent-orange"
              progress={consumed.carbs / targets.carbs}
            />
            <MacroCard
              label="Fat"
              value={`${consumed.fat}g`}
              target={`${targets.fat}g`}
              color="bg-accent-red"
              progress={consumed.fat / targets.fat}
            />
          </StyledView>

          {/* Water Tracker */}
          <StyledTouchableOpacity className="bg-background-secondary p-5 rounded-3xl border border-border mb-8 active:opacity-80">
            <StyledView className="flex-row justify-between items-center mb-5">
              <StyledView className="flex-row items-center">
                <StyledView className="bg-blue-500/20 p-2 rounded-xl mr-3">
                  <Droplets size={20} color="#3b82f6" />
                </StyledView>
                <StyledView>
                  <StyledText className="text-text-primary font-bold text-lg">Water Intake</StyledText>
                  <StyledText className="text-text-secondary text-xs">Stay hydrated, king</StyledText>
                </StyledView>
              </StyledView>
              <StyledText className="text-text-primary font-bold text-lg">1.2<StyledText className="text-text-secondary text-sm"> / {(user?.targetWater / 1000).toFixed(1) || '3.5'}L</StyledText></StyledText>
            </StyledView>
            <StyledView className="h-2.5 bg-background-glass rounded-full overflow-hidden">
              <StyledView className="h-full bg-blue-500 w-[35%] rounded-full" />
            </StyledView>
          </StyledTouchableOpacity>

          {/* Quick Actions */}
          <StyledView className="mb-6">
            <StyledText className="text-text-primary font-bold text-xl mb-4 ml-1">Quick Actions</StyledText>
            <StyledView className="flex-row flex-wrap justify-between">
              <QuickAction
                label="Log Meal"
                icon={<Utensils size={24} color="#0a0a0f" />}
                color="bg-accent-lime"
                desc="Add your fuel"
              />
              <QuickAction
                label="Workout"
                icon={<Dumbbell size={24} color="#0a0a0f" />}
                color="bg-accent-orange"
                desc="Track progress"
              />
            </StyledView>
          </StyledView>

          <StyledView className="h-10" />
        </ScrollView>
      </SafeAreaView>
    </GymBackground>
  );
}

function MacroCard({ label, value, target, color, progress }: any) {
  return (
    <StyledView className="bg-background-secondary p-4 rounded-3xl border border-border w-[31%]">
      <StyledText className="text-text-secondary text-[10px] uppercase font-bold tracking-tighter mb-1">{label}</StyledText>
      <StyledText className="text-text-primary font-bold text-base mb-3">{value}</StyledText>
      <StyledView className="h-1.5 bg-background-glass rounded-full overflow-hidden">
        <StyledView className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(1, progress) * 100}%` }} />
      </StyledView>
    </StyledView>
  );
}

function QuickAction({ label, icon, color, desc }: any) {
  return (
    <StyledTouchableOpacity className={`${color} p-5 rounded-[32px] w-[48%] mb-4 active:scale-95 transition-all`}>
      <StyledView className="bg-background-primary/20 self-start p-2 rounded-xl mb-3">
        {icon}
      </StyledView>
      <StyledText className="text-background-primary font-bold text-lg">{label}</StyledText>
      <StyledText className="text-background-primary/70 text-[10px] font-medium uppercase tracking-wider">{desc}</StyledText>
    </StyledTouchableOpacity>
  );
}
