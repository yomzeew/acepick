import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemeText } from './ThemeText';
import { useTheme } from '../hooks/useTheme';
import { getColors } from '../static/color';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundaryClass extends Component<Props & { theme: string }, State> {
  constructor(props: Props & { theme: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback 
          error={this.state.error} 
          onReset={this.handleReset}
          theme={this.props.theme}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ 
  error?: Error; 
  onReset: () => void;
  theme: string;
}> = ({ error, onReset, theme }) => {
  const { backgroundColor, primaryColor } = getColors(theme as any);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>⚠️</Text>
        <ThemeText size={styles.title}>
          Oops! Something went wrong
        </ThemeText>
        <ThemeText size={styles.message}>
          {error?.message || 'An unexpected error occurred'}
        </ThemeText>
        <TouchableOpacity style={[styles.button, { backgroundColor: primaryColor }]} onPress={onReset}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ErrorBoundary: React.FC<Props> = ({ children, fallback }) => {
  const { theme } = useTheme();
  
  return (
    <ErrorBoundaryClass theme={theme} fallback={fallback}>
      {children}
    </ErrorBoundaryClass>
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
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorBoundary;
