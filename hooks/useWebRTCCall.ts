import { useEffect, useRef, useState } from "react";
import {
  mediaDevices,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  MediaStream,
} from 'react-native-webrtc';
import { Audio } from "expo-av";

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const useWebRtc = (socket: any) => {
  const [isCalling, setIsCalling] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [partnerId, setPartnerId] = useState('');
  const [soundsLoaded, setSoundsLoaded] = useState(false);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);
  const iceCandidatesQueue = useRef<RTCIceCandidate[]>([]);

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

  /** 🎙 Setup local media */
  const initLocalStream = async () => {
    try {
      const stream = await mediaDevices.getUserMedia({ audio: true });
      localStream.current = stream;
    } catch (error) {
      console.error("Error getting user media:", error);
    }
  };

  /** 🔗 Setup peer connection */
  const initPeerConnection = () => {
    peerConnection.current = new RTCPeerConnection(ICE_SERVERS);

    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, localStream.current!);
      });
    }

    peerConnection.current.ontrack = (event) => {
      if (!remoteStream.current) {
        remoteStream.current = new MediaStream();
      }

      event.streams.forEach((stream) => {
        stream.getTracks().forEach((track) => {
          if (!remoteStream.current?.getTracks().some((t) => t.id === track.id)) {
            remoteStream.current?.addTrack(track);
          }
        });
      });
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate && partnerId) {
        socket.emit("ice-candidate", { to: partnerId, candidate: event.candidate });
      }
    };
  };

  /** 📞 Call another user */
  const callUser = async (id: string) => {
    await initLocalStream();
    setIsCalling(true);
    setPartnerId(id);
    initPeerConnection();

    const offer = await peerConnection.current!.createOffer();
    await peerConnection.current!.setLocalDescription(offer);
    await playCallTone();

    socket.emit("call-user", { offer, to: id });
  };

  /** ✅ Accept incoming call */
  const acceptCall = async () => {
    try {
      if (!incomingCall) throw new Error("No incoming call");
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
      });

      setIsCalling(true);
      setModalVisible(false);
      await stopRingtone();
      setIncomingCall(null);
    } catch (err) {
      console.error("Error accepting call:", err);
      await hangUp();
    }
  };

  /** ❌ Hang up or reject */
  const hangUp = async () => {
    await cleanWebRtc();
    if (partnerId) socket.emit("end-call", { to: partnerId });
  };

  const rejectCall = async () => {
    await stopRingtone();
    setIncomingCall(null);
    setModalVisible(false);
    if (partnerId) socket.emit("reject-call", { to: partnerId });
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
  };

  /** 🔌 Socket listeners */
  useEffect(() => {
    const handleIncomingCall = async (data: any) => {
      setPartnerId(data.from);
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
    };

    const handleIceCandidate = async (data: any) => {
      const candidate = new RTCIceCandidate(data.candidate);
      if (!peerConnection.current || !peerConnection.current.remoteDescription?.type) {
        iceCandidatesQueue.current.push(candidate);
      } else {
        await peerConnection.current.addIceCandidate(candidate);
      }
    };

    socket.on("call-made", handleIncomingCall);
    socket.on("answer-made", handleAnswerMade);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-ended", hangUp);
    socket.on("call-rejected", hangUp);

    return () => {
      socket.off("call-made", handleIncomingCall);
      socket.off("answer-made", handleAnswerMade);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("call-ended", hangUp);
      socket.off("call-rejected", hangUp);
    };
  }, [socket, partnerId]);

  /** 📞 Show modal only when not already in a call */
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
  };
};
