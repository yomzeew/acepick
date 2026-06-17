import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { useEffect, useState, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import OtpComponent from "component/controls/otpcomponent";
import ButtonComponent from "component/buttoncomponent";
import { useSelector } from "react-redux";
import type { RootState } from "redux/store";
import { useMutation } from "@tanstack/react-query";
import { sendOtp, verifyOtp } from "services/authServices";
import { useDelay } from "hooks/useDelay";
import { useToast } from "context/ToastContext";

interface OtpVerificationStepProps {
  onNext: () => void;
}

const OtpVerificationStep = ({ onNext }: OtpVerificationStepProps) => {
  const { theme } = useTheme();
  const { primaryColor, subText } = getColors(theme);
  const isDark = theme === 'dark';
  const toast  = useToast();

  const phone = useSelector((s: RootState) => s.auth?.registrationData?.phone ?? '');
  const email = useSelector((s: RootState) => s.auth?.registrationData?.email ?? '');

  const maskedEmail = email.length > 4
    ? email.slice(0, 2) + '***' + email.slice(email.indexOf('@'))
    : email;

  const RESEND_TIMER = 60;
  const [countdown, setCountdown]   = useState(RESEND_TIMER);
  const [canResend, setCanResend]   = useState(false);
  const [otpEmail, setOtpEmail]     = useState('');
  const [shouldProceed, setShouldProceed] = useState(false);
  const endTimeRef = useRef<number>(Date.now() + RESEND_TIMER * 1000);

  const cardBg   = isDark ? '#1F2937' : '#FFFFFF';
  const border   = isDark ? '#374151' : '#E5E7EB';
  const textMain = isDark ? '#F9FAFB' : '#111827';

  useEffect(() => {
    const init = async () => {
      try {
        const stored = await AsyncStorage.getItem('otpTimerEnd');
        if (stored) {
          const end = parseInt(stored, 10);
          if (end > Date.now()) endTimeRef.current = end;
          else { await AsyncStorage.removeItem('otpTimerEnd'); endTimeRef.current = Date.now() + RESEND_TIMER * 1000; }
        }
      } catch {}
    };
    init();

    const tick = async () => {
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setCountdown(remaining);
      try {
        if (remaining > 0) await AsyncStorage.setItem('otpTimerEnd', endTimeRef.current.toString());
        else { await AsyncStorage.removeItem('otpTimerEnd'); setCanResend(true); }
      } catch {}
    };

    const interval = setInterval(tick, 1000);
    tick();

    const sub = AppState.addEventListener('change', (s: AppStateStatus) => {
      if (s === 'active') { init(); tick(); }
    });

    return () => { clearInterval(interval); sub.remove(); };
  }, []);

  useDelay(() => { if (shouldProceed) onNext(); }, 2000, [shouldProceed]);

  const mutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      if (data?.status || data?.success) {
        toast.success('Verified ✓', 'Your email has been verified');
        setShouldProceed(true);
      } else {
        toast.error('Failed', data.message || 'Incorrect code. Please try again.');
      }
    },
    onError: (error: any) => {
      toast.error('Error', error?.response?.data?.message || error?.message || 'Something went wrong');
    },
  });

  const resendMutation = useMutation({
    mutationFn: sendOtp,
    onSuccess: (data) => {
      if (data.data?.emailSendStatus) toast.success('OTP Resent', 'A new code was sent to your email');
    },
    onError: (error: any) => {
      toast.error('Error', error?.response?.data?.message || error?.message || 'Something went wrong');
    },
  });

  const handleResend = () => {
    endTimeRef.current = Date.now() + RESEND_TIMER * 1000;
    setCountdown(RESEND_TIMER);
    setCanResend(false);
    if (!email || !phone) { toast.error('Missing Info', 'Email or phone not found'); return; }
    resendMutation.mutate({ email, type: 'EMAIL', reason: 'verification' });
  };

  const handleVerify = () => {
    if (!otpEmail) { toast.error('Missing OTP', 'Enter the verification code'); return; }
    mutation.mutate({ emailCode: { email, code: otpEmail } });
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 20 }}>
      {/* Info card */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
        {/* Email icon + address */}
        <View style={styles.emailBadge}>
          <View style={[styles.iconCircle, { backgroundColor: primaryColor + '15' }]}>
            <Ionicons name="mail-outline" size={28} color={primaryColor} />
          </View>
          <Text style={[styles.sentTo, { color: subText }]}>Code sent to</Text>
          <Text style={[styles.emailText, { color: textMain }]}>{maskedEmail}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: border }]} />

        {/* OTP input */}
        <View style={{ marginTop: 4 }}>
          <OtpComponent
            onOtpComplete={(v: string) => setOtpEmail(v)}
            textcolor={subText}
            text={canResend ? '' : `Resend in ${countdown}s`}
          />
        </View>

        {/* Resend */}
        <View style={styles.resendRow}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend} disabled={resendMutation.isPending}>
              <Text style={[styles.resendLink, { color: primaryColor }]}>
                {resendMutation.isPending ? 'Sending…' : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.resendHint, { color: subText }]}>
              Didn't receive it? Wait {countdown}s to resend
            </Text>
          )}
        </View>
      </View>

      {/* Verify button */}
      <View style={{ marginTop: 24 }}>
        <ButtonComponent
          color={primaryColor}
          text={mutation.isPending ? 'Verifying…' : 'Verify & Continue'}
          textcolor="#fff"
          onPress={handleVerify}
          isLoading={mutation.isPending}
          disabled={!otpEmail || mutation.isPending}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20, borderWidth: 1, padding: 24, marginTop: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  emailBadge: { alignItems: 'center', marginBottom: 20 },
  iconCircle: {
    width: 64, height: 64, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  sentTo:    { fontSize: 12, fontFamily: 'TTFirsNeue', marginBottom: 4 },
  emailText: { fontSize: 15, fontWeight: '700', fontFamily: 'TTFirsNeueMedium' },
  divider:   { height: 1, marginBottom: 20 },
  resendRow: { marginTop: 16, alignItems: 'center' },
  resendLink: { fontSize: 14, fontWeight: '700', fontFamily: 'TTFirsNeueMedium' },
  resendHint: { fontSize: 12, fontFamily: 'TTFirsNeue' },
});

export default OtpVerificationStep;
