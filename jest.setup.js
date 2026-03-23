// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  default: jest.fn(),
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

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

jest.mock('react-native-webrtc', () => ({
  mediaDevices: {
    getUserMedia: jest.fn(() => Promise.resolve({
      getTracks: jest.fn(() => [
        { stop: jest.fn() },
        { stop: jest.fn() }
      ]),
    })),
  },
  RTCPeerConnection: jest.fn(() => ({
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
  })),
  RTCSessionDescription: jest.fn(),
  RTCIceCandidate: jest.fn(),
  MediaStream: jest.fn(() => ({
    getTracks: jest.fn(() => [
      { stop: jest.fn() },
      { stop: jest.fn() }
    ]),
  })),
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'mock-document-directory/',
  makeDirectoryAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(),
}));

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
  NativeModules: {
    ...require('react-native').NativeModules,
    RNFastImage: {},
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667 })),
  },
  Alert: {
    alert: jest.fn(),
  },
}));

global.__DEV__ = true;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
