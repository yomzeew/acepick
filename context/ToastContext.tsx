import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'hooks/useTheme';
import { getColors } from 'static/color';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

interface ToastStateContextType {
  toasts: ToastMessage[];
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);
const ToastStateContext = createContext<ToastStateContextType | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const InModalToastContainer = () => {
  const ctx = useContext(ToastStateContext);
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { primaryColor, backgroundColortwo } = getColors(theme);
  if (!ctx || ctx.toasts.length === 0) return null;
  return (
    <View
      style={{
        position: 'absolute',
        top: insets.top + 8,
        left: 0,
        right: 0,
        zIndex: 9999,
        elevation: 9999,
      }}
      pointerEvents="box-none"
    >
      {ctx.toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={ctx.dismiss} successColor={primaryColor} errorColor={backgroundColortwo} />
      ))}
    </View>
  );
};

const TOAST_ICONS: Record<ToastType, any> = {
  success: 'checkmark-circle',
  error: 'close-circle',
  info: 'information-circle',
};

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
  successColor: string;
  errorColor: string;
}

const ToastItem = ({ toast, onDismiss, successColor, errorColor }: ToastItemProps) => {
  const toastColors: Record<ToastType, string> = {
    success: successColor,
    error: errorColor,
    info: successColor,
  };
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-30)).current;
  const bg = toastColors[toast.type];
  const iconName = TOAST_ICONS[toast.type];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(opacity, { toValue: 1, useNativeDriver: true, friction: 8 }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8 }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -30, duration: 300, useNativeDriver: true }),
      ]).start(() => onDismiss(toast.id));
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
        backgroundColor: bg,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <Ionicons name={iconName} size={22} color="#fff" />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{toast.title}</Text>
        {toast.message ? (
          <Text style={{ color: '#ffffffcc', fontSize: 12, marginTop: 2 }}>{toast.message}</Text>
        ) : null}
      </View>
      <Pressable onPress={() => onDismiss(toast.id)} hitSlop={8}>
        <Ionicons name="close" size={18} color="#ffffffaa" />
      </Pressable>
    </Animated.View>
  );
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const idRef = useRef(0);
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { primaryColor, backgroundColortwo } = getColors(theme);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string, duration?: number) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev.slice(-2), { id, type, title, message, duration: duration || 3000 }]);
  }, []);

  const success = useCallback((title: string, message?: string) => showToast('success', title, message), [showToast]);
  const error = useCallback((title: string, message?: string) => showToast('error', title, message), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast('info', title, message), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      <ToastStateContext.Provider value={{ toasts, dismiss }}>
        {children}
        {toasts.length > 0 && (
          <View
            style={{
              position: 'absolute',
              top: insets.top + 8,
              left: 0,
              right: 0,
              zIndex: 9999,
              elevation: 9999,
            }}
            pointerEvents="box-none"
          >
            {toasts.map((t) => (
              <ToastItem key={t.id} toast={t} onDismiss={dismiss} successColor={primaryColor} errorColor={backgroundColortwo} />
            ))}
          </View>
        )}
      </ToastStateContext.Provider>
    </ToastContext.Provider>
  );
};
