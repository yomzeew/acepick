import { useRef, useState, useCallback } from 'react';
import { Audio } from 'expo-av';
import { uploadCallRecordingToLocal } from 'services/localUploadService';
import { saveCallRecordingFn } from 'services/callRecordingService';

interface UseCallRecordingOptions {
  /** ID of the user being called */
  partnerId: string;
  /** Current user's ID (the one who initiated recording) */
  userId: string;
  /** 'voice' | 'video' */
  callType?: string;
}

interface UseCallRecordingReturn {
  isRecording: boolean;
  recordingDuration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  isUploading: boolean;
}

/**
 * Hook to record call audio using expo-av and upload to local backend storage.
 * Records the device microphone during a call, then uploads + saves metadata on stop.
 */
export const useCallRecording = ({
  partnerId,
  userId,
  callType = 'voice',
}: UseCallRecordingOptions): UseCallRecordingReturn => {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const startRecording = useCallback(async () => {
    try {
      // Request permissions
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        console.warn('[CallRecording] Microphone permission not granted');
        return;
      }

      // Configure audio session for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);

      // Track duration
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      console.log('[CallRecording] Recording started');
    } catch (error) {
      console.error('[CallRecording] Failed to start recording:', error);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      if (!recordingRef.current) return;

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const recording = recordingRef.current;
      recordingRef.current = null;
      setIsRecording(false);

      // Stop the recording
      await recording.stopAndUnloadAsync();

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      if (!uri) {
        console.warn('[CallRecording] No recording URI');
        return;
      }

      // Get file info for size
      const status = await recording.getStatusAsync();
      const duration = Math.round((status.durationMillis || 0) / 1000);

      console.log('[CallRecording] Recording stopped, duration:', duration, 's');

      // Upload in background
      setIsUploading(true);
      try {
        const { url, path } = await uploadCallRecordingToLocal(uri, userId);
        console.log('[CallRecording] Uploaded to:', url);

        // Save metadata to backend
        await saveCallRecordingFn({
          receiverId: partnerId,
          url,
          path,
          duration,
          callType,
        });
        console.log('[CallRecording] Metadata saved to backend');
      } catch (uploadError) {
        console.error('[CallRecording] Upload/save failed:', uploadError);
      } finally {
        setIsUploading(false);
        setRecordingDuration(0);
      }
    } catch (error) {
      console.error('[CallRecording] Failed to stop recording:', error);
      setIsRecording(false);
      setIsUploading(false);
    }
  }, [partnerId, userId, callType]);

  return {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    isUploading,
  };
};
