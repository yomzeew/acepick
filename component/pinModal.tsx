import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Vibration,
  Modal,
  ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import ContainerTemplate from './dashboardComponent/containerTemplate';
import { useToast } from 'context/ToastContext';
import { useTheme } from 'hooks/useTheme';
import { getColors } from 'static/color';
import { Textstyles } from 'static/textFontsize';
import { ThemeText } from './ThemeText';
import { useSecureAuth } from 'hooks/useSecureAuth';
import { Ionicons } from '@expo/vector-icons';

const PAYMENT_PIN_KEY = 'paymentPin';
const PAYMENT_BIOMETRIC_ENABLED_KEY = 'paymentBiometricEnabled';

/* ---------- Tiny helpers ---------- */
const PinBoxes = ({ pinLength }: { pinLength: number }) => (
  <View className="flex-row justify-center mb-5">
    {Array.from({ length: 4 }).map((_, idx) => (
      <View
        key={idx}
        className="w-10 h-10 mx-2 rounded-xl border justify-center items-center"
        style={{
          borderWidth: 1.5,
          borderColor: '#888',
          backgroundColor: pinLength > idx ? '#333' : '#fff',
        }}
      />
    ))}
  </View>
);

const Keypad = ({ onPress, disabled }: { onPress: (val: string) => void; disabled?: boolean }) => {
  const keys = ['1','2','3','4','5','6','7','8','9','⌫','0','✓'];
  return (
    <View className="flex-row flex-wrap justify-center w-full">
      {keys.map(k => (
        <TouchableOpacity
          key={k}
          onPress={() => { Vibration.vibrate(40); onPress(k); }}
          disabled={disabled}
          className={`w-20 h-16 m-2 rounded-xl justify-center items-center ${
            disabled ? 'bg-gray-300 opacity-50' : 'bg-gray-200'
          }`}
        >
          <Text className={`text-xl font-bold ${disabled ? 'text-gray-400' : 'text-black'}`}>{k}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

/* ---------- Props ---------- */
type PinModalProps = {
  visible: boolean;
  mode: 'transaction' | 'update' | 'reset';
  onComplete: (pin:any) => void;
  onClose: () => void;
  loading?: boolean;
};

/* ---------- Component ---------- */
const PinModal = ({ visible, mode, onComplete, onClose, loading = false }: PinModalProps) => {
  const { theme } = useTheme();
  const { primaryColor } = getColors(theme);
  const isDark = theme === 'dark';
  const toast = useToast();
  const { isBiometricAvailable, getBiometricType } = useSecureAuth();

  const [step, setStep]               = useState(1);
  const [pin, setPin]                 = useState('');
  const [confirmPin, setConfirm]      = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [canUseBiometric, setCanUseBiometric] = useState(false);
  const [biometricType, setBiometricType]     = useState<'face' | 'fingerprint' | 'iris' | null>(null);
  const [showBiometricOffer, setShowBiometricOffer] = useState(false);
  const [pendingPin, setPendingPin]           = useState('');
  const [biometricLoading, setBiometricLoading] = useState(false);

  useEffect(() => {
    if (visible && mode === 'transaction') {
      checkBiometricAvailability();
    }
    if (!visible) {
      setShowBiometricOffer(false);
      setPendingPin('');
    }
  }, [visible, mode]);

  const checkBiometricAvailability = async () => {
    const available = await isBiometricAvailable();
    if (!available) return;
    const storedPin = await SecureStore.getItemAsync(PAYMENT_BIOMETRIC_ENABLED_KEY);
    setCanUseBiometric(!!storedPin);
    const type = await getBiometricType();
    setBiometricType(type);
  };

  const handleBiometricAuth = async () => {
    setBiometricLoading(true);
    try {
      const storedPin = await SecureStore.getItemAsync(PAYMENT_PIN_KEY, {
        requireAuthentication: true,
      });
      if (storedPin) {
        onComplete(storedPin);
        resetAll();
        onClose();
      } else {
        toast.error('Biometric Failed', 'Could not retrieve PIN. Please use your PIN.');
      }
    } catch {
      toast.error('Biometric Failed', 'Authentication cancelled. Please use your PIN.');
    } finally {
      setBiometricLoading(false);
    }
  };

  const enableBiometrics = async () => {
    try {
      await SecureStore.setItemAsync(PAYMENT_PIN_KEY, pendingPin, {
        requireAuthentication: true,
      });
      await SecureStore.setItemAsync(PAYMENT_BIOMETRIC_ENABLED_KEY, 'true');
      setCanUseBiometric(true);
      toast.success('Biometrics Enabled', 'You can now use biometrics to authorise payments');
    } catch {
      toast.error('Error', 'Could not enable biometrics. Please try again.');
    } finally {
      setShowBiometricOffer(false);
      setPendingPin('');
      onComplete(pendingPin);
      setTimeout(() => { onClose(); resetAll(); setIsProcessing(false); }, 800);
    }
  };

  const skipBiometrics = () => {
    setShowBiometricOffer(false);
    onComplete(pendingPin);
    setPendingPin('');
    setTimeout(() => { onClose(); resetAll(); setIsProcessing(false); }, 800);
  };

  const resetAll = () => {
    setStep(1);
    setPin('');
    setConfirm('');
  };

  const press = (key: string) => {
    if (loading || isProcessing) return;

    if (key === '⌫') {
      step === 1 ? setPin(p => p.slice(0, -1))
                 : setConfirm(c => c.slice(0, -1));
      return;
    }

    if (key === '✓') {
      if (mode === 'transaction' && pin.length === 4) {
        setIsProcessing(true);
        const available = isBiometricAvailable();
        available.then(async (avail) => {
          const alreadyEnabled = await SecureStore.getItemAsync(PAYMENT_BIOMETRIC_ENABLED_KEY);
          if (avail && !alreadyEnabled) {
            setPendingPin(pin);
            setShowBiometricOffer(true);
          } else {
            onComplete(pin);
            setTimeout(() => { onClose(); resetAll(); setIsProcessing(false); }, 800);
          }
        });
      }
      else if (mode === 'update') {
        if (step === 1 && pin.length === 4) {
          setStep(2);
        } else if (step === 2 && confirmPin.length === 4) {
          if (pin === confirmPin) {
            setIsProcessing(true);
            onComplete(pin);
            setTimeout(() => { onClose(); resetAll(); setIsProcessing(false); }, 1000);
          } else {
            toast.error("PIN Mismatch", "PINs do not match. Please try again.");
            setTimeout(() => { resetAll(); }, 1500);
          }
        }
      }
      else if (mode === 'reset') {
        if (step === 1 && pin.length === 4) {
          setStep(2);
        } else if (step === 2 && confirmPin.length === 4) {
          const payload = { oldPin: pin, newPin: confirmPin };
          setIsProcessing(true);
          onComplete(payload);
          setTimeout(() => { onClose(); resetAll(); setIsProcessing(false); }, 1000);
        }
      }
      return;
    }

    if (!/^\d$/.test(key)) return;

    step === 1
      ? pin.length < 4 && setPin(pin + key)
      : confirmPin.length < 4 && setConfirm(confirmPin + key);
  };

  const getTitle = () => {
    if (mode === 'transaction') return 'Enter PIN to Authorise';
    if (mode === 'update') return step === 1 ? 'Set New PIN' : 'Confirm PIN';
    if (mode === 'reset') return step === 1 ? 'Enter Old PIN' : 'Enter New PIN';
    return '';
  };

  const biometricIcon = biometricType === 'face' ? 'face-id' : 'finger-print';
  const biometricLabel = biometricType === 'face' ? 'Face ID' : 'Fingerprint';

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <ContainerTemplate>
        <View className="flex-1 items-center justify-center px-6">

          {/* ── Biometric offer screen ── */}
          {showBiometricOffer ? (
            <View className="w-full items-center">
              <View style={{
                width: 72, height: 72, borderRadius: 36,
                backgroundColor: primaryColor + '18',
                alignItems: 'center', justifyContent: 'center', marginBottom: 20,
              }}>
                <Ionicons name="finger-print" size={36} color={primaryColor} />
              </View>
              <ThemeText size={Textstyles.text_cmedium}>Enable Biometrics?</ThemeText>
              <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 32, fontSize: 13, lineHeight: 20 }}>
                Use Face ID or Fingerprint to authorise future payments without entering your PIN
              </Text>
              <TouchableOpacity
                onPress={enableBiometrics}
                style={{
                  width: '100%', backgroundColor: primaryColor,
                  borderRadius: 14, paddingVertical: 14,
                  alignItems: 'center', marginBottom: 12,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Enable Biometrics</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={skipBiometrics} style={{ paddingVertical: 12 }}>
                <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 14 }}>Not now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ThemeText size={Textstyles.text_cmedium}>
                {getTitle()}
              </ThemeText>

              <PinBoxes pinLength={step === 1 ? pin.length : confirmPin.length} />

              {/* Biometric button — only in transaction mode when available */}
              {mode === 'transaction' && canUseBiometric && (
                <TouchableOpacity
                  onPress={handleBiometricAuth}
                  disabled={biometricLoading || loading}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: primaryColor + '15',
                    borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12,
                    marginBottom: 16,
                  }}
                >
                  {biometricLoading
                    ? <ActivityIndicator size="small" color={primaryColor} />
                    : <Ionicons name={biometricIcon as any} size={22} color={primaryColor} />
                  }
                  <Text style={{ color: primaryColor, fontWeight: '600', marginLeft: 10, fontSize: 14 }}>
                    {biometricLoading ? 'Authenticating...' : `Use ${biometricLabel}`}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Loading overlay */}
              {(loading || isProcessing) && (
                <View className="absolute inset-0 items-center justify-center bg-white bg-opacity-90">
                  <ActivityIndicator size="large" color={primaryColor} />
                  <Text className="mt-4 text-gray-600">Processing...</Text>
                </View>
              )}

              <Keypad onPress={press} disabled={loading || isProcessing} />

              <TouchableOpacity
                onPress={() => {
                  if (!loading && !isProcessing) { onClose(); resetAll(); }
                }}
                className={`mt-6 ${loading || isProcessing ? 'opacity-50' : ''}`}
              >
                <Text style={{ color: primaryColor }}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ContainerTemplate>
    </Modal>
  );
};

export default PinModal;
