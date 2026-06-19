import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  StyleSheet,
  Linking,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { API_BASE_URL } from "utilizes/endpoints";
import axios from "axios";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

interface Broadcast {
  id: number;
  title: string;
  message: string | null;
  imageUrl: string | null;
  type: "news" | "image" | "both" | "link" | "update";
  link: string | null;
  appVersion: string | null;
  iosUrl: string | null;
  androidUrl: string | null;
}

const SEEN_KEY = "acepick_seen_broadcasts";

const openUrl = (url: string) => {
  Linking.canOpenURL(url).then(supported => {
    if (supported) Linking.openURL(url);
  });
};

const BroadcastModal: React.FC = () => {
  const { isDark } = useTheme();
  const colors = getColors(isDark ? "dark" : "light");
  const [queue, setQueue] = useState<Broadcast[]>([]);
  const [current, setCurrent] = useState<Broadcast | null>(null);

  const loadBroadcasts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/public/broadcasts`);
      const broadcasts: Broadcast[] = res.data?.data ?? [];
      if (!broadcasts.length) return;

      const seenRaw = await AsyncStorage.getItem(SEEN_KEY);
      const seen: number[] = seenRaw ? JSON.parse(seenRaw) : [];
      const unseen = broadcasts.filter((b) => !seen.includes(b.id));

      if (unseen.length > 0) {
        setQueue(unseen);
        setCurrent(unseen[0]);
      }
    } catch {
      // silently fail — broadcast is non-critical
    }
  }, []);

  useEffect(() => {
    loadBroadcasts();
  }, [loadBroadcasts]);

  const dismiss = async () => {
    if (!current) return;
    const seenRaw = await AsyncStorage.getItem(SEEN_KEY);
    const seen: number[] = seenRaw ? JSON.parse(seenRaw) : [];
    const updated = [...new Set([...seen, current.id])];
    await AsyncStorage.setItem(SEEN_KEY, JSON.stringify(updated));
    const remaining = queue.filter((b) => b.id !== current.id);
    setQueue(remaining);
    setCurrent(remaining[0] ?? null);
  };

  if (!current) return null;

  const showImage = (current.type === "image" || current.type === "both") && !!current.imageUrl;
  const showText = current.type !== "image";
  const isLink = current.type === "link";
  const isUpdate = current.type === "update";

  // Store URL: prefer platform-specific, fall back to the other
  const storeUrl = Platform.OS === "ios"
    ? (current.iosUrl || current.androidUrl)
    : (current.androidUrl || current.iosUrl);

  // Theme colours
  const cardBg = isDark ? colors.selectioncardColor : "#ffffff";
  const titleColor = isDark ? colors.textColor : "#111111";
  const messageColor = isDark ? colors.subText : "#555555";
  const counterColor = colors.subText;
  const dividerColor = isDark ? colors.borderColor : "#e5e7eb";
  const versionBadgeBg = isDark ? "#1f2937" : "#f0fdf4";
  const versionBadgeText = colors.successColor;
  const linkBtnBg = isDark ? "#1e3a5f" : "#eff6ff";
  const linkBtnText = isDark ? "#60a5fa" : "#1d4ed8";

  const isNextable = queue.length > 1 && queue.indexOf(current) < queue.length - 1;

  return (
    <Modal
      visible={!!current}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: cardBg }]}>

          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.primaryColor }]}>
            <Text style={styles.headerLabel}>
              {isUpdate ? "🚀 App Update Available" : "📢 Announcement"}
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

            {/* App update version badge */}
            {isUpdate && current.appVersion && (
              <View style={[styles.versionBadge, { backgroundColor: versionBadgeBg }]}>
                <Text style={[styles.versionText, { color: versionBadgeText }]}>
                  Version {current.appVersion} is now available
                </Text>
              </View>
            )}

            {showImage && (
              <Image
                source={{ uri: current.imageUrl! }}
                style={[styles.image, { borderColor: dividerColor }]}
                resizeMode="cover"
              />
            )}

            {showText && (
              <>
                <Text style={[styles.title, { color: titleColor }]}>
                  {current.title}
                </Text>
                {current.message ? (
                  <Text style={[styles.message, { color: messageColor }]}>
                    {current.message}
                  </Text>
                ) : null}
              </>
            )}

            {/* Link button */}
            {isLink && current.link && (
              <TouchableOpacity
                style={[styles.linkBtn, { backgroundColor: linkBtnBg, borderColor: linkBtnText + "40" }]}
                activeOpacity={0.7}
                onPress={() => openUrl(current.link!)}
              >
                <Text style={[styles.linkBtnText, { color: linkBtnText }]}>
                  🔗  Open Link
                </Text>
              </TouchableOpacity>
            )}

            {/* App update store buttons */}
            {isUpdate && storeUrl && (
              <TouchableOpacity
                style={[styles.updateBtn, { backgroundColor: colors.primaryColor }]}
                activeOpacity={0.8}
                onPress={() => openUrl(storeUrl)}
              >
                <Text style={styles.updateBtnText}>
                  {Platform.OS === "ios" ? "📱 Update on App Store" : "📱 Update on Play Store"}
                </Text>
              </TouchableOpacity>
            )}

          </ScrollView>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Queue indicator */}
          {queue.length > 1 && (
            <Text style={[styles.counter, { color: counterColor }]}>
              {queue.indexOf(current) + 1} of {queue.length}
            </Text>
          )}

          {/* Dismiss / Next */}
          <View style={styles.footer}>
            {isUpdate && storeUrl ? (
              // For update: "Later" (dismiss) + "Update Now"
              <>
                <TouchableOpacity
                  style={[styles.footerBtn, styles.footerBtnOutline, { borderColor: dividerColor }]}
                  activeOpacity={0.7}
                  onPress={dismiss}
                >
                  <Text style={[styles.footerBtnOutlineText, { color: messageColor }]}>Later</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.footerBtn, { backgroundColor: colors.primaryColor }]}
                  activeOpacity={0.8}
                  onPress={() => { openUrl(storeUrl); dismiss(); }}
                >
                  <Text style={styles.footerBtnText}>Update Now</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.singleBtn, { backgroundColor: colors.primaryColor }]}
                activeOpacity={0.8}
                onPress={dismiss}
              >
                <Text style={styles.footerBtnText}>
                  {isNextable ? "Next →" : "Got it"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: SCREEN_W * 0.88,
    maxHeight: SCREEN_H * 0.82,
    borderRadius: 18,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  header: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  headerLabel: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  body: {
    padding: 20,
    paddingBottom: 8,
  },
  versionBadge: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    alignItems: "center",
  },
  versionText: {
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    lineHeight: 24,
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
  },
  linkBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  linkBtnText: {
    fontWeight: "600",
    fontSize: 14,
  },
  updateBtn: {
    marginTop: 16,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },
  updateBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    marginTop: 8,
  },
  counter: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 10,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    margin: 16,
    marginTop: 10,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },
  footerBtnOutline: {
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  footerBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
  footerBtnOutlineText: {
    fontWeight: "600",
    fontSize: 15,
  },
  singleBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },
});

export default BroadcastModal;
