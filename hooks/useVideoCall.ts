import { useEffect, useRef, useState } from "react";
import {
  mediaDevices,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  MediaStream,
} from 'react-native-webrtc';
import { Audio } from "expo-av";
import { getTurnCredentialsFn } from "services/userService";

const FALLBACK_ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }],
};

export const useVideoCall = (socket: any | null) => {
  const [isCalling, setIsCalling] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [partnerId, setPartnerId] = useState('');
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  const partnerIdRef = useRef('');

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);
  const iceCandidatesQueue = useRef<RTCIceCandidate[]>([]);
  const iceConfig = useRef(FALLBACK_ICE_SERVERS);

  const ringtoneSound = useRef<Audio.Sound | null>(null);
  const callToneSound = useRef<Audio.Sound | null>(null);

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

  /** 🔊 Configure audio session for calls */
  const configureAudioSession = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });
    } catch (err) {
      console.error("🔴 Failed to configure audio session", err);
    }
  };

  /** 🎙📹 Setup local media (audio + video) */
  const initLocalStream = async () => {
    try {
      await configureAudioSession();
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: {
          facingMode: isFrontCamera ? 'user' : 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
        },
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
        socket.emit("video-ice-candidate", { to: partnerIdRef.current, candidate: event.candidate });
      }
    };
  };

  /** 📹 Video call another user */
  const callUser = async (id: string) => {
    await fetchIceServers();
    // Play call tone BEFORE capturing mic so expo-av doesn't fight WebRTC
    await playCallTone();
    await initLocalStream();
    setIsCalling(true);
    setPartnerId(id);
    partnerIdRef.current = id;
    initPeerConnection();

    const offer = await peerConnection.current!.createOffer({});
    await peerConnection.current!.setLocalDescription(offer);

    socket.emit("video-call-user", { offer, to: id });
  };

  /** ✅ Accept incoming video call */
  const acceptCall = async () => {
    try {
      if (!incomingCall) throw new Error("No incoming video call");
      // Stop ringtone FIRST so expo-av releases audio hardware
      await stopRingtone();
      setModalVisible(false);

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

      socket.emit("video-make-answer", {
        answer,
        to: incomingCall.from,
      });

      setIsCalling(true);
      setIncomingCall(null);
    } catch (err) {
      console.error("Error accepting video call:", err);
      await hangUp();
    }
  };

  /** ❌ Hang up or reject */
  const hangUp = async () => {
    const pid = partnerIdRef.current;
    await cleanWebRtc();
    if (pid) socket.emit("video-end-call", { to: pid });
  };

  const rejectCall = async () => {
    await stopRingtone();
    setIncomingCall(null);
    setModalVisible(false);
    if (partnerIdRef.current) socket.emit("video-reject-call", { to: partnerIdRef.current });
  };

  /** 🔄 Toggle camera */
  const toggleCamera = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        (videoTrack as any)._switchCamera();
        setIsFrontCamera((prev) => !prev);
      }
    }
  };

  /** 🔇 Toggle video track */
  const toggleVideo = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  };

  /** 🔇 Toggle audio track */
  const toggleMute = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  };

  /** 🧼 Clean everything */
  const cleanWebRtc = async () => {
    await stopCallTone();
    await stopRingtone();

    localStream.current?.getTracks().forEach((track) => track.stop());
    localStream.current = null;

    remoteStream.current?.getTracks().forEach((track) => track.stop());
    remoteStream.current = null;

    try {
      peerConnection.current?.close();
    } catch (e) {
      console.warn("PeerConnection close error:", e);
    }
    peerConnection.current = null;

    iceCandidatesQueue.current = [];
    setIsCalling(false);
    setIncomingCall(null);
    setModalVisible(false);
    partnerIdRef.current = '';
  };

  /** 🔌 Socket listeners for video call events */
  useEffect(() => {
    if (!socket) return;

    const handleIncomingVideoCall = async (data: any) => {
      setPartnerId(data.from);
      partnerIdRef.current = data.from;
      setIncomingCall({ from: data.from, offer: data.offer });
      await playRingtone();
    };

    const handleVideoAnswerMade = async (data: any) => {
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
    };

    const handleVideoIceCandidate = async (data: any) => {
      const candidate = new RTCIceCandidate(data.candidate);
      if (!peerConnection.current || !peerConnection.current.remoteDescription?.type) {
        iceCandidatesQueue.current.push(candidate);
      } else {
        await peerConnection.current.addIceCandidate(candidate);
      }
    };

    socket.on("video-call-made", handleIncomingVideoCall);
    socket.on("video-answer-made", handleVideoAnswerMade);
    socket.on("video-ice-candidate", handleVideoIceCandidate);
    socket.on("video-call-ended", hangUp);
    socket.on("video-call-rejected", hangUp);

    return () => {
      socket.off("video-call-made", handleIncomingVideoCall);
      socket.off("video-answer-made", handleVideoAnswerMade);
      socket.off("video-ice-candidate", handleVideoIceCandidate);
      socket.off("video-call-ended", hangUp);
      socket.off("video-call-rejected", hangUp);
    };
  }, [socket]);

  /** 📹 Show modal only when not already in a call */
  useEffect(() => {
    setModalVisible(!!incomingCall && !isCalling);
  }, [incomingCall, isCalling]);

  return {
    isCalling,
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
    toggleCamera,
    toggleVideo,
    toggleMute,
    isFrontCamera,
  };
};
