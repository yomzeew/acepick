import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import InputComponent from "component/controls/textinput";
import ButtonComponent from "component/buttoncomponent";
import { useMutation } from "@tanstack/react-query";
import { sendOtp } from "services/authServices";
import { normalizePhone } from "utilizes/phoneNumberNormalize";
import { useDispatch } from "react-redux";
import { setRegistrationData } from "redux/slices/authSlice";
import { useDelay } from "hooks/useDelay";
import { useToast } from "context/ToastContext";

interface EmailPhoneStepProps {
  onNext: () => void;
  roleLabel: string;
}

const EmailPhoneStep = ({ onNext, roleLabel }: EmailPhoneStepProps) => {
  const { theme } = useTheme();
  const { primaryColor, subText, backgroundColortwo } = getColors(theme);
  const isDark = theme === 'dark';
  const toast = useToast();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [shouldProceed, setShouldProceed] = useState(false);

  const cardBg   = isDark ? '#1F2937' : '#FFFFFF';
  const border   = isDark ? '#374151' : '#E5E7EB';
  const textMain = isDark ? '#F9FAFB' : '#111827';

  const validatePhone = (p: string): string | null => {
    const clean = p.replace(/[^0-9+]/g, '');
    if (!clean) return "Phone number is required";
    if (p !== clean) return "Only numbers and + allowed";
    const norm = normalizePhone(clean);
    if (!/^\+234[0-9]{10}$/.test(norm)) return "Enter a valid Nigerian number (e.g. 08012345678)";
    return null;
  };

  const handlePhoneChange = (v: string) => {
    setPhone(v);
    setPhoneError(validatePhone(v));
  };

  useDelay(() => {
    if (shouldProceed) {
      dispatch(setRegistrationData({ email, phone: normalizePhone(phone) }));
      onNext();
    }
  }, 2000, [shouldProceed]);

  const mutation = useMutation({
    mutationFn: sendOtp,
    onSuccess: (data) => {
      const { emailSendStatus, smsSendStatus } = data.data;
      const emailOk = emailSendStatus === true;
      const smsOk   = smsSendStatus   === true;
      if (emailOk || smsOk) {
        toast.success('OTP Sent', emailOk && smsOk ? 'OTP sent to email & phone' : emailOk ? 'OTP sent to your email' : 'OTP sent to your phone');
        setShouldProceed(true);
      } else {
        toast.error('Verification Failed', 'Could not send OTP. Please check your email and phone number.');
      }
    },
    onError: (error: any) => {
      toast.error('Error', error?.response?.data?.message || error?.message || 'Something went wrong');
    },
  });

  const handleNext = () => {
    if (!email || !phone) { toast.error('Missing Fields', 'Please fill both email and phone'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error('Invalid Email', 'Enter a valid email address'); return; }
    const phoneErr = validatePhone(phone);
    if (phoneErr) { toast.error('Invalid Phone', phoneErr); return; }
    mutation.mutate({ email, phone: normalizePhone(phone), type: 'EMAIL', reason: 'verification' });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 32 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Info banner */}
        <View style={[styles.banner, { backgroundColor: primaryColor + '12', borderColor: primaryColor + '30' }]}>
          <Ionicons name="shield-checkmark-outline" size={20} color={primaryColor} />
          <Text style={[styles.bannerText, { color: primaryColor }]}>
            We'll send a verification code to confirm your identity
          </Text>
        </View>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          {/* Email */}
          <View style={styles.fieldGroup}>
            <View style={styles.fieldLabel}>
              <Ionicons name="mail-outline" size={15} color={primaryColor} />
              <Text style={[styles.label, { color: textMain }]}>Email Address</Text>
            </View>
            <InputComponent
              color={primaryColor}
              placeholder="yourname@email.com"
              placeholdercolor={subText}
              value={email}
              onChange={(v: string) => setEmail(v.toLowerCase())}
              keyboardType="email-address"
              autoCapitalize="none"
              editable
            />
          </View>

          <View style={[styles.divider, { backgroundColor: border }]} />

          {/* Phone */}
          <View style={styles.fieldGroup}>
            <View style={styles.fieldLabel}>
              <Ionicons name="call-outline" size={15} color={primaryColor} />
              <Text style={[styles.label, { color: textMain }]}>Phone Number</Text>
            </View>
            <InputComponent
              color={primaryColor}
              placeholder="08012345678"
              placeholdercolor={subText}
              value={phone}
              onChange={handlePhoneChange}
              keyboardType="phone-pad"
              maxLength={14}
              editable
            />
            {phoneError ? (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle-outline" size={13} color={backgroundColortwo} />
                <Text style={[styles.errorText, { color: backgroundColortwo }]}>{phoneError}</Text>
              </View>
            ) : (
              <Text style={[styles.hint, { color: subText }]}>Format: 080 or +234</Text>
            )}
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          <ButtonComponent
            color={primaryColor}
            text={mutation.isPending ? "Sending OTP…" : "Send Verification Code"}
            textcolor="#fff"
            onPress={handleNext}
            isLoading={mutation.isPending}
            disabled={!email || !phone || !!phoneError || mutation.isPending}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    marginTop: 8, marginBottom: 16,
  },
  bannerText: { flex: 1, fontSize: 13, fontFamily: 'TTFirsNeue', lineHeight: 18 },

  card: {
    borderRadius: 20, borderWidth: 1,
    padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  fieldGroup: { gap: 8 },
  fieldLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: 13, fontWeight: '600', fontFamily: 'TTFirsNeueMedium' },
  divider: { height: 1, marginVertical: 16 },
  hint: { fontSize: 11, fontFamily: 'TTFirsNeue', marginTop: 2 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  errorText: { fontSize: 11, fontFamily: 'TTFirsNeue' },
});

export default EmailPhoneStep;
