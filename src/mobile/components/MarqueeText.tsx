import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

interface MarqueeTextProps {
  text: string;
  speed?: number;
  style?: any;
  textStyle?: any;
  containerStyle?: any;
}

const MarqueeText: React.FC<MarqueeTextProps> = ({
  text,
  speed = 80,
  style,
  textStyle,
  containerStyle,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;
  const textWidth = text.length * 9; // Approximate character width
  const containerWidth = screenWidth - 32; // Account for padding

  useEffect(() => {
    const startAnimation = () => {
      // Reset position
      translateX.setValue(containerWidth);
      
      // Animate from right to left
      Animated.timing(translateX, {
        toValue: -textWidth,
        duration: ((containerWidth + textWidth) / speed) * 1000,
        useNativeDriver: true,
      }).start(() => {
    
        startAnimation();
      });
    };

    startAnimation();
  }, [text, speed, textWidth, containerWidth]);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.marqueeContainer, style]}>
        <Animated.Text
          style={[
            styles.marqueeText,
            textStyle,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          {text}
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f0f8ff',
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    borderRadius: 8,
  
  },
  marqueeContainer: {
    height: 20,
    justifyContent: 'center',
  },
  marqueeText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
    // whiteSpace: 'nowrap',
  },
});

export default MarqueeText;


