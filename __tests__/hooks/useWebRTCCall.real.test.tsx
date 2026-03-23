import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useWebRtc } from '../../hooks/useWebRTCCall';

// Mock socket.io
const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  connected: true,
  id: 'test-socket-id',
};

describe('useWebRtc Hook - Real Implementation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    const { mediaDevices } = require('react-native-webrtc');
    mediaDevices.getUserMedia.mockResolvedValue({
      getTracks: jest.fn(() => [{ stop: jest.fn() }, { stop: jest.fn() }]),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should return initial state values', () => {
      const { result } = renderHook(() => useWebRtc(null));

      expect(result.current.isCalling).toBe(false);
      expect(result.current.incomingCall).toBe(null);
      expect(result.current.modalVisible).toBe(false);
      expect(result.current.partnerId).toBe('');
    });

    it('should return all required functions', () => {
      const { result } = renderHook(() => useWebRtc(null));

      expect(typeof result.current.callUser).toBe('function');
      expect(typeof result.current.acceptCall).toBe('function');
      expect(typeof result.current.rejectCall).toBe('function');
      expect(typeof result.current.hangUp).toBe('function');
      expect(typeof result.current.setModalVisible).toBe('function');
      expect(typeof result.current.setPartnerId).toBe('function');
    });
  });

  describe('Socket Connection', () => {
    it('should set up socket listeners when socket is provided', () => {
      renderHook(() => useWebRtc(mockSocket));

      expect(mockSocket.on).toHaveBeenCalledWith('call-made', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('answer-made', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('ice-candidate', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('call-ended', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('call-rejected', expect.any(Function));
    });

    it('should clean up socket listeners on unmount', () => {
      const { unmount } = renderHook(() => useWebRtc(mockSocket));

      unmount();

      expect(mockSocket.off).toHaveBeenCalledWith('call-made', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('answer-made', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('ice-candidate', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('call-ended', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('call-rejected', expect.any(Function));
    });

    it('should not set up listeners when socket is null', () => {
      renderHook(() => useWebRtc(null));

      expect(mockSocket.on).not.toHaveBeenCalled();
    });
  });

  describe('Call User Functionality', () => {
    it('should initiate call successfully', async () => {
      const { result } = renderHook(() => useWebRtc(mockSocket));
      const userId = 'user123';

      await act(async () => {
        await result.current.callUser(userId);
      });

      expect(result.current.isCalling).toBe(true);
      expect(result.current.partnerId).toBe(userId);
      expect(mockSocket.emit).toHaveBeenCalledWith('call-user', {
        offer: expect.objectContaining({
          type: 'offer',
          sdp: 'mock-sdp'
        }),
        to: userId
      });
    });

    it('should handle call initiation errors gracefully', async () => {
      const { result } = renderHook(() => useWebRtc(mockSocket));
      const userId = 'user123';

      // Mock getUserMedia to throw an error
      const { mediaDevices } = require('react-native-webrtc');
      mediaDevices.getUserMedia.mockRejectedValueOnce(new Error('Permission denied'));

      await act(async () => {
        await result.current.callUser(userId);
      });

      // Should still attempt to call even if media fails
      expect(mockSocket.emit).toHaveBeenCalledWith('call-user', expect.any(Object));
    });
  });

  describe('Accept Call Functionality', () => {
    beforeEach(() => {
      // Mock incoming call
      mockSocket.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'call-made') {
          callback({ from: 'user456', offer: { type: 'offer', sdp: 'mock-sdp' } });
        }
      });
    });

    it('should accept incoming call successfully', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useWebRtc(mockSocket));

      // Wait for incoming call to be processed
      await waitForNextUpdate();

      expect(result.current.incomingCall).toBeTruthy();
      expect(result.current.modalVisible).toBe(true);

      await act(async () => {
        await result.current.acceptCall();
      });

      expect(result.current.isCalling).toBe(true);
      expect(result.current.incomingCall).toBe(null);
      expect(result.current.modalVisible).toBe(false);
      expect(mockSocket.emit).toHaveBeenCalledWith('make-answer', expect.objectContaining({
        answer: expect.objectContaining({
          type: 'answer',
          sdp: 'mock-sdp'
        }),
        to: 'user456'
      }));
    });

    it('should handle accept call errors by hanging up', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useWebRtc(mockSocket));

      // Wait for incoming call
      await waitForNextUpdate();

      // Mock setRemoteDescription to throw an error
      const { RTCPeerConnection } = require('react-native-webrtc');
      const mockPeerConnection = RTCPeerConnection();
      mockPeerConnection.setRemoteDescription.mockRejectedValueOnce(new Error('Failed to set remote description'));

      await act(async () => {
        await result.current.acceptCall();
      });

      expect(result.current.isCalling).toBe(false);
      expect(result.current.incomingCall).toBe(null);
    });

    it('should throw error when accepting call without incoming call', async () => {
      const { result } = renderHook(() => useWebRtc(mockSocket));

      await act(async () => {
        await expect(result.current.acceptCall()).rejects.toThrow('No incoming call');
      });
    });
  });

  describe('Reject Call Functionality', () => {
    beforeEach(() => {
      mockSocket.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'call-made') {
          callback({ from: 'user456', offer: { type: 'offer', sdp: 'mock-sdp' } });
        }
      });
    });

    it('should reject incoming call successfully', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useWebRtc(mockSocket));

      // Wait for incoming call
      await waitForNextUpdate();

      await act(async () => {
        await result.current.rejectCall();
      });

      expect(result.current.incomingCall).toBe(null);
      expect(result.current.modalVisible).toBe(false);
      expect(mockSocket.emit).toHaveBeenCalledWith('reject-call', { to: 'user456' });
    });
  });

  describe('Hang Up Functionality', () => {
    it('should hang up active call', async () => {
      const { result } = renderHook(() => useWebRtc(mockSocket));

      // First start a call
      await act(async () => {
        await result.current.callUser('user123');
      });

      expect(result.current.isCalling).toBe(true);

      // Then hang up
      await act(async () => {
        await result.current.hangUp();
      });

      expect(result.current.isCalling).toBe(false);
      expect(result.current.partnerId).toBe('');
      expect(mockSocket.emit).toHaveBeenCalledWith('end-call', { to: 'user123' });
    });

    it('should handle hang up without active call', async () => {
      const { result } = renderHook(() => useWebRtc(mockSocket));

      await act(async () => {
        await result.current.hangUp();
      });

      expect(result.current.isCalling).toBe(false);
      expect(mockSocket.emit).not.toHaveBeenCalledWith('end-call', expect.any(Object));
    });
  });

  describe('Modal Visibility', () => {
    it('should show modal when incoming call arrives and not in call', async () => {
      mockSocket.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'call-made') {
          callback({ from: 'user456', offer: { type: 'offer', sdp: 'mock-sdp' } });
        }
      });

      const { result, waitForNextUpdate } = renderHook(() => useWebRtc(mockSocket));

      await waitForNextUpdate();

      expect(result.current.modalVisible).toBe(true);
    });

    it('should not show modal when already in call', async () => {
      mockSocket.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'call-made') {
          callback({ from: 'user456', offer: { type: 'offer', sdp: 'mock-sdp' } });
        }
      });

      const { result, waitForNextUpdate } = renderHook(() => useWebRtc(mockSocket));

      // Start a call first
      await act(async () => {
        await result.current.callUser('user789');
      });

      // Then receive incoming call
      await waitForNextUpdate();

      expect(result.current.modalVisible).toBe(false);
    });
  });

  describe('ICE Candidate Handling', () => {
    it('should handle ICE candidates when remote description is set', async () => {
      const { result } = renderHook(() => useWebRtc(mockSocket));

      // Start a call to set up peer connection
      await act(async () => {
        await result.current.callUser('user123');
      });

      // Simulate ICE candidate event
      const iceCallback = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'ice-candidate')?.[1];
      
      await act(async () => {
        iceCallback({ candidate: { candidate: 'mock-candidate', sdpMid: '0' } });
      });

      const { RTCPeerConnection } = require('react-native-webrtc');
      const mockPeerConnection = RTCPeerConnection();
      expect(mockPeerConnection.addIceCandidate).toHaveBeenCalledWith(
        expect.objectContaining({
          candidate: 'mock-candidate'
        })
      );
    });

    it('should queue ICE candidates when remote description is not set', async () => {
      const { result } = renderHook(() => useWebRtc(mockSocket));

      // Simulate ICE candidate before peer connection is ready
      const iceCallback = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'ice-candidate')?.[1];
      
      await act(async () => {
        iceCallback({ candidate: { candidate: 'mock-candidate', sdpMid: '0' } });
      });

      // Should not add candidate immediately, but queue it
      const { RTCPeerConnection } = require('react-native-webrtc');
      const mockPeerConnection = RTCPeerConnection();
      expect(mockPeerConnection.addIceCandidate).not.toHaveBeenCalled();
    });
  });

  describe('WebRTC Events', () => {
    it('should handle answer-made event', async () => {
      const { result } = renderHook(() => useWebRtc(mockSocket));

      // Start a call first
      await act(async () => {
        await result.current.callUser('user123');
      });

      // Simulate answer
      const answerCallback = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'answer-made')?.[1];
      
      await act(async () => {
        answerCallback({ answer: { type: 'answer', sdp: 'mock-answer-sdp' } });
      });

      const { RTCPeerConnection } = require('react-native-webrtc');
      const mockPeerConnection = RTCPeerConnection();
      expect(mockPeerConnection.setRemoteDescription).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'answer',
          sdp: 'mock-answer-sdp'
        })
      );
    });

    it('should handle call-ended event', async () => {
      const { result } = renderHook(() => useWebRtc(mockSocket));

      // Start a call
      await act(async () => {
        await result.current.callUser('user123');
      });

      expect(result.current.isCalling).toBe(true);

      // Simulate call end
      const endCallback = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'call-ended')?.[1];
      
      await act(async () => {
        endCallback();
      });

      expect(result.current.isCalling).toBe(false);
    });

    it('should handle call-rejected event', async () => {
      const { result } = renderHook(() => useWebRtc(mockSocket));

      // Start a call
      await act(async () => {
        await result.current.callUser('user123');
      });

      expect(result.current.isCalling).toBe(true);

      // Simulate call rejection
      const rejectCallback = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'call-rejected')?.[1];
      
      await act(async () => {
        rejectCallback();
      });

      expect(result.current.isCalling).toBe(false);
    });
  });

  describe('Sound Loading', () => {
    it('should load sounds on mount', async () => {
      const { Audio } = require('expo-av');
      Audio.Sound.createAsync.mockResolvedValue({
        sound: {
          replayAsync: jest.fn(),
          stopAsync: jest.fn(),
          unloadAsync: jest.fn(),
          getStatusAsync: jest.fn(() => Promise.resolve({
            isLoaded: true,
            isPlaying: false,
          })),
        },
      });

      renderHook(() => useWebRtc(mockSocket));

      // Should attempt to load ringtone and call sounds
      expect(Audio.Sound.createAsync).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources on unmount', async () => {
      const { Audio } = require('expo-av');
      const mockSound = {
        replayAsync: jest.fn(),
        stopAsync: jest.fn(),
        unloadAsync: jest.fn(),
        getStatusAsync: jest.fn(() => Promise.resolve({
          isLoaded: true,
          isPlaying: false,
        })),
      };
      Audio.Sound.createAsync.mockResolvedValue({ sound: mockSound });

      const { unmount } = renderHook(() => useWebRtc(mockSocket));

      unmount();

      // Should cleanup sounds and socket listeners
      expect(mockSound.unloadAsync).toHaveBeenCalled();
      expect(mockSocket.off).toHaveBeenCalledTimes(5); // 5 event listeners
    });
  });
});
