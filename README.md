# AcePick Mobile App

A React Native/Expo mobile application for connecting professionals with clients.

## 🚀 Features

- **Authentication System**: Secure login/register with OTP verification
- **Professional Marketplace**: Connect with skilled professionals
- **Real-time Chat**: WebSocket-based messaging system
- **Payment Integration**: Secure payment processing
- **Location Services**: GPS-based service matching
- **Theme Support**: Light/Dark mode with system preference detection
- **Offline Support**: Redux persistence for offline functionality

## 🛠️ Tech Stack

- **Frontend**: React Native 0.79.3 + Expo SDK 53
- **State Management**: Redux Toolkit + Redux Persist
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: Expo Router v5
- **HTTP Client**: Axios + React Query
- **Real-time**: Socket.io
- **TypeScript**: Full type safety
- **Testing**: Jest (configured)

## 📱 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd acepick
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## 🔧 Development Scripts

```bash
# Code Quality
npm run lint          # Check for linting errors
npm run lint:fix      # Fix auto-fixable linting errors
npm run type-check    # TypeScript type checking
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting

# Testing
npm run test          # Run tests
npm run test:watch    # Run tests in watch mode

# Build
npm run build:clean   # Clean iOS build
npm run android:clean # Clean Android build
```

## 📁 Project Structure

```
acepick/
├── app/                    # Expo Router app directory
│   ├── (Authenticated)/   # Protected routes
│   ├── (NotAuthenticated)/ # Public routes
│   └── _layout.tsx        # Root layout
├── component/              # Reusable components
│   ├── dashboardComponent/ # Dashboard-specific components
│   ├── marketPlace/       # Marketplace components
│   └── ThemeText.tsx      # Themed text components
├── context/               # React Context providers
├── hooks/                 # Custom React hooks
├── pages/                 # Page components
├── redux/                 # Redux store and slices
├── services/              # API services
├── static/                # Static assets and constants
├── types/                 # TypeScript type definitions
├── utilizes/              # Utility functions
└── config/                # Environment configuration
```

## 🎨 Theming System

The app supports both light and dark themes with automatic system preference detection:

```typescript
import { useTheme } from 'hooks/useTheme';
import { getColors } from 'static/color';

const { theme, toggleTheme } = useTheme();
const { primaryColor, backgroundColor } = getColors(theme);
```

## 🔐 State Management

Redux Toolkit is used for global state management with persistence:

```typescript
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'redux/store';

const user = useSelector((state: RootState) => state.auth.user);
```

## 🌐 API Configuration

Environment-based API configuration:

```typescript
import { config } from 'config/environment';

// Automatically uses correct base URL based on NODE_ENV
const baseUrl = config.baseUrl;
```

## 📱 Component Guidelines

### Creating New Components

1. **Use TypeScript interfaces** for props
2. **Implement React.memo** for performance optimization
3. **Use custom hooks** for reusable logic
4. **Add accessibility props** for better UX
5. **Follow the naming convention**: PascalCase for components

```typescript
interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

const MyComponent: React.FC<MyComponentProps> = memo(({ title, onPress }) => {
  // Component implementation
});

MyComponent.displayName = 'MyComponent';
export default MyComponent;
```

### Performance Best Practices

- Use `useCallback` for event handlers
- Use `useMemo` for expensive calculations
- Implement `React.memo` for pure components
- Optimize list rendering with `FlatList`

## 🧪 Testing

### Running Tests

```bash
npm run test
npm run test:watch
```

### Test Structure

- Unit tests for utility functions
- Component tests with React Testing Library
- Integration tests for Redux slices
- E2E tests with Detox (planned)

## 🚀 Deployment

### Building for Production

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

### Environment Variables

Create `.env` files for different environments:

```bash
# .env.development
API_BASE_URL=https://dev.acepickdev.com

# .env.production
API_BASE_URL=https://www.acepickdev.com
```

## 📋 Code Quality Standards

### ESLint Rules

- No `any` types (strict TypeScript)
- Proper React Hooks usage
- Consistent code formatting
- React Native best practices

### Prettier Configuration

- Single quotes
- 2-space indentation
- 80 character line width
- Trailing commas

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and tests
5. Submit a pull request

### Commit Message Format

```
type(scope): description

feat(auth): add biometric authentication
fix(ui): resolve header alignment issue
docs(readme): update installation instructions
```

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### v1.0.0
- Initial release
- Core authentication system
- Professional marketplace
- Real-time chat functionality
- Payment integration
- Theme system
- Offline support

