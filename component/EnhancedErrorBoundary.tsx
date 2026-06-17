import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from 'hooks/useTheme';
import { getColors } from 'static/color';
import { Textstyles } from 'static/textFontsize';
import { AntDesign } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log error to monitoring service in production
    if (__DEV__ === false) {
      // TODO: Add error logging service (Sentry, etc.)
      console.warn('Error logging service not configured');
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback 
        error={this.state.error}
        onRetry={this.handleRetry}
      />;
    }

    return this.props.children;
  }
}

// Error fallback component with theme support
const ErrorFallback: React.FC<{
  error?: Error;
  onRetry: () => void;
}> = ({ error, onRetry }) => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, primaryTextColor, secondaryTextColor } = getColors(theme);

  const getErrorMessage = () => {
    if (!error) return "An unexpected error occurred";
    
    // User-friendly error messages
    if (error.message.includes('Network')) {
      return "Connection error. Please check your internet connection and try again.";
    }
    if (error.message.includes('Authentication')) {
      return "Authentication error. Please log in again.";
    }
    if (error.message.includes('Permission')) {
      return "Permission denied. You may not have access to this feature.";
    }
    
    return "Something went wrong. Please try again.";
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: primaryColor + '15' }]}>
          <AntDesign name="warning" size={48} color={primaryColor} />
        </View>
        
        <Text style={[styles.title, { color: primaryTextColor }]}>
          Oops! Something went wrong
        </Text>
        
        <Text style={[styles.message, { color: secondaryTextColor }]}>
          {getErrorMessage()}
        </Text>
        
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: primaryColor }]}
          onPress={onRetry}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
        
        {__DEV__ && error && (
          <View style={styles.debugInfo}>
            <Text style={[styles.debugTitle, { color: primaryTextColor }]}>
              Debug Info (Development Only)
            </Text>
            <Text style={[styles.debugText, { color: secondaryTextColor }]}>
              {error.message}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'TTFirsNeueMedium',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    fontFamily: 'TTFirsNeue',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'TTFirsNeueMedium',
  },
  debugInfo: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    width: '100%',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'TTFirsNeueMedium',
  },
  debugText: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
});

// Export the enhanced error boundary
export const ErrorBoundary = ErrorBoundaryClass;
export default ErrorBoundary;
