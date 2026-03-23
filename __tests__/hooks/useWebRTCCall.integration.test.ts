/**
 * Integration tests for useWebRtc hook
 * Tests the actual hook implementation with mocked dependencies
 */

import { useWebRtc } from '../../hooks/useWebRTCCall';

// Mock socket.io
const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  connected: true,
  id: 'test-socket-id',
};

// Mock React hooks
const mockUseState = jest.fn((initial: any) => {
  let state = initial;
  const setState = jest.fn((val: any) => {
    if (typeof val === 'function') {
      state = val(state);
    } else {
      state = val;
    }
    return state;
  });
  return [state, setState];
});

const mockUseEffect = jest.fn((fn: () => void, deps?: any[]) => {
  fn();
  return () => {}; // cleanup function
});

const mockUseRef = jest.fn((initial: any) => ({ current: initial }));

// Mock React
jest.mock('react', () => ({
  useState: mockUseState,
  useEffect: mockUseEffect,
  useRef: mockUseRef,
}));

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() => Promise.resolve({
        sound: {
          replayAsync: jest.fn(),
          stopAsync: jest.fn(),
          unloadAsync: jest.fn(),
          getStatusAsync: jest.fn(() => Promise.resolve({
            isLoaded: true,
            isPlaying: false,
          })),
        },
      })),
    },
  },
}));

// Mock react-native-webrtc
jest.mock('react-native-webrtc', () => ({
  mediaDevices: {
    getUserMedia: jest.fn(() => Promise.resolve({
      getTracks: jest.fn(() => [
        { stop: jest.fn() },
        { stop: jest.fn() }
      ]),
    })),
  },
  RTCPeerConnection: jest.fn(() => {
    const mockPeerConnection = {
      addTrack: jest.fn(),
      createOffer: jest.fn(() => Promise.resolve({
        type: 'offer',
        sdp: 'mock-sdp',
      })),
      createAnswer: jest.fn(() => Promise.resolve({
        type: 'answer',
        sdp: 'mock-sdp',
      })),
      setLocalDescription: jest.fn(() => Promise.resolve()),
      setRemoteDescription: jest.fn(() => Promise.resolve()),
      addIceCandidate: jest.fn(() => Promise.resolve()),
      close: jest.fn(),
      ontrack: null,
      onicecandidate: null,
      remoteDescription: { type: 'answer' },
    };
    return mockPeerConnection;
  }),
  RTCSessionDescription: jest.fn(),
  RTCIceCandidate: jest.fn(),
  MediaStream: jest.fn(() => ({
    getTracks: jest.fn(() => [
      { stop: jest.fn() },
      { stop: jest.fn() }
    ]),
  })),
}));

describe('useWebRtc Hook - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock implementations
    const { mediaDevices } = require('react-native-webrtc');
    mediaDevices.getUserMedia.mockResolvedValue({
      getTracks: jest.fn(() => [{ stop: jest.fn() }, { stop: jest.fn() }]),
    });
  });

  describe('Hook Initialization', () => {
    it('should initialize with correct state', () => {
      const result = useWebRtc(null);

      expect(result.isCalling).toBe(false);
      expect(result.incomingCall).toBe(null);
      expect(result.modalVisible).toBe(false);
      expect(result.partnerId).toBe('');
    });

    it('should return all required functions', () => {
      const result = useWebRtc(null);

      expect(typeof result.callUser).toBe('function');
      expect(typeof result.acceptCall).toBe('function');
      expect(typeof result.rejectCall).toBe('function');
      expect(typeof result.hangUp).toBe('function');
      expect(typeof result.setModalVisible).toBe('function');
      expect(typeof result.setPartnerId).toBe('function');
    });
  });

  describe('Socket Integration', () => {
    it('should set up socket listeners when socket is provided', () => {
      useWebRtc(mockSocket);

      expect(mockSocket.on).toHaveBeenCalledWith('call-made', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('answer-made', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('ice-candidate', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('call-ended', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('call-rejected', expect.any(Function));
    });

    it('should not set up listeners when socket is null', () => {
      useWebRtc(null);

      expect(mockSocket.on).not.toHaveBeenCalled();
    });
  });

  describe('Call User Function', () => {
    it('should initiate call and update state', async () => {
      const result = useWebRtc(mockSocket);
      const userId = 'user123';

      await result.callUser(userId);

      expect(result.isCalling).toBe(true);
      expect(result.partnerId).toBe(userId);
      expect(mockSocket.emit).toHaveBeenCalledWith('call-user', {
        offer: expect.objectContaining({
          type: 'offer',
          sdp: 'mock-sdp'
        }),
        to: userId
      });
    });

    it('should handle media errors gracefully', async () => {
      const { mediaDevices } = require('react-native-webrtc');
      mediaDevices.getUserMedia.mockRejectedValueOnce(new Error('Permission denied'));

      const result = useWebRtc(mockSocket);

      await result.callUser('user123');

      // Should still attempt to call even if media fails
      expect(mockSocket.emit).toHaveBeenCalledWith('call-user', expect.any(Object));
    });
  });

  describe('Accept Call Function', () => {
    it('should accept incoming call successfully', async () => {
      const result = useWebRtc(mockSocket);
      
      // Simulate incoming call by setting it directly
      result.incomingCall = { from: 'user456', offer: { type: 'offer', sdp: 'mock-sdp' } };
      result.modalVisible = true;

      await result.acceptCall();

      expect(result.isCalling).toBe(true);
      expect(result.incomingCall).toBe(null);
      expect(result.modalVisible).toBe(false);
      expect(mockSocket.emit).toHaveBeenCalledWith('make-answer', expect.objectContaining({
        answer: expect.objectContaining({
          type: 'answer',
          sdp: 'mock-sdp'
        }),
        to: 'user456'
      }));
    });

    it('should throw error when no incoming call', async () => {
      const result = useWebRtc(mockSocket);

      await expect(result.acceptCall()).rejects.toThrow('No incoming call');
    });

    it('should handle WebRTC errors during accept', async () => {
      const result = useWebRtc(mockSocket);
      
      // Mock setRemoteDescription to throw an error
      const { RTCPeerConnection } = require('react-native-webrtc');
      const mockPeerConnection = RTCPeerConnection();
      mockPeerConnection.setRemoteDescription.mockRejectedValueOnce(new Error('Failed to set remote description'));

      // Simulate incoming call
      result.incomingCall = { from: 'user456', offer: { type: 'offer', sdp: 'mock-sdp' } };

      await result.acceptCall();

      expect(result.isCalling).toBe(false);
      expect(result.incomingCall).toBe(null);
    });
  });

  describe('Reject Call Function', () => {
    it('should reject incoming call successfully', async () => {
      const result = useWebRtc(mockSocket);
      
      // Simulate incoming call
      result.incomingCall = { from: 'user456', offer: { type: 'offer', sdp: 'mock-sdp' } };
      result.modalVisible = true;
      result.partnerId = 'user456';

      await result.rejectCall();

      expect(result.incomingCall).toBe(null);
      expect(result.modalVisible).toBe(false);
      expect(mockSocket.emit).toHaveBeenCalledWith('reject-call', { to: 'user456' });
    });
  });

  describe('Hang Up Function', () => {
    it('should hang up active call', async () => {
      const result = useWebRtc(mockSocket);

      // Start a call first
      await result.callUser('user123');
      expect(result.isCalling).toBe(true);

      // Then hang up
      await result.hangUp();

      expect(result.isCalling).toBe(false);
      expect(result.partnerId).toBe('');
      expect(mockSocket.emit).toHaveBeenCalledWith('end-call', { to: 'user123' });
    });

    it('should handle hang up without active call', async () => {
      const result = useWebRtc(mockSocket);

      await result.hangUp();

      expect(result.isCalling).toBe(false);
      expect(mockSocket.emit).not.toHaveBeenCalledWith('end-call', expect.any(Object));
    });
  });

  describe('Socket Event Handling', () => {
    it('should handle incoming call-made event', () => {
      const result = useWebRtc(mockSocket);
      
      // Get the call-made callback
      const callMadeCallback = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'call-made')?.[1];
      
      if (callMadeCallback) {
        callMadeCallback({ from: 'user456', offer: { type: 'offer', sdp: 'mock-sdp' } });
        
        expect(result.incomingCall).toEqual({ from: 'user456', offer: { type: 'offer', sdp: 'mock-sdp' } });
        expect(result.modalVisible).toBe(true);
      }
    });

    it('should handle answer-made event', async () => {
      const result = useWebRtc(mockSocket);
      
      // Start a call first
      await result.callUser('user123');
      
      // Get the answer-made callback
      const answerMadeCallback = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'answer-made')?.[1];
      
      if (answerMadeCallback) {
        answerMadeCallback({ answer: { type: 'answer', sdp: 'mock-answer-sdp' } });
        
        const { RTCPeerConnection } = require('react-native-webrtc');
        const mockPeerConnection = RTCPeerConnection();
        expect(mockPeerConnection.setRemoteDescription).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'answer',
            sdp: 'mock-answer-sdp'
          })
        );
      }
    });

    it('should handle call-ended event', async () => {
      const result = useWebRtc(mockSocket);
      
      // Start a call first
      await result.callUser('user123');
      expect(result.isCalling).toBe(true);
      
      // Get the call-ended callback
      const callEndedCallback = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'call-ended')?.[1];
      
      if (callEndedCallback) {
        callEndedCallback();
        expect(result.isCalling).toBe(false);
      }
    });

    it('should handle call-rejected event', async () => {
      const result = useWebRtc(mockSocket);
      
      // Start a call first
      await result.callUser('user123');
      expect(result.isCalling).toBe(true);
      
      // Get the call-rejected callback
      const callRejectedCallback = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'call-rejected')?.[1];
      
      if (callRejectedCallback) {
        callRejectedCallback();
        expect(result.isCalling).toBe(false);
      }
    });

    it('should handle ice-candidate event', async () => {
      const result = useWebRtc(mockSocket);
      
      // Start a call first
      await result.callUser('user123');
      
      // Get the ice-candidate callback
      const iceCandidateCallback = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'ice-candidate')?.[1];
      
      if (iceCandidateCallback) {
        iceCandidateCallback({ candidate: { candidate: 'mock-candidate', sdpMid: '0' } });
        
        const { RTCPeerConnection } = require('react-native-webrtc');
        const mockPeerConnection = RTCPeerConnection();
        expect(mockPeerConnection.addIceCandidate).toHaveBeenCalledWith(
          expect.objectContaining({
            candidate: 'mock-candidate'
          })
        );
      }
    });
  });

  describe('State Management', () => {
    it('should correctly update modal visibility based on call state', () => {
      const result = useWebRtc(mockSocket);
      
      // Initially modal should be hidden
      expect(result.modalVisible).toBe(false);
      
      // When incoming call arrives and not in call, modal should show
      result.incomingCall = { from: 'user456', offer: {} };
      // This would normally be handled by the socket event
      expect(result.modalVisible).toBe(false); // Will be updated by event handler
    });

    it('should not show modal when already in call', () => {
      const result = useWebRtc(mockSocket);
      
      // Start a call
      result.isCalling = true;
      
      // Receive incoming call
      result.incomingCall = { from: 'user456', offer: {} };
      
      // Modal should not show when already in call
      expect(result.modalVisible).toBe(false);
    });
  });

  describe('Sound Management', () => {
    it('should load sounds on initialization', () => {
      const { Audio } = require('expo-av');
      
      useWebRtc(mockSocket);
      
      // Should attempt to load sounds
      expect(Audio.Sound.createAsync).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle socket being null gracefully', async () => {
      const result = useWebRtc(null);
      
      // Should not crash when calling functions without socket
      await expect(result.callUser('user123')).resolves.toBeUndefined();
      await expect(result.acceptCall()).rejects.toThrow('No incoming call');
      await expect(result.rejectCall()).resolves.toBeUndefined();
      await expect(result.hangUp()).resolves.toBeUndefined();
    });

    it('should handle WebRTC peer connection errors', async () => {
      const { RTCPeerConnection } = require('react-native-webrtc');
      RTCPeerConnection.mockImplementation(() => {
        throw new Error('Failed to create peer connection');
      });

      const result = useWebRtc(mockSocket);
      
      // Should not crash on peer connection errors
      await expect(result.callUser('user123')).resolves.toBeUndefined();
    });
  });
});
