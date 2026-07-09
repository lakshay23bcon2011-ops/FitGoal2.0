import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { styled } from 'nativewind';
import { Dumbbell, Droplets, Utensils, Zap } from 'lucide-react-native';

const StyledView = styled(View);

const { width, height } = Dimensions.get('window');

export default function GymBackground({ children }: { children: React.ReactNode }) {
  return (
    <StyledView className="flex-1 bg-background-primary relative">
      {/* Glow Effects (Simulated with absolute views) */}
      <View
        style={[
          styles.glow,
          {
            top: -height * 0.1,
            left: -width * 0.1,
            backgroundColor: '#ccff00',
            opacity: 0.05
          }
        ]}
      />
      <View
        style={[
          styles.glow,
          {
            bottom: -height * 0.1,
            right: -width * 0.1,
            backgroundColor: '#ff6600',
            opacity: 0.05
          }
        ]}
      />

      {/* Floating Icons (Static for now) */}
      <View style={{ position: 'absolute', top: '15%', left: '10%', opacity: 0.03 }}>
        <Dumbbell size={80} color="#ccff00" />
      </View>
      <View style={{ position: 'absolute', top: '40%', right: '5%', opacity: 0.03 }}>
        <Zap size={60} color="#ff6600" />
      </View>
      <View style={{ position: 'absolute', bottom: '20%', left: '5%', opacity: 0.03 }}>
        <Droplets size={70} color="#00aaff" />
      </View>
      <View style={{ position: 'absolute', bottom: '10%', right: '10%', opacity: 0.03 }}>
        <Utensils size={90} color="#ff2d55" />
      </View>

      {/* Main Content */}
      <View style={{ flex: 1, zIndex: 10 }}>
        {children}
      </View>
    </StyledView>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
  },
});
