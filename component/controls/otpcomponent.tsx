import {
  View,
  Text,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
} from "react-native";
import React, { useRef, useState, useEffect, useCallback } from "react";

const OTP_LENGTH = 4;

const OtpComponent = ({
  textcolor,
  text,
  onOtpComplete,
}: {
  textcolor: string;
  text: string;
  onOtpComplete: (otp: string) => void;
}) => {
  const inputs = useRef<Array<TextInput | null>>([]);
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const scaleAnims = useRef(
    Array.from({ length: OTP_LENGTH }, () => new Animated.Value(1))
  );
  const shakeAnims = useRef(
    Array.from({ length: OTP_LENGTH }, () => new Animated.Value(0))
  );

  // Auto-focus first input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputs.current[0]?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const triggerFillAnim = (index: number) => {
    Animated.sequence([
      Animated.timing(scaleAnims.current[index], {
        toValue: 1.15,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims.current[index], {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const triggerShakeAnim = (index: number) => {
    Animated.sequence([
      Animated.timing(shakeAnims.current[index], { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnims.current[index], { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnims.current[index], { toValue: 4, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnims.current[index], { toValue: -4, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnims.current[index], { toValue: 0, duration: 30, useNativeDriver: true }),
    ]).start();
  };

  const commitOtp = useCallback(
    (newOtp: string[]) => {
      if (!newOtp.includes("")) {
        onOtpComplete(newOtp.join(""));
      } else {
        onOtpComplete("");
      }
    },
    [onOtpComplete]
  );

  const handleChange = (value: string, index: number) => {
    const cleaned = value.replace(/\D/g, "");

    if (!cleaned) return;

    // ✅ Paste: distribute digits across boxes from current index
    if (cleaned.length > 1) {
      const newOtp = [...otp];
      let lastFilled = index;
      for (let i = 0; i < cleaned.length && index + i < OTP_LENGTH; i++) {
        newOtp[index + i] = cleaned[i];
        lastFilled = index + i;
      }
      setOtp(newOtp);
      if (lastFilled === OTP_LENGTH - 1) {
        inputs.current[OTP_LENGTH - 1]?.focus();
        Keyboard.dismiss();
      } else {
        inputs.current[lastFilled + 1]?.focus();
      }
      commitOtp(newOtp);
      return;
    }

    // Single digit
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);
    triggerFillAnim(index);

    if (index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    } else {
      Keyboard.dismiss();
    }

    commitOtp(newOtp);
  };

  // ✅ Backspace works reliably because maxLength={1}
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
        commitOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputs.current[index - 1]?.focus();
        commitOtp(newOtp);
      }
    }
  };

  const isFocused = (index: number) => focusedIndex === index;
  const isFilled = (index: number) => otp[index] !== "";

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.row}>
          {Array(OTP_LENGTH)
            .fill("")
            .map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.boxWrapper,
                  {
                    transform: [
                      { scale: scaleAnims.current[index] },
                      { translateX: shakeAnims.current[index] },
                    ],
                  },
                ]}
              >
                <TextInput
                  ref={(ref) => {
                    inputs.current[index] = ref;
                  }}
                  style={[
                    styles.input,
                    { color: textcolor },
                    isFocused(index) && styles.inputFocused,
                    isFilled(index) && !isFocused(index) && styles.inputFilled,
                  ]}
                  keyboardType="numeric"
                  maxLength={1}              // ✅ Must be 1 — backspace fires reliably only when maxLength=1
                  value={otp[index]}
                  onChangeText={(value) => handleChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(null)}
                  returnKeyType={index === OTP_LENGTH - 1 ? "done" : "next"}
                  blurOnSubmit={index === OTP_LENGTH - 1}
                  caretHidden={true}
                  selectTextOnFocus={true}
                  contextMenuHidden={true}
                  textContentType="oneTimeCode"
                  autoComplete="one-time-code"
                />
              </Animated.View>
            ))}
        </View>

        {text ? (
          <Text style={[styles.helperText, { color: textcolor }]}>{text}</Text>
        ) : null}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  boxWrapper: {},
  input: {
    width: 52,
    height: 56,
    borderWidth: 1.5,
    borderColor: "#64748B",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "600",
    backgroundColor: "transparent",
  },
  inputFocused: {
    borderColor: "#38BDF8",
    borderWidth: 2,
    backgroundColor: "rgba(56,189,248,0.06)",
  },
  inputFilled: {
    borderColor: "#94A3B8",
  },
  helperText: {
    fontSize: 13,
    marginTop: 10,
    opacity: 0.75,
  },
});

export default OtpComponent;
