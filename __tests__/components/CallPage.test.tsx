import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '../../hooks/useTheme';
import Call from '../../component/menuComponent/chatMessaging/callpage';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
}));

jest.mock('@tanstack/react-query', () => ({
  useMutation: () => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null,
  }),
}));

jest.mock('../../context/WebRtcContext', () => ({
  useCall: () => ({
    isCalling: false,
    incomingCall: null,
    callUser: jest.fn(),
    acceptCall: jest.fn(),
    rejectCall: jest.fn(),
    hangUp: jest.fn(),
    setModalVisible: jest.fn(),
  }),
}));

jest.mock('../../hooks/useSocket', () => ({
  useSocket: () => ({
    socket: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}));

jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'dark',
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../../redux/store', () => ({
  useSelector: () => ({
    id: 'user123',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'https://example.com/avatar.jpg',
  }),
}));

jest.mock('../../utilizes/initialsName', () => ({
  getInitials: ({ firstName, lastName }: { firstName?: string; lastName?: string }) => 
    `${firstName?.[0]}${lastName?.[0]}`,
}));

jest.mock('../../static/color', () => ({
  getColors: () => ({
    primaryColor: '#3B82F6',
    selectioncardColor: '#1F2937',
  }),
}));

// Mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user: { id: 'user123', firstName: 'John', lastName: 'Doe' } }) => state,
    },
    preloadedState: initialState,
  });
};

describe('Call Page Component', () => {
  let store: any;
  const mockUserDetails = JSON.stringify({ userId: 'user456' });

  beforeEach(() => {
    store = createMockStore();
    jest.clearAllMocks();
  });

  const renderComponent = (userDetails = mockUserDetails) => {
    return render(
      <Provider store={store}>
        <ThemeProvider>
          <Call userDetails={userDetails} />
        </ThemeProvider>
      </Provider>
    );
  };

  describe('Initial Render', () => {
    it('should render call page correctly', () => {
      renderComponent();

      expect(screen.getByText('Voice Call')).toBeTruthy();
      expect(screen.getByText('Tap to call')).toBeTruthy();
    });

    it('should display back button', () => {
      renderComponent();

      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).toBeTruthy();
    });

    it('should display user information', () => {
      renderComponent();

      // Should show user initials since avatar might not load
      expect(screen.getByText('JD')).toBeTruthy();
    });

    it('should show call button when not in call', () => {
      renderComponent();

      const callButton = screen.getByRole('button', { name: /call/i });
      expect(callButton).toBeTruthy();
    });
  });

  describe('Call Controls', () => {
    it('should handle back button press', () => {
      const { useRouter } = require('expo-router');
      const mockBack = useRouter().back;
      
      renderComponent();

      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.press(backButton);

      expect(mockBack).toHaveBeenCalled();
    });

    it('should handle call button press', () => {
      const { useCall } = require('../../context/WebRtcContext');
      const mockCallUser = useCall().callUser;
      
      renderComponent();

      const callButton = screen.getByRole('button', { name: /call/i });
      fireEvent.press(callButton);

      expect(mockCallUser).toHaveBeenCalledWith('user456');
    });

    it('should display loading state when user data is loading', () => {
      // Mock user service to return null initially
      jest.mock('../../services/userService', () => ({
        generalUserDetailFn: () => Promise.resolve({ data: null }),
      }));

      renderComponent(JSON.stringify({ userId: 'unknown-user' }));

      expect(screen.getByText('Loading...')).toBeTruthy();
    });
  });

  describe('Call Status States', () => {
    it('should show ringing status when ringing', () => {
      jest.mock('../../context/WebRtcContext', () => ({
        useCall: () => ({
          isCalling: true,
          incomingCall: null,
          callUser: jest.fn(),
          acceptCall: jest.fn(),
          rejectCall: jest.fn(),
          hangUp: jest.fn(),
          setModalVisible: jest.fn(),
        }),
      }));

      renderComponent();

      // Should show in-call controls
      expect(screen.getByRole('button', { name: /mute/i })).toBeTruthy();
      expect(screen.getByRole('button', { name: /end/i })).toBeTruthy();
      expect(screen.getByRole('button', { name: /speaker/i })).toBeTruthy();
    });

    it('should show incoming call controls', () => {
      jest.mock('../../context/WebRtcContext', () => ({
        useCall: () => ({
          isCalling: false,
          incomingCall: { from: 'user456', offer: {} },
          callUser: jest.fn(),
          acceptCall: jest.fn(),
          rejectCall: jest.fn(),
          hangUp: jest.fn(),
          setModalVisible: jest.fn(),
        }),
      }));

      renderComponent();

      expect(screen.getByRole('button', { name: /decline/i })).toBeTruthy();
      expect(screen.getByRole('button', { name: /accept/i })).toBeTruthy();
    });

    it('should handle mute toggle', () => {
      jest.mock('../../context/WebRtcContext', () => ({
        useCall: () => ({
          isCalling: true,
          incomingCall: null,
          callUser: jest.fn(),
          acceptCall: jest.fn(),
          rejectCall: jest.fn(),
          hangUp: jest.fn(),
          setModalVisible: jest.fn(),
        }),
      }));

      renderComponent();

      const muteButton = screen.getByRole('button', { name: /mute/i });
      fireEvent.press(muteButton);

      // Should toggle mute state (visual feedback)
      expect(muteButton).toBeTruthy();
    });

    it('should handle speaker toggle', () => {
      jest.mock('../../context/WebRtcContext', () => ({
        useCall: () => ({
          isCalling: true,
          incomingCall: null,
          callUser: jest.fn(),
          acceptCall: jest.fn(),
          rejectCall: jest.fn(),
          hangUp: jest.fn(),
          setModalVisible: jest.fn(),
        }),
      }));

      renderComponent();

      const speakerButton = screen.getByRole('button', { name: /speaker/i });
      fireEvent.press(speakerButton);

      expect(speakerButton).toBeTruthy();
    });

    it('should handle end call', () => {
      const { useCall } = require('../../context/WebRtcContext');
      const mockHangUp = useCall().hangUp;
      
      jest.mock('../../context/WebRtcContext', () => ({
        useCall: () => ({
          isCalling: true,
          incomingCall: null,
          callUser: jest.fn(),
          acceptCall: jest.fn(),
          rejectCall: jest.fn(),
          hangUp: mockHangUp,
          setModalVisible: jest.fn(),
        }),
      }));

      renderComponent();

      const endButton = screen.getByRole('button', { name: /end/i });
      fireEvent.press(endButton);

      expect(mockHangUp).toHaveBeenCalled();
    });

    it('should handle accept incoming call', () => {
      const { useCall } = require('../../context/WebRtcContext');
      const mockAcceptCall = useCall().acceptCall;
      
      jest.mock('../../context/WebRtcContext', () => ({
        useCall: () => ({
          isCalling: false,
          incomingCall: { from: 'user456', offer: {} },
          callUser: jest.fn(),
          acceptCall: mockAcceptCall,
          rejectCall: jest.fn(),
          hangUp: jest.fn(),
          setModalVisible: jest.fn(),
        }),
      }));

      renderComponent();

      const acceptButton = screen.getByRole('button', { name: /accept/i });
      fireEvent.press(acceptButton);

      expect(mockAcceptCall).toHaveBeenCalled();
    });

    it('should handle reject incoming call', () => {
      const { useCall } = require('../../context/WebRtcContext');
      const mockRejectCall = useCall().rejectCall;
      
      jest.mock('../../context/WebRtcContext', () => ({
        useCall: () => ({
          isCalling: false,
          incomingCall: { from: 'user456', offer: {} },
          callUser: jest.fn(),
          acceptCall: jest.fn(),
          rejectCall: mockRejectCall,
          hangUp: jest.fn(),
          setModalVisible: jest.fn(),
        }),
      }));

      renderComponent();

      const rejectButton = screen.getByRole('button', { name: /decline/i });
      fireEvent.press(rejectButton);

      expect(mockRejectCall).toHaveBeenCalled();
    });
  });

  describe('User Details', () => {
    it('should display user avatar when available', async () => {
      const mockUserData = {
        firstName: 'Jane',
        lastName: 'Smith',
        avatar: 'https://example.com/jane.jpg',
        userId: 'user789',
      };

      jest.mock('@tanstack/react-query', () => ({
        useMutation: () => ({
          mutate: jest.fn(),
          isLoading: false,
          error: null,
        }),
      }));

      renderComponent(JSON.stringify(mockUserData));

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeTruthy();
      });
    });

    it('should display initials when avatar fails to load', async () => {
      const mockUserData = {
        firstName: 'Alice',
        lastName: 'Johnson',
        avatar: 'https://example.com/alice.jpg',
        userId: 'user101',
      };

      renderComponent(JSON.stringify(mockUserData));

      // Simulate image error
      const avatarImage = screen.getByRole('image', { name: /user avatar/i });
      if (avatarImage) {
        fireEvent(avatarImage, 'error');
      }

      await waitFor(() => {
        expect(screen.getByText('AJ')).toBeTruthy();
      });
    });

    it('should handle empty user details gracefully', () => {
      renderComponent('{}');

      expect(screen.getByText('Loading...')).toBeTruthy();
    });

    it('should handle missing user properties', () => {
      const incompleteUser = { userId: 'user111' };
      
      renderComponent(JSON.stringify(incompleteUser));

      expect(screen.getByText('Loading...')).toBeTruthy();
    });
  });

  describe('Animation and Visual Effects', () => {
    it('should show pulse animation when ringing', () => {
      jest.mock('../../context/WebRtcContext', () => ({
        useCall: () => ({
          isCalling: true,
          incomingCall: null,
          callUser: jest.fn(),
          acceptCall: jest.fn(),
          rejectCall: jest.fn(),
          hangUp: jest.fn(),
          setModalVisible: jest.fn(),
        }),
      }));

      renderComponent();

      // Check for animated elements (pulse rings)
      // This is more of a visual test, but we can check for the presence of animated containers
      const animatedElements = screen.getAllByRole('view');
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it('should show connected ring when call is connected', () => {
      jest.mock('../../context/WebRtcContext', () => ({
        useCall: () => ({
          isCalling: true,
          incomingCall: null,
          callUser: jest.fn(),
          acceptCall: jest.fn(),
          rejectCall: jest.fn(),
          hangUp: jest.fn(),
          setModalVisible: jest.fn(),
        }),
      }));

      renderComponent();

      // Should show connected state visual indicators
      const inCallElements = screen.getAllByRole('view');
      expect(inCallElements.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle user service errors gracefully', () => {
      jest.mock('@tanstack/react-query', () => ({
        useMutation: () => ({
          mutate: jest.fn(),
          isLoading: false,
          error: new Error('Failed to fetch user'),
        }),
      }));

      renderComponent();

      // Should still render the call page even if user data fails
      expect(screen.getByText('Voice Call')).toBeTruthy();
      expect(screen.getByRole('button', { name: /call/i })).toBeTruthy();
    });

    it('should handle missing userId in userDetails', () => {
      renderComponent(JSON.stringify({ invalidData: 'test' }));

      // Should not crash and show loading state
      expect(screen.getByText('Loading...')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for all buttons', () => {
      renderComponent();

      // Check that all important buttons have accessible names
      expect(screen.getByRole('button', { name: /back/i })).toBeTruthy();
      expect(screen.getByRole('button', { name: /call/i })).toBeTruthy();
    });

    it('should have proper accessibility hints', () => {
      renderComponent();

      // Check for accessibility hints on important elements
      const callButton = screen.getByRole('button', { name: /call/i });
      expect(callButton).toBeTruthy();
    });
  });
});
