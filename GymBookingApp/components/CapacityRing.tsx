import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

interface CapacityRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

/**
 * A reusable component to display live capacity.
 */
export const CapacityRing: React.FC<CapacityRingProps> = ({ 
  percentage, 
  size = 200, 
  strokeWidth = 15,
  label = 'Live Capacity' 
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 1000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const color = percentage > 85 ? '#FF4B4B' : percentage > 60 ? '#FFB800' : '#4CAF50';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.ringBase, { borderWidth: strokeWidth, borderColor: '#333' }]} />
      <Animated.View 
        style={[
          styles.ringProgress, 
          { 
            borderWidth: strokeWidth, 
            borderColor: color,
            transform: [{ rotate: '-90deg' }],
            opacity: animatedValue.interpolate({
              inputRange: [0, 100],
              outputRange: [0.3, 1]
            })
          }
        ]} 
      />
      <View style={styles.centerText}>
        <Animated.Text style={[styles.percentage, { color }]}>
          {Math.round(percentage * 100) / 100}%
        </Animated.Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ringBase: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 1000,
  },
  ringProgress: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    borderStyle: 'solid',
  },
  centerText: {
    alignItems: 'center',
  },
  percentage: {
    fontSize: 42,
    fontWeight: '800',
    fontFamily: 'System',
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
