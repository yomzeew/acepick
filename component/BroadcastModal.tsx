import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
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
  type: "news" | "image" | "both";
}

const SEEN_KEY = "acepick_seen_broadcasts";

const BroadcastModal: React.FC = () => {
  const { isDark } = useTheme();
  const colors = getColors(isDark ? "dark" : "light");
  const [queue, setQueue] = useState<Broadcast[]>([]);
  const [current, setCurrent] = useState<Broadcast | null>(null);
  const [loading, setLoading] = useState(false);

  const loadBroadcasts = useCallback(async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBroadcasts();
  }, [loadBroadcasts]);

  const dismiss = async () => {
    if (!current) return;

    // Mark as seen
    const seenRaw = await AsyncStorage.getItem(SEEN_KEY);
    const seen: number[] = seenRaw ? JSON.parse(seenRaw) : [];
    const updated = [...new Set([...seen, current.id])];
    await AsyncStorage.setItem(SEEN_KEY, JSON.stringify(updated));

    // Advance to next in queue
    const remaining = queue.filter((b) => b.id !== current.id);
    setQueue(remaining);
    setCurrent(remaining[0] ?? null);
  };

  if (loading || !current) return null;

  const showImage = (current.type === "image" || current.type === "both") && !!current.imageUrl;
  const showText = current.type === "news" || current.type === "both";

  return (
    <Modal
      visible={!!current}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? colors.selectioncardColor : "#fff" },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              { backgroundColor: colors.primaryColor },
            ]}
          >
            <Text style={styles.headerLabel}>📢 Announcement</Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {showImage && (
              <Image
                source={{ uri: current.imageUrl! }}
                style={styles.image}
                resizeMode="cover"
              />
            )}

            {showText && (
              <>
                <Text
                  style={[
                    styles.title,
                    { color: isDark ? colors.textColor : "#111" },
                  ]}
                >
                  {current.title}
                </Text>
                {current.message ? (
                  <Text
                    style={[
                      styles.message,
                      { color: isDark ? colors.subText : "#555" },
                    ]}
                  >
                    {current.message}
                  </Text>
                ) : null}
              </>
            )}
          </ScrollView>

          {/* Queue indicator */}
          {queue.length > 1 && (
            <Text style={[styles.counter, { color: colors.subText }]}>
              {queue.indexOf(current) + 1} of {queue.length}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primaryColor }]}
            onPress={dismiss}
          >
            <Text style={styles.btnText}>
              {queue.length > 1 && queue.indexOf(current) < queue.length - 1
                ? "Next →"
                : "Got it"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: SCREEN_W * 0.88,
    maxHeight: SCREEN_H * 0.8,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  header: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  headerLabel: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  body: {
    padding: 20,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
  },
  counter: {
    textAlign: "center",
    fontSize: 12,
    marginBottom: 4,
  },
  btn: {
    margin: 16,
    marginTop: 8,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});

export default BroadcastModal;
