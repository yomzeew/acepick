import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Audio } from "expo-av";

interface AudioMessageBubbleProps {
  url: string;
  duration: number;
  isMine: boolean;
  primaryColor: string;
  subText: string;
  time: string;
}

const formatDur = (s: number) => {
  const mins = Math.floor(s / 60).toString().padStart(2, "0");
  const secs = (s % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

const AudioMessageBubble = ({
  url,
  duration,
  isMine,
  primaryColor,
  subText,
  time,
}: AudioMessageBubbleProps) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPos, setCurrentPos] = useState(0);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const handlePlayPause = async () => {
    try {
      if (isPlaying && soundRef.current) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
        return;
      }

      if (soundRef.current) {
        try {
          await soundRef.current.playAsync();
          setIsPlaying(true);
        } catch (e) {
          // Sound might be unloaded, recreate it
          soundRef.current = null;
        }
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      console.log("[AudioBubble] Loading audio from:", url);
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, progressUpdateIntervalMillis: 100, volume: 1.0 },
        (playbackStatus) => {
          if (playbackStatus.isLoaded) {
            if (playbackStatus.didJustFinish) {
              setIsPlaying(false);
              setProgress(0);
              setCurrentPos(0);
              // Reset to beginning and unload to prevent continuous play
              soundRef.current?.setPositionAsync(0);
              soundRef.current?.unloadAsync();
              soundRef.current = null;
            } else if (playbackStatus.durationMillis) {
              setProgress(playbackStatus.positionMillis / playbackStatus.durationMillis);
              setCurrentPos(Math.round(playbackStatus.positionMillis / 1000));
            }
          }
        }
      );

      console.log("[AudioBubble] Sound loaded, status:", status);
      
      // Set volume to maximum
      await sound.setVolumeAsync(1.0);
      
      // On Android, ensure audio plays through speaker
      if (Platform.OS === 'android') {
        console.log("[AudioBubble] Android device, routing to speaker");
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
          });
        } catch (e) {
          console.error("[AudioBubble] Failed to set Android audio mode:", e);
        }
      }
      
      soundRef.current = sound;
      setIsPlaying(true);
    } catch (e) {
      console.error("[AudioBubble] playback error:", e);
      console.error("[AudioBubble] Error details:", JSON.stringify(e, null, 2));
    }
  };

  const bubbleBg = isMine ? primaryColor : "#E5E7EB";
  const iconColor = isMine ? "#fff" : primaryColor;
  const textColor = isMine ? "rgba(255,255,255,0.85)" : "#374151";
  const trackBg = isMine ? "rgba(255,255,255,0.25)" : "#D1D5DB";
  const trackFill = isMine ? "#fff" : primaryColor;
  const timeColor = isMine ? "rgba(255,255,255,0.6)" : subText;
  const displayDur = isPlaying ? currentPos : duration;

  return (
    <View
      style={{
        backgroundColor: bubbleBg,
        borderRadius: 20,
        borderTopRightRadius: isMine ? 6 : 20,
        borderTopLeftRadius: isMine ? 20 : 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        minWidth: 200,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {/* Play/Pause button */}
        <TouchableOpacity
          onPress={handlePlayPause}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: isMine ? "rgba(255,255,255,0.2)" : primaryColor + "15",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={18}
            color={iconColor}
            style={!isPlaying ? { marginLeft: 2 } : undefined}
          />
        </TouchableOpacity>

        {/* Waveform / progress */}
        <View style={{ flex: 1 }}>
          <View
            style={{
              height: 4,
              backgroundColor: trackBg,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: 4,
                width: `${progress * 100}%`,
                backgroundColor: trackFill,
                borderRadius: 2,
              }}
            />
          </View>
        </View>

        {/* Duration */}
        <Text style={{ color: textColor, fontSize: 12, fontFamily: "TTFirsNeue", minWidth: 36 }}>
          {formatDur(displayDur)}
        </Text>
      </View>

      {/* Timestamp */}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 4 }}>
        <Text style={{ color: timeColor, fontSize: 10 }}>{time}</Text>
      </View>
    </View>
  );
};

export default AudioMessageBubble;