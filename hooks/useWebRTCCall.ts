import { useEffect, useRef, useState } from "react";
import {
  mediaDevices,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  MediaStream,
} from 'react-native-webrtc';
import { Audio } from "expo-av";
import InCallManager from 'react-native-incall-manager';
import { getTurnCredentialsFn } from "services/userService";
import DeviceIdService from 'services/deviceIdService';

const FALLBACK_ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }],
};

export const useWebRtc = (socket: any | null) => {
  const [isCalling, setIsCalling] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [partnerId, setPartnerId] = useState('');
  const [soundsLoaded, setSoundsLoaded] = useState(false);

  const partnerIdRef = useRef('');
  const isConnectingRef = useRef(false);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);
  const iceCandidatesQueue = useRef<RTCIceCandidate[]>([]);
  const iceConfig = useRef(FALLBACK_ICE_SERVERS);

  const ringtoneSound = useRef<Audio.Sound | null>(null);
  const callToneSound = useRef<Audio.Sound | null>(null);
  
  // Device ID for call events
  const [deviceId, setDeviceId] = useState<string | null>(null);

  // Initialize device ID
  useEffect(() => {
    const initDeviceId = async () => {
      try {
        const id = await DeviceIdService.getDeviceId();
        setDeviceId(id);
      } catch (error) {
        console.error('Error initializing device ID in useWebRtc:', error);
      }
    };
    
    initDeviceId();
  }, []);

  /** 🔊 Load and unload sounds */
  const loadSounds = async () => {
    try {
      await unloadSounds();
      const { sound: ringtone } = await Audio.Sound.createAsync(
        require("../assets/sounds/ringtone.mp3"),
        { shouldPlay: false, isLooping: true }
      );
      ringtoneSound.current = ringtone;

      const { sound: callTone } = await Audio.Sound.createAsync(
        require("../assets/sounds/calltone.mp3"),
        { shouldPlay: false, isLooping: true }
      );
      callToneSound.current = callTone;

      setSoundsLoaded(true);
    } catch (err) {
      console.error("🔴 Failed to load sounds", err);
      setSoundsLoaded(false);
    }
  };

  const unloadSounds = async () => {
    const unload = async (soundRef: React.MutableRefObject<Audio.Sound | null>) => {
      if (soundRef.current) {
        try {
          const status = await soundRef.current.getStatusAsync();
          if (status?.isLoaded) {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
          }
        } catch {}
        soundRef.current = null;
      }
    };
    await Promise.all([unload(ringtoneSound), unload(callToneSound)]);
    setSoundsLoaded(false);
  };

  const playRingtone = async () => {
    try {
      if (!soundsLoaded) await loadSounds();
      await ringtoneSound.current?.replayAsync();
    } catch (e) {
      console.error("🔴 Error playing ringtone", e);
    }
  };

  const stopRingtone = async () => {
    try {
      const status = await ringtoneSound.current?.getStatusAsync();
      if (status?.isLoaded && status?.isPlaying) {
        await ringtoneSound.current?.stopAsync();
      }
    } catch (e) {
      console.warn("⚠️ Error stopping ringtone", e);
    }
  };

  const playCallTone = async () => {
    try {
      if (!soundsLoaded) await loadSounds();
      await callToneSound.current?.replayAsync();
    } catch (e) {
      console.error("🔴 Error playing call tone", e);
    }
  };

  const stopCallTone = async () => {
    try {
      const status = await callToneSound.current?.getStatusAsync();
      if (status?.isLoaded && status?.isPlaying) {
        await callToneSound.current?.stopAsync();
      }
    } catch (e) {
      console.warn("⚠️ Error stopping call tone", e);
    }
  };

  /** 🔊 Configure audio session for voice calls */
  const configureAudioSession = async (speakerOn = false) => {
    try {
      InCallManager.setSpeakerphoneOn(speakerOn);
      InCallManager.setForceSpeakerphoneOn(speakerOn);
    } catch (err) {
      console.error("🔴 Failed to configure audio session", err);
    }
  };

  /** 🔊 Reset audio session after call */
  const resetAudioSession = async () => {
    try {
      InCallManager.stop();
    } catch (err) {
      console.warn("⚠️ Failed to reset audio session", err);
    }
  };

  /** 🎙 Setup local media */
  const initLocalStream = async () => {
    try {

      const stream = await mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } as any,
      });
      localStream.current = stream;
    } catch (error) {
      console.error("Error getting user media:", error);
    }
  };

  /** Fetch fresh Cloudflare TURN credentials */
  const fetchIceServers = async () => {
    try {
      const creds = await getTurnCredentialsFn();
      if (creds?.iceServers?.length) {
        iceConfig.current = creds;
      }
    } catch (e) {
      console.warn('Using fallback ICE servers:', e);
    }
  };

  /** 🔗 Setup peer connection */
  const initPeerConnection = () => {
    peerConnection.current = new RTCPeerConnection(iceConfig.current);

    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, localStream.current!);
      });
    }

    (peerConnection.current as any).ontrack = (event: any) => {
      if (!remoteStream.current) {
        remoteStream.current = new MediaStream();
      }

      event.streams.forEach((stream: any) => {
        stream.getTracks().forEach((track: any) => {
          if (!remoteStream.current?.getTracks().some((t: any) => t.id === track.id)) {
            remoteStream.current?.addTrack(track);
          }
        });
      });
    };

    (peerConnection.current as any).onicecandidate = (event: any) => {
      if (event.candidate && partnerIdRef.current) {
        socket.emit("ice-candidate", { to: partnerIdRef.current, candidate: event.candidate });
      }
    };
  };

  /** 📞 Call another user */
  const callUser = async (id: string) => {
    await fetchIceServers();
    await initLocalStream();
    
    // Set connecting state immediately
    setIsConnecting(true);
    isConnectingRef.current = true;
    
    setPartnerId(id);
    partnerIdRef.current = id;
    initPeerConnection();

    const offer = await peerConnection.current!.createOffer({});
    await peerConnection.current!.setLocalDescription(offer);
    await playCallTone();

    socket.emit("call-user", { offer, to: id, deviceId });
  };

  /** ✅ Accept incoming call */
  const acceptCall = async () => {
    try {
      if (!incomingCall) throw new Error("No incoming call");
      
      // Stop ringtone and unload sounds FIRST before initializing stream
      await stopRingtone();
      await unloadSounds();
      setModalVisible(false);

      // Now safely initialize local stream after audio cleanup
      await fetchIceServers();
      await initLocalStream();
      initPeerConnection();

      await peerConnection.current?.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer)
      );

      await Promise.all(
        iceCandidatesQueue.current.map((candidate) =>
          peerConnection.current?.addIceCandidate(candidate).catch((e) =>
            console.warn("ICE add failed:", e)
          )
        )
      );
      iceCandidatesQueue.current = [];

      const answer = await peerConnection.current!.createAnswer();
      await peerConnection.current!.setLocalDescription(answer);

      socket.emit("make-answer", {
        answer,
        to: incomingCall.from,
        deviceId,
      });

      setIsCalling(true);
      setIncomingCall(null);

      // Start InCallManager in earpiece mode (user can toggle speaker via UI)
      InCallManager.start({ media: 'audio', auto: false });
      InCallManager.setSpeakerphoneOn(false);
    } catch (err) {
      console.error("Error accepting call:", err);
      await hangUp();
    }
  };

  /** ❌ Hang up or reject */
  const hangUp = async () => {
    const pid = partnerIdRef.current;
    
    try {
      await cleanWebRtc();
    } catch (error) {
      console.error('Error during cleanup:', error);
    } finally {
      // Always emit end-call, even if cleanup fails
      if (pid) socket.emit("end-call", { to: pid, deviceId });
    }
  };

  const rejectCall = async () => {
    await stopRingtone();
    setIncomingCall(null);
    setModalVisible(false);
    if (partnerIdRef.current) socket.emit("reject-call", { to: partnerIdRef.current, deviceId });
  };

  /** 🔇 Toggle microphone mute */
  const toggleMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled; // returns true if now muted
      }
    }
    return false;
  };

  /** 🔊 Toggle speaker output */
  const toggleSpeaker = async (speakerOn: boolean) => {
    await configureAudioSession(speakerOn);
  };

  /** 🧼 Clean everything */
  const cleanWebRtc = async () => {
    try {
      // Stop sounds first
      await Promise.allSettled([
        stopCallTone(),
        stopRingtone()
      ]);

      // Stop local stream tracks
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (e) {
            console.warn('Error stopping local track:', e);
          }
        });
        localStream.current = null;
      }

      // Stop remote stream tracks
      if (remoteStream.current) {
        remoteStream.current.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (e) {
            console.warn('Error stopping remote track:', e);
          }
        });
        remoteStream.current = null;
      }

      // Close peer connection
      if (peerConnection.current) {
        try {
          peerConnection.current.close();
        } catch (e) {
          console.warn("PeerConnection close error:", e);
        }
        peerConnection.current = null;
      }

      // Reset audio session
      await Promise.allSettled([resetAudioSession()]);

      // Clear state
      iceCandidatesQueue.current = [];
      setIsCalling(false);
      setIsConnecting(false);
      isConnectingRef.current = false;
      setIncomingCall(null);
      setModalVisible(false);
      partnerIdRef.current = '';
    } catch (error) {
      console.error('Error in voice call cleanup:', error);
      // Ensure state is cleared even if cleanup fails
      localStream.current = null;
      remoteStream.current = null;
      peerConnection.current = null;
      iceCandidatesQueue.current = [];
      setIsCalling(false);
      setIsConnecting(false);
      isConnectingRef.current = false;
      setIncomingCall(null);
      setModalVisible(false);
      partnerIdRef.current = '';
    }
  };

  /** 🔌 Socket listeners */
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = async (data: any) => {
      // Call collision detection: if we're already connecting to someone, reject this incoming call
      if (isConnectingRef.current || isCalling) {
        console.log('⚠️ Call collision detected - already in a call, rejecting incoming call from:', data.from);
        socket.emit("call-busy", { to: data.from, deviceId });
        return;
      }
      
      setPartnerId(data.from);
      partnerIdRef.current = data.from;
      setIncomingCall({ from: data.from, offer: data.offer });
      await playRingtone();
    };

    const handleAnswerMade = async (data: any) => {
      if (!peerConnection.current) return;

      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );

      await Promise.all(
        iceCandidatesQueue.current.map((candidate) =>
          peerConnection.current?.addIceCandidate(candidate)
        )
      );
      iceCandidatesQueue.current = [];
      await stopCallTone();

      // ✅ Clear connecting state and set isCalling to true when call is answered
      setIsConnecting(false);
      isConnectingRef.current = false;
      setIsCalling(true);

      // Start InCallManager in earpiece mode (user can toggle speaker via UI)
      InCallManager.start({ media: 'audio', auto: false });
      InCallManager.setSpeakerphoneOn(false);

      // Verify audio is still flowing after call tone stops
      const audioTrack = localStream.current?.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = true;
      }
    };

    const handleIceCandidate = async (data: any) => {
      const candidate = new RTCIceCandidate(data.candidate);
      if (!peerConnection.current || !peerConnection.current.remoteDescription?.type) {
        iceCandidatesQueue.current.push(candidate);
      } else {
        await peerConnection.current.addIceCandidate(candidate);
      }
    };

    const handleCallUnavailable = async () => {
      await cleanWebRtc();
    };

    const handleCallTimeout = async () => {
      await cleanWebRtc();
    };

    const handleCallBusy = async () => {
      console.log('📞 Partner is busy on another call');
      await cleanWebRtc();
    };

    socket.on("call-made", handleIncomingCall);
    socket.on("answer-made", handleAnswerMade);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-ended", hangUp);
    socket.on("call-rejected", hangUp);
    socket.on("call-unavailable", handleCallUnavailable);
    socket.on("call-timeout", handleCallTimeout);
    socket.on("call-busy", handleCallBusy);

    return () => {
      socket.off("call-made", handleIncomingCall);
      socket.off("answer-made", handleAnswerMade);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("call-ended", hangUp);
      socket.off("call-rejected", hangUp);
      socket.off("call-unavailable", handleCallUnavailable);
      socket.off("call-timeout", handleCallTimeout);
      socket.off("call-busy", handleCallBusy);
    };
  }, [socket]);

  /** 📞 Show modal only when not already in a call */
  useEffect(() => {
    setModalVisible(!!incomingCall && !isCalling);
  }, [incomingCall, isCalling]);

  return {
    isCalling,
    isConnecting,
    setIsCalling,
    incomingCall,
    callUser,
    acceptCall,
    rejectCall,
    modalVisible,
    setModalVisible,
    hangUp,
    setPartnerId,
    partnerId,
    localStream,
    remoteStream,
    toggleMute,
    toggleSpeaker,
    cleanupCall: cleanWebRtc,
  };
};
