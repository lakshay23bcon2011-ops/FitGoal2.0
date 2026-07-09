import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Slider } from 'react-native';
import { styled } from 'nativewind';
import { Calculator, Plus, X, Brain, ChefHat, Info, ChevronRight } from 'lucide-react-native';
import GymBackground from '../../components/GymBackground';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);

export default function CalculatorScreen() {
  const [step, setStep] = useState(1);
  const [dishName, setDishName] = useState('');
  const [ingredients, setIngredients] = useState([
    { id: '1', name: 'Chicken Breast', qty: '200', unit: 'g' },
    { id: '2', name: 'Basmati Rice', qty: '1', unit: 'cup' }
  ]);
  const [oilTsp, setOilTsp] = useState(1);
  const [loading, setLoading] = useState(false);

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <StyledView className="animate-in fade-in duration-500">
            <StyledText className="text-text-primary text-xl font-bold mb-4">What are you cooking?</StyledText>
            <StyledView className="bg-background-secondary border border-border rounded-2xl px-4 py-4 mb-8">
              <StyledTextInput
                value={dishName}
                onChangeText={setDishName}
                placeholder="e.g. Homemade Chicken Curry"
                placeholderTextColor="#606070"
                className="text-text-primary text-lg"
              />
            </StyledView>

            <StyledText className="text-text-primary text-xl font-bold mb-4">Ingredients</StyledText>
            {ingredients.map((ing) => (
              <StyledView key={ing.id} className="flex-row items-center mb-3 bg-background-glass border border-border/40 p-3 rounded-2xl">
                <StyledView className="flex-1">
                  <StyledText className="text-text-primary font-medium">{ing.name}</StyledText>
                  <StyledText className="text-text-secondary text-xs">{ing.qty} {ing.unit}</StyledText>
                </StyledView>
                <StyledTouchableOpacity className="p-2">
                  <X size={18} color="#ff2d55" />
                </StyledTouchableOpacity>
              </StyledView>
            ))}

            <StyledTouchableOpacity className="flex-row items-center justify-center border border-dashed border-border py-4 rounded-2xl mb-8">
              <Plus size={20} color="#a0a0b0" />
              <StyledText className="text-text-secondary font-bold ml-2">Add Ingredient</StyledText>
            </StyledTouchableOpacity>

            <StyledTouchableOpacity
              onPress={() => setStep(2)}
              className="bg-accent-lime py-5 rounded-2xl items-center flex-row justify-center"
            >
              <StyledText className="text-background-primary font-bold text-lg">Next Step</StyledText>
              <ChevronRight size={20} color="#0a0a0f" className="ml-2" />
            </StyledTouchableOpacity>
          </StyledView>
        );
      case 2:
        return (
          <StyledView>
            <StyledText className="text-text-primary text-xl font-bold mb-2">Cooking Modifiers</StyledText>
            <StyledText className="text-text-secondary text-sm mb-6">AI uses these to refine calorie density.</StyledText>

            <StyledView className="bg-background-secondary p-6 rounded-3xl border border-border mb-8">
              <StyledView className="flex-row justify-between items-center mb-4">
                <StyledText className="text-text-primary font-bold">Oil / Ghee</StyledText>
                <StyledText className="text-accent-lime font-bold">{oilTsp} tsp</StyledText>
              </StyledView>
              {/* Note: Standard React Native doesn't have a Slider, usually use @react-native-community/slider */}
              <StyledView className="h-2 bg-background-glass rounded-full mb-8 overflow-hidden">
                <StyledView className="h-full bg-accent-lime w-[40%]" />
              </StyledView>

              <StyledText className="text-text-primary font-bold mb-4">Sauce / Gravy Level</StyledText>
              <StyledView className="flex-row justify-between">
                {['None', 'Light', 'Medium', 'Heavy'].map((lvl) => (
                  <StyledTouchableOpacity
                    key={lvl}
                    className={`px-4 py-2 rounded-xl border ${lvl === 'Medium' ? 'bg-accent-orange border-accent-orange' : 'border-border bg-background-glass'}`}
                  >
                    <StyledText className={`text-xs font-bold ${lvl === 'Medium' ? 'text-background-primary' : 'text-text-secondary'}`}>{lvl}</StyledText>
                  </StyledTouchableOpacity>
                ))}
              </StyledView>
            </StyledView>

            <StyledTouchableOpacity
              onPress={() => {
                setLoading(true);
                setTimeout(() => {
                  setLoading(false);
                  setStep(3);
                }, 2000);
              }}
              className="bg-accent-lime py-5 rounded-2xl items-center flex-row justify-center"
            >
              <Brain size={20} color="#0a0a0f" className="mr-2" />
              <StyledText className="text-background-primary font-bold text-lg">Calculate with AI</StyledText>
            </StyledTouchableOpacity>

            <StyledTouchableOpacity onPress={() => setStep(1)} className="mt-4 items-center">
              <StyledText className="text-text-secondary font-bold">Back to Ingredients</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        );
      case 3:
        return (
          <StyledView className="items-center">
            <StyledView className="bg-accent-lime/10 p-4 rounded-full mb-6">
              <Brain size={40} color="#ccff00" />
            </StyledView>
            <StyledText className="text-text-primary text-2xl font-bold mb-1">AI Calculation Ready</StyledText>
            <StyledText className="text-text-secondary text-center mb-8">Analysis complete based on Indian nutrition standards.</StyledText>

            <StyledView className="bg-background-secondary w-full p-8 rounded-[40px] border border-border mb-8">
              <StyledView className="items-center mb-6">
                <StyledText className="text-accent-lime text-5xl font-bold font-mono">542</StyledText>
                <StyledText className="text-text-secondary uppercase tracking-widest text-xs mt-1">Total Calories</StyledText>
              </StyledView>

              <StyledView className="h-px bg-border w-full mb-6" />

              <StyledView className="flex-row justify-between">
                <MacroResult label="Protein" value="42g" color="#ccff00" />
                <MacroResult label="Carbs" value="58g" color="#ff6600" />
                <MacroResult label="Fat" value="18g" color="#ff2d55" />
              </StyledView>
            </StyledView>

            <StyledTouchableOpacity className="bg-accent-lime w-full py-5 rounded-2xl items-center mb-4">
              <StyledText className="text-background-primary font-bold text-lg">Log This Meal</StyledText>
            </StyledTouchableOpacity>

            <StyledTouchableOpacity onPress={() => setStep(1)} className="w-full py-5 rounded-2xl items-center border border-border">
              <StyledText className="text-text-primary font-bold">Calculate Another</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        );
    }
  };

  return (
    <GymBackground>
      <SafeAreaView className="flex-1">
        <StyledView className="px-6 pt-6 flex-1">
          <StyledView className="flex-row items-center mb-8">
            <StyledView className="bg-accent-lime p-2 rounded-xl mr-3">
              <ChefHat size={24} color="#0a0a0f" />
            </StyledView>
            <StyledView>
              <StyledText className="text-text-primary text-2xl font-bold">AI Calculator</StyledText>
              <StyledText className="text-text-secondary text-xs">Precise Indian nutrition engine</StyledText>
            </StyledView>
          </StyledView>

          {loading ? (
            <StyledView className="flex-1 items-center justify-center">
              <StyledView className="w-20 h-20 rounded-full border-4 border-background-glass border-t-accent-lime animate-spin mb-4" />
              <StyledText className="text-text-primary font-bold text-lg">AI is thinking...</StyledText>
              <StyledText className="text-text-secondary text-sm">Estimating macros from ingredients</StyledText>
            </StyledView>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderStep()}
            </ScrollView>
          )}
        </StyledView>
      </SafeAreaView>
    </GymBackground>
  );
}

function MacroResult({ label, value, color }: any) {
  return (
    <StyledView className="items-center">
      <StyledText className="text-text-secondary text-[10px] uppercase font-bold mb-1">{label}</StyledText>
      <StyledText className="font-bold text-xl" style={{ color }}>{value}</StyledText>
    </StyledView>
  );
}
