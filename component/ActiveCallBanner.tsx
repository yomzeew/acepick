import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useActiveCall } from 'context/ActiveCallContext';
import { useCall } from 'context/WebRtcContext';
import { useVideoCallContext } from 'context/VideoCallContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CALL_SCREEN_SEGMENTS = ['callchat', 'callAnswer', 'videocall', 'videoCallAnswer'];

const ActiveCallBanner = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { activeCall, endCall, updateElapsed, getDeviceId } = useActiveCall();
  const { isCalling: voiceCalling, hangUp: hangUpVoice } = useCall();
  const { isCalling: videoCalling, hangUp: hangUpVideo } = useVideoCallContext();
  const insets = useSafeAreaInsets();

  const currentDeviceId = getDeviceId();

  // ── Android status bar fix ───────────────────────────────────────────
  // On Android, useSafeAreaInsets().top can return 0 if the SafeAreaProvider
  // hasn't measured yet, or on devices where the inset isn't reported correctly.
  // StatusBar.currentHeight is the most reliable source for Android.
  const statusBarHeight = Platform.select({
    android: StatusBar.currentHeight ?? 24,
    ios: insets.top,
    default: insets.top,
  }) as number;

  // Add extra breathing room so content isn't flush against the status bar
  const TOP_PADDING = statusBarHeight + 6;
  const BOTTOM_PADDING = 10;

  const pulseAnim = useState(() => new Animated.Value(1))[0];

  const isActive = activeCall && (voiceCalling || videoCalling);
  const isOnCallScreen = CALL_SCREEN_SEGMENTS.some((seg) => pathname.includes(seg));
  
  // Only show banner if the active call belongs to this device
  const isThisDeviceCall = activeCall && currentDeviceId && activeCall.deviceId === currentDeviceId;
  const shouldShow = isActive && isThisDeviceCall && !isOnCallScreen;

  const isVideo = activeCall?.type === 'video';

  useEffect(() => {
    if (!isActive || !activeCall) {
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - activeCall.startTime) / 1000);
      updateElapsed(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, activeCall?.startTime, updateElapsed]);

  useEffect(() => {
    if (isActive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isActive]);

  useEffect(() => {
    if (activeCall && !voiceCalling && !videoCalling) {
      endCall();
    }
  }, [voiceCalling, videoCalling, activeCall]);

  if (!shouldShow) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleHangUp = async (e: any) => {
    e.stopPropagation();
    console.log('[ActiveCallBanner] Hanging up call...');
    if (isVideo) {
      await hangUpVideo();
    } else {
      await hangUpVoice();
    }
    endCall();
  };

  return (
    <View
      style={{
        backgroundColor: '#16A34A',
        paddingTop: TOP_PADDING,
        paddingBottom: BOTTOM_PADDING,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          console.log('[ActiveCallBanner] Navigating to:', activeCall.route);
          router.navigate(activeCall.route as any);
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
        }}
      >
        <Animated.View style={{ opacity: pulseAnim, marginRight: 8 }}>
          <Ionicons
            name={isVideo ? 'videocam' : 'call'}
            size={16}
            color="#fff"
          />
        </Animated.View>
        <Text
          style={{
            color: '#fff',
            fontSize: 13,
            fontFamily: 'TTFirsNeueMedium',
            marginRight: 6,
          }}
        >
          {isVideo ? 'Video Call' : 'Voice Call'}{' in progress'}
        </Text>
        <Text
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 13,
            fontFamily: 'TTFirsNeue',
            marginRight: 8,
          }}
        >
          {formatTime(activeCall?.elapsed || 0)}
        </Text>
        <Text
          style={{
            color: '#fff',
            fontSize: 12,
            fontFamily: 'TTFirsNeueMedium',
          }}
        >
          {'Tap to return \u2192'}
        </Text>
      </TouchableOpacity>

      {/* Global Hang Up Button */}
      <TouchableOpacity
        onPress={handleHangUp}
        activeOpacity={0.7}
        style={{
          backgroundColor: '#DC2626',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 20,
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: 12,
        }}
      >
        <Ionicons
          name="call"
          size={14}
          color="#fff"
          style={{ transform: [{ rotate: '135deg' }] }}
        />
        <Text
          style={{
            color: '#fff',
            fontSize: 12,
            fontFamily: 'TTFirsNeueMedium',
            marginLeft: 4,
          }}
        >
          {'End'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActiveCallBanner;
