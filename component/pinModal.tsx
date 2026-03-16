import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Vibration,
  Modal,
  ActivityIndicator,
} from 'react-native';
import ContainerTemplate from './dashboardComponent/containerTemplate';
import { AlertMessageBanner } from './AlertMessageBanner';
import { useTheme } from 'hooks/useTheme';
import { getColors } from 'static/color';
import { Textstyles } from 'static/textFontsize';
import { ThemeText } from './ThemeText';

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

  const [step, setStep]           = useState(1);
  const [pin, setPin]             = useState('');
  const [confirmPin, setConfirm]  = useState('');
  const [error, setError]         = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const resetAll = () => {
    setStep(1);
    setPin('');
    setConfirm('');
    setError(null);
  };

  const press = (key: string) => {
    if (loading || isProcessing) return; // Prevent input during loading

    if (key === '⌫') {
      step === 1 ? setPin(p => p.slice(0, -1))
                 : setConfirm(c => c.slice(0, -1));
      return;
    }

    if (key === '✓') {
      if (mode === 'transaction' && pin.length === 4) {
        setIsProcessing(true);
        onComplete(pin);
        setTimeout(() => {
          onClose();
          resetAll();
          setIsProcessing(false);
        }, 1000);
      } 
      else if (mode === 'update') {
        if (step === 1 && pin.length === 4) {
          setStep(2);
        } else if (step === 2 && confirmPin.length === 4) {
          if (pin === confirmPin) {
            setIsProcessing(true);
            onComplete(pin);
            setTimeout(() => {
              onClose();
              resetAll();
              setIsProcessing(false);
            }, 1000);
          } else {
            setError('PINs do not match');
            setTimeout(() => {
              resetAll();
            }, 1500);
          }
        }
      }
      else if (mode === 'reset') {
        if (step === 1 && pin.length === 4) {
          setStep(2);
        } else if (step === 2 && confirmPin.length === 4) {
          // Send both old and new pin
          const payload = { oldPin: pin, newPin: confirmPin };
          setIsProcessing(true);
          onComplete(payload);
          setTimeout(() => {
            onClose();
            resetAll();
            setIsProcessing(false);
          }, 1000);
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

  return (
    <Modal visible={visible} animationType="slide" transparent>
      {error && <AlertMessageBanner type="error" message={error} />}
      <ContainerTemplate>
        <View className="flex-1 items-center justify-center px-6">
          <ThemeText size={Textstyles.text_cmedium}>
            {getTitle()}
          </ThemeText>

          <PinBoxes pinLength={step === 1 ? pin.length : confirmPin.length} />
          
          {/* Loading indicator */}
          {(loading || isProcessing) && (
            <View className="absolute inset-0 items-center justify-center bg-white bg-opacity-90">
              <ActivityIndicator size="large" color={primaryColor} />
              <Text className="mt-4 text-gray-600">Processing...</Text>
            </View>
          )}

          <Keypad onPress={press} disabled={loading || isProcessing} />

          <TouchableOpacity 
            onPress={() => { 
              if (!loading && !isProcessing) {
                onClose(); 
                resetAll(); 
              }
            }} 
            className={`mt-6 ${loading || isProcessing ? 'opacity-50' : ''}`}
          >
            <Text style={{ color: primaryColor }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ContainerTemplate>
    </Modal>
  );
};

export default PinModal;
