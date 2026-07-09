import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { styled } from 'nativewind';
import { Search, Plus, Trash2, ChevronRight, Clock } from 'lucide-react-native';
import GymBackground from '../../components/GymBackground';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);

const MOCK_LOGGED_FOODS = [
  { id: '1', name: 'Dal Makhani', calories: 350, protein: 12, carbs: 45, fat: 15, time: '08:30 AM', type: 'Breakfast' },
  { id: '2', name: 'Roti (2 pcs)', calories: 200, protein: 6, carbs: 40, fat: 2, time: '08:35 AM', type: 'Breakfast' },
  { id: '3', name: 'Butter Chicken', calories: 450, protein: 35, carbs: 10, fat: 30, time: '01:30 PM', type: 'Lunch' },
];

export default function MealsScreen() {
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  return (
    <GymBackground>
      <SafeAreaView className="flex-1">
        <StyledView className="px-4 pt-6 pb-2">
          <StyledText className="text-text-primary text-3xl font-bold mb-6">Meal Log</StyledText>

          {/* Search Bar */}
          <StyledView className="bg-background-secondary border border-border rounded-2xl flex-row items-center px-4 py-3 mb-6">
            <Search size={20} color="#a0a0b0" />
            <StyledTextInput
              placeholder="Search Indian foods..."
              placeholderTextColor="#606070"
              className="flex-1 ml-3 text-text-primary text-base"
            />
          </StyledView>

          {/* Category Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            {tabs.map((tab) => (
              <StyledTouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`mr-3 px-6 py-2.5 rounded-full border ${activeTab === tab ? 'bg-accent-lime border-accent-lime' : 'bg-background-secondary border-border'}`}
              >
                <StyledText className={`font-bold ${activeTab === tab ? 'text-background-primary' : 'text-text-secondary'}`}>
                  {tab}
                </StyledText>
              </StyledTouchableOpacity>
            ))}
          </ScrollView>
        </StyledView>

        <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
          {MOCK_LOGGED_FOODS.map((food) => (
            <StyledView key={food.id} className="bg-background-secondary p-5 rounded-3xl border border-border mb-4">
              <StyledView className="flex-row justify-between items-start mb-3">
                <StyledView className="flex-1">
                  <StyledView className="flex-row items-center mb-1">
                    <StyledText className="text-text-primary font-bold text-lg">{food.name}</StyledText>
                    <StyledView className="bg-background-glass px-2 py-0.5 rounded-md ml-2">
                      <StyledText className="text-text-secondary text-[10px] uppercase font-bold">{food.type}</StyledText>
                    </StyledView>
                  </StyledView>
                  <StyledView className="flex-row items-center">
                    <Clock size={12} color="#a0a0b0" />
                    <StyledText className="text-text-secondary text-xs ml-1">{food.time}</StyledText>
                  </StyledView>
                </StyledView>
                <StyledText className="text-accent-lime font-bold text-lg">{food.calories} <StyledText className="text-text-secondary text-xs">kcal</StyledText></StyledText>
              </StyledView>

              <StyledView className="flex-row items-center justify-between pt-3 border-t border-border/50">
                <MacroSmall label="P" value={`${food.protein}g`} color="text-accent-lime" />
                <MacroSmall label="C" value={`${food.carbs}g`} color="text-accent-orange" />
                <MacroSmall label="F" value={`${food.fat}g`} color="text-accent-red" />
                <StyledTouchableOpacity className="bg-red-500/10 p-2 rounded-xl">
                  <Trash2 size={16} color="#ff2d55" />
                </StyledTouchableOpacity>
              </StyledView>
            </StyledView>
          ))}

          <StyledTouchableOpacity className="border-2 border-dashed border-border p-6 rounded-3xl items-center justify-center mb-10">
            <StyledView className="bg-accent-lime/20 p-3 rounded-full mb-2">
              <Plus size={24} color="#ccff00" />
            </StyledView>
            <StyledText className="text-text-primary font-bold">Add Another Meal</StyledText>
            <StyledText className="text-text-secondary text-xs mt-1">Track what you eat, king</StyledText>
          </StyledTouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </GymBackground>
  );
}

function MacroSmall({ label, value, color }: any) {
  return (
    <StyledView className="flex-row items-center">
      <StyledText className="text-text-secondary text-xs mr-1">{label}:</StyledText>
      <StyledText className={`${color} font-bold text-sm`}>{value}</StyledText>
    </StyledView>
  );
}
