import {
  View, Text, StyleSheet,
} from "react-native";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ButtonComponent from "component/buttoncomponent";
import { useRouter } from "expo-router";

function PasswordChangeSuccessComponent() {
  const { theme } = useTheme();
  const { primaryColor, backgroundColor, primaryTextColor, subText } = getColors(theme);
  const insets = useSafeAreaInsets();
  const isDark  = theme === "dark";
  const router  = useRouter();

  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const border  = isDark ? "#374151" : "#E5E7EB";

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={[styles.root, { backgroundColor }]}>
        {/* Top accent strip */}
        <View style={[styles.strip, { backgroundColor: primaryColor }]} />

        <View style={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }]}>

          {/* Steps — all complete */}
          <View style={styles.stepsRow}>
            {["Enter Email", "Verify OTP", "New Password"].map((s, i) => (
              <View key={i} style={styles.stepItem}>
                <View style={[styles.stepDot, { backgroundColor: primaryColor }]}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
                <Text style={[styles.stepLabel, { color: primaryColor }]}>{s}</Text>
                {i < 2 && <View style={[styles.stepLine, { backgroundColor: primaryColor }]} />}
              </View>
            ))}
          </View>

          {/* Success icon */}
          <View style={styles.centerSection}>
            {/* Outer glow ring */}
            <View style={[styles.outerRing, { borderColor: primaryColor + "20", backgroundColor: primaryColor + "08" }]}>
              <View style={[styles.iconRing, { backgroundColor: primaryColor + "18", borderColor: primaryColor + "35" }]}>
                <View style={[styles.iconInner, { backgroundColor: primaryColor }]}>
                  <Ionicons name="checkmark" size={38} color="#fff" />
                </View>
              </View>
            </View>

            <Text style={[styles.heading, { color: primaryTextColor }]}>Password Changed!</Text>
            <Text style={[styles.subheading, { color: subText }]}>
              Your password has been updated successfully.{"\n"}You can now sign in with your new password.
            </Text>
          </View>

          {/* Info card */}
          <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
            {[
              { icon: "shield-checkmark-outline", text: "Your account is secured with the new password" },
              { icon: "log-in-outline",           text: "Use your new password to sign in" },
              { icon: "notifications-outline",    text: "You'll receive a confirmation email shortly" },
            ].map(({ icon, text }) => (
              <View key={text} style={styles.tipRow}>
                <View style={[styles.tipIcon, { backgroundColor: primaryColor + "12" }]}>
                  <Ionicons name={icon as any} size={17} color={primaryColor} />
                </View>
                <Text style={[styles.tipText, { color: subText }]}>{text}</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <View style={styles.btnWrap}>
            <ButtonComponent
              color={primaryColor}
              text="Back to Login"
              textcolor="#fff"
              onPress={() => router.replace("/loginscreen")}
            />
          </View>

          {/* Security note */}
          <View style={[styles.noteBanner, { backgroundColor: primaryColor + "10", borderColor: primaryColor + "25" }]}>
            <Ionicons name="lock-closed-outline" size={13} color={primaryColor} />
            <Text style={[styles.noteText, { color: primaryColor }]}>
              For your security, all active sessions have been logged out.
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1 },
  strip:   { height: 4, width: "100%" },
  content: { flex: 1, paddingHorizontal: 24 },

  stepsRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 36 },
  stepItem: { flexDirection: "row", alignItems: "center" },
  stepDot:  { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  stepLabel: { fontSize: 11, fontFamily: "TTFirsNeue", marginHorizontal: 6 },
  stepLine:  { width: 20, height: 2, borderRadius: 1 },

  centerSection: { alignItems: "center", marginBottom: 32 },
  outerRing: {
    width: 140, height: 140, borderRadius: 70,
    borderWidth: 1.5, justifyContent: "center", alignItems: "center",
    marginBottom: 24,
  },
  iconRing: {
    width: 112, height: 112, borderRadius: 56,
    borderWidth: 1.5, justifyContent: "center", alignItems: "center",
  },
  iconInner: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18, shadowRadius: 14, elevation: 8,
  },

  heading: {
    fontSize: 24, fontWeight: "700", fontFamily: "TTFirsNeueMedium",
    marginBottom: 10, textAlign: "center",
  },
  subheading: {
    fontSize: 13, fontFamily: "TTFirsNeue",
    textAlign: "center", lineHeight: 20,
    paddingHorizontal: 16,
  },

  card: {
    borderRadius: 20, borderWidth: 1, padding: 20,
    gap: 16, marginBottom: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  tipIcon: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
  tipText: { flex: 1, fontSize: 13, fontFamily: "TTFirsNeue", lineHeight: 18 },

  btnWrap: { marginBottom: 16 },

  noteBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  noteText: { flex: 1, fontSize: 11, fontFamily: "TTFirsNeue", lineHeight: 16 },
});

export default PasswordChangeSuccessComponent;
