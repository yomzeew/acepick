import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Vibration,
  Modal,          // ← use React-Native modal for visibility
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
  visible: boolean;                 // ← control from parent
  mode: 'transaction' | 'update';
  onComplete: (pin: string) => void;
  onClose: () => void;              // ← dismiss callback (modal & parent)
};

/* ---------- Component ---------- */
const PinModal = ({ visible, mode, onComplete, onClose }: PinModalProps) => {
  const { theme } = useTheme();
  const { primaryColor } = getColors(theme);

  const [step, setStep]           = useState(1);
  const [pin, setPin]             = useState('');
  const [confirmPin, setConfirm]  = useState('');
  const [error, setError]         = useState<string | null>(null);

  /* -- handle numeric / control keys -- */
  const press = (key: string) => {
    if (key === '⌫') {
      step === 1 ? setPin(p => p.slice(0, -1))
                 : setConfirm(c => c.slice(0, -1));
      return;
    }

    if (key === '✓') {
      if (mode === 'transaction' && pin.length === 4) {
        onComplete(pin);
        onClose();                        // auto-dismiss
      } else if (mode === 'update') {
        if (step === 1 && pin.length === 4)      setStep(2);
        else if (step === 2 && confirmPin.length === 4) {
          if (pin === confirmPin) {
            onComplete(pin);
            onClose();                    // auto-dismiss
          } else {
            setError('PINs do not match');
            setPin(''); setConfirm(''); setStep(1);
          }
        }
      }
      return;
    }

    if (!/^\d$/.test(key)) return;        // ignore non-digits

    step === 1
      ? pin.length      < 4 && setPin(pin + key)
      : confirmPin.length < 4 && setConfirm(confirmPin + key);
  };

  /* -- presentation -- */
  return (
    <Modal visible={visible} animationType="slide" transparent>
      {error && <AlertMessageBanner type="error" message={error} />}
      <ContainerTemplate>
        <View className="flex-1 items-center justify-center px-6">
          <ThemeText size={Textstyles.text_cmedium}>
            {mode === 'transaction'
              ? 'Enter PIN to Authorise'
              : step === 1 ? 'Set New PIN' : 'Confirm PIN'}
          </ThemeText>

          <PinBoxes pinLength={step === 1 ? pin.length : confirmPin.length} />
          <Keypad onPress={press} />

          <TouchableOpacity onPress={onClose} className="mt-6">
            <Text style={{ color: primaryColor }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ContainerTemplate>
    </Modal>
  );
};

export default PinModal;
