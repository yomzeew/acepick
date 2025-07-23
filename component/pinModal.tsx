import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Vibration,
  Modal,
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

const Keypad = ({ onPress }: { onPress: (val: string) => void }) => {
  const keys = ['1','2','3','4','5','6','7','8','9','⌫','0','✓'];
  return (
    <View className="flex-row flex-wrap justify-center w-full">
      {keys.map(k => (
        <TouchableOpacity
          key={k}
          onPress={() => { Vibration.vibrate(40); onPress(k); }}
          className="w-20 h-16 m-2 rounded-xl bg-gray-200 justify-center items-center"
        >
          <Text className="text-xl font-bold">{k}</Text>
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
};

/* ---------- Component ---------- */
const PinModal = ({ visible, mode, onComplete, onClose }: PinModalProps) => {
  const { theme } = useTheme();
  const { primaryColor } = getColors(theme);

  const [step, setStep]           = useState(1);
  const [pin, setPin]             = useState('');
  const [confirmPin, setConfirm]  = useState('');
  const [error, setError]         = useState<string | null>(null);

  const resetAll = () => {
    setStep(1);
    setPin('');
    setConfirm('');
    setError(null);
  };

  const press = (key: string) => {
    if (key === '⌫') {
      step === 1 ? setPin(p => p.slice(0, -1))
                 : setConfirm(c => c.slice(0, -1));
      return;
    }

    if (key === '✓') {
      if (mode === 'transaction' && pin.length === 4) {
        onComplete(pin);
        onClose();
        resetAll();
      } 
      else if (mode === 'update') {
        if (step === 1 && pin.length === 4) {
          setStep(2);
        } else if (step === 2 && confirmPin.length === 4) {
          if (pin === confirmPin) {
            onComplete(pin);
            onClose();
            resetAll();
          } else {
            setError('PINs do not match');
            resetAll();
          }
        }
      }
      else if (mode === 'reset') {
        if (step === 1 && pin.length === 4) {
          setStep(2);
        } else if (step === 2 && confirmPin.length === 4) {
          // Send both old and new pin
          const payload = { oldPin: pin, newPin: confirmPin };
          onComplete(payload); // ✅ Pass as object
          onClose();
          resetAll();
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
          <Keypad onPress={press} />

          <TouchableOpacity onPress={() => { onClose(); resetAll(); }} className="mt-6">
            <Text style={{ color: primaryColor }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ContainerTemplate>
    </Modal>
  );
};

export default PinModal;
