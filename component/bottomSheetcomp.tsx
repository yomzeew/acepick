import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DraggablePanelProps {
  children: React.ReactNode;
  backgroundColor?: string;
  minHeightPercentage?: number;
  maxHeightPercentage?: number;
  showHandle?: boolean;
  handleColor?: string;
  style?: object;
  onHeightChange?: (height: number) => void;
}

const DraggablePanel: React.FC<DraggablePanelProps> = ({
  children,
  backgroundColor = 'white',
  minHeightPercentage = 40,
  maxHeightPercentage = 80,
  showHandle = true,
  handleColor = '#DDD',
  style = {},
  onHeightChange = () => {},
}) => {
  // Calculate min and max heights
  const MIN_HEIGHT = SCREEN_HEIGHT * (minHeightPercentage / 100);
  const MAX_HEIGHT = SCREEN_HEIGHT * (maxHeightPercentage / 100);

  // Animated value for smooth transitions
  const panelHeight = useRef(new Animated.Value(MIN_HEIGHT)).current;

  const [containerHeight, setContainerHeight] = useState(MIN_HEIGHT);
  const [startTouchY, setStartTouchY] = useState<number | null>(null);

  // Function to animate the panel height
  const animatePanel = useCallback((toValue: number) => {
    Animated.timing(panelHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false, // Important for height animations
    }).start(() => {
      setContainerHeight(toValue);
      onHeightChange?.(toValue);
    });
  }, []);

  const DRAGGABLE_AREA_HEIGHT = 50; // Allow dragging only in the top 50px

  // PanResponder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (event, gestureState) => {
        const touchY = event.nativeEvent.locationY;
        setStartTouchY(touchY);
        return touchY <= DRAGGABLE_AREA_HEIGHT; // Only respond if touch is in the top 50 pixels
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return startTouchY !== null && startTouchY <= DRAGGABLE_AREA_HEIGHT && Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        let newHeight = containerHeight - gestureState.dy;
  
        // Clamp the height within min and max limits
        if (newHeight < MIN_HEIGHT) newHeight = MIN_HEIGHT;
        if (newHeight > MAX_HEIGHT) newHeight = MAX_HEIGHT;
  
        panelHeight.setValue(newHeight); // Update animated value
      },
      onPanResponderRelease: (_, gestureState) => {
        const isDraggedUp = gestureState.dy < 0;
        const targetHeight = isDraggedUp ? MAX_HEIGHT : MIN_HEIGHT;
        animatePanel(targetHeight);
        setStartTouchY(null);
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: panelHeight,
          backgroundColor,
        },
        style,
      ]}
      {...panResponder.panHandlers}
    >
      {/* Drag Handle */}
      {showHandle && (
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: handleColor }]} />
        </View>
      )}

      {/* Content */}
      <View style={styles.contentContainer}>{children}</View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  handleContainer: {
    height: 10, // Ensure handle area is tappable
    justifyContent: 'center',
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
  },
});

export default DraggablePanel;
