import { Socket } from 'socket.io-client';
import { store } from '../../redux/store';
import { initializeSocketListeners } from '../../services/socketHandler';

// Mock Redux store
jest.mock('../../redux/store', () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn(() => ({
      chat: { roomId: 'test-room' },
    })),
  },
}));

// Mock chat slice actions
jest.mock('../../redux/slices/chatSlice', () => ({
  addMessage: jest.fn(),
  setMessages: jest.fn(),
  setRoom: jest.fn(),
  setContacts: jest.fn(),
  setPreviousChats: jest.fn(),
}));

// Mock other slice actions
jest.mock('../../redux/slices/jobsSlice', () => ({
  updateJobStatus: jest.fn(),
  Job: {},
}));

jest.mock('../../redux/slices/deliverySlice', () => ({
  addNewDeliveryRequest: jest.fn(),
  removeDeliveryRequest: jest.fn(),
  updateOrderStatus: jest.fn(),
}));

// Mock socket instance
jest.mock('../../services/socketInstance', () => ({
  getSocket: jest.fn(() => null),
}));

describe('Socket Handler', () => {
  let mockSocket: jest.Mocked<Socket>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSocket = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
      connected: true,
      id: 'test-socket-id',
    } as any;
  });

  describe('initializeSocketListeners', () => {
    it('should set up socket listeners when socket is available', () => {
      initializeSocketListeners(mockSocket);

      expect(mockSocket.on).toHaveBeenCalledWith('connected', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('receive_message', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('receive_messages', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('receive_file', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('joined_room', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('got_previous_chats', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('all_contacts', expect.any(Function));
    });

    it('should not set up listeners when socket is null', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      initializeSocketListeners(null);

      expect(consoleSpy).toHaveBeenCalledWith('Socket not available yet');
      expect(mockSocket.on).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle connected event', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      initializeSocketListeners(mockSocket);
      
      const connectedCallback = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'connected')?.[1];
      if (connectedCallback) {
        connectedCallback('test-socket-id');
        expect(consoleSpy).toHaveBeenCalledWith('✅ Socket connected, id:', 'test-socket-id');
      }
      
      consoleSpy.mockRestore();
    });

    it('should handle receive_message event', () => {
      const { addMessage } = require('../../redux/slices/chatSlice');
      const { store } = require('../../redux/store');
      
      initializeSocketListeners(mockSocket);
      
      const messageData = {
        to: 'user123',
        from: 'user456',
        text: 'Hello',
        room: 'test-room',
        timestamp: '2023-01-01T00:00:00Z',
      };
      
      const messageCallback = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'receive_message')?.[1];
      if (messageCallback) {
        messageCallback(messageData);
        expect(store.dispatch).toHaveBeenCalledWith(addMessage(messageData));
      }
    });

    it('should handle receive_messages event', () => {
      const { setMessages } = require('../../redux/slices/chatSlice');
      const { store } = require('../../redux/store');
      
      initializeSocketListeners(mockSocket);
      
      const messages = [
        { to: 'user123', from: 'user456', text: 'Hello', timestamp: '2023-01-01T00:00:00Z' },
        { to: 'user123', from: 'user456', text: 'How are you?', timestamp: '2023-01-01T00:01:00Z' },
      ];
      
      const messagesCallback = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'receive_messages')?.[1];
      if (messagesCallback) {
        messagesCallback(messages);
        expect(store.dispatch).toHaveBeenCalledWith(setMessages(messages));
      }
    });

    it('should handle receive_file event', () => {
      const { addMessage } = require('../../redux/slices/chatSlice');
      const { store } = require('../../redux/store');
      
      initializeSocketListeners(mockSocket);
      
      const fileData = {
        from: 'user456',
        text: '<img src="https://example.com/file.jpg" />',
        timestamp: '2023-01-01T00:00:00Z',
      };
      
      const fileCallback = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'receive_file')?.[1];
      if (fileCallback) {
        fileCallback(fileData);
        
        const expectedMessage = {
          to: '',
          from: 'user456',
          text: '<img src="https://example.com/file.jpg" />',
          room: 'test-room',
          timestamp: '2023-01-01T00:00:00Z',
        };
        
        expect(store.dispatch).toHaveBeenCalledWith(addMessage(expectedMessage));
      }
    });

    it('should handle joined_room event', () => {
      const { setRoom } = require('../../redux/slices/chatSlice');
      const { store } = require('../../redux/store');
      
      initializeSocketListeners(mockSocket);
      
      const roomData = { roomId: 'test-room-123' };
      
      const roomCallback = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'joined_room')?.[1];
      if (roomCallback) {
        roomCallback(roomData);
        expect(store.dispatch).toHaveBeenCalledWith(setRoom(roomData.roomId));
      }
    });

    it('should handle got_previous_chats event', () => {
      const { setPreviousChats } = require('../../redux/slices/chatSlice');
      const { store } = require('../../redux/store');
      
      initializeSocketListeners(mockSocket);
      
      const previousChats = [
        { id: 1, name: 'Chat 1', members: 'user1,user2' },
        { id: 2, name: 'Chat 2', members: 'user1,user3' },
      ];
      
      const previousChatsCallback = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'got_previous_chats')?.[1];
      if (previousChatsCallback) {
        previousChatsCallback(previousChats);
        expect(store.dispatch).toHaveBeenCalledWith(setPreviousChats(previousChats));
      }
    });

    it('should handle all_contacts event', () => {
      const { setContacts } = require('../../redux/slices/chatSlice');
      const { store } = require('../../redux/store');
      
      initializeSocketListeners(mockSocket);
      
      const contacts = [
        { id: 'user1', email: 'user1@example.com', firstName: 'User', lastName: 'One' },
        { id: 'user2', email: 'user2@example.com', firstName: 'User', lastName: 'Two' },
      ];
      
      const contactsCallback = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'all_contacts')?.[1];
      if (contactsCallback) {
        contactsCallback(contacts);
        expect(store.dispatch).toHaveBeenCalledWith(setContacts(contacts));
      }
    });
  });

  describe('Socket Event Handling', () => {
    it('should handle job status updates', () => {
      const { updateJobStatus } = require('../../redux/slices/jobsSlice');
      const { store } = require('../../redux/store');
      
      initializeSocketListeners(mockSocket);
      
      const jobData = { jobId: 'job123', status: 'COMPLETED' };
      
      const jobCallback = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'job_status_update')?.[1];
      if (jobCallback) {
        jobCallback(jobData);
        expect(store.dispatch).toHaveBeenCalledWith(updateJobStatus(jobData));
      }
    });

    it('should handle delivery requests', () => {
      const { addNewDeliveryRequest } = require('../../redux/slices/deliverySlice');
      const { store } = require('../../redux/store');
      
      initializeSocketListeners(mockSocket);
      
      const deliveryData = { id: 'order123', pickupAddress: '123 Main St' };
      
      const deliveryCallback = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'NEW_DELIVERY_REQUEST')?.[1];
      if (deliveryCallback) {
        deliveryCallback({ data: deliveryData });
        expect(store.dispatch).toHaveBeenCalledWith(addNewDeliveryRequest(deliveryData));
      }
    });

    it('should handle order status updates', () => {
      const { updateOrderStatus } = require('../../redux/slices/deliverySlice');
      const { store } = require('../../redux/store');
      
      initializeSocketListeners(mockSocket);
      
      const orderData = { id: 'order123', status: 'en_route_to_pickup' };
      
      const orderCallback = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'ORDER_STATUS_UPDATE')?.[1];
      if (orderCallback) {
        orderCallback({ data: orderData });
        expect(store.dispatch).toHaveBeenCalledWith(updateOrderStatus({ orderId: 'order123', status: 'en_route_to_pickup' }));
      }
    });
  });
});
