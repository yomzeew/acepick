import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { AntDesign, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { InputComponentTextarea } from "component/controls/textinput";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import EmptyView from "component/emptyview";
import HeaderComponent from "component/headerComp";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { Textstyles } from "static/textFontsize";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { giveRatingFn, giveReviewFn, generalUserDetailFn } from "services/userService";
import { AlertMessageBanner } from "component/AlertMessageBanner";
import { SliderModalNoScrollview } from "component/slideupModalTemplate";
import { getInitials } from "utilizes/initialsName";

const MAX_WORDS = 120;

const LeaveReview = () => {
  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor, selectioncardColor, backgroundColortwo } = getColors(theme);
  const { jobId, professionalId } = useLocalSearchParams<{ jobId: string; professionalId?: string }>();
  const router = useRouter();

  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch professional details
  const [professional, setProfessional] = useState<any>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (professionalId) {
      generalUserDetailFn(professionalId)
        .then((data) => setProfessional(data?.data))
        .catch(() => {});
    }
  }, [professionalId]);

  useEffect(() => {
    if (errorMessage) {
      const t = setTimeout(() => setErrorMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [errorMessage]);

  const wordCount = reviewText.trim() ? reviewText.trim().split(/\s+/).length : 0;

  const ratingMutation = useMutation({
    mutationFn: giveRatingFn,
    onSuccess: () => {
      // After rating, submit review
      if (reviewText.trim()) {
        reviewMutation.mutate({ review: reviewText.trim(), jobId: Number(jobId) });
      } else {
        setShowSuccess(true);
      }
    },
    onError: (e: any) => {
      const msg =
        e?.response?.data?.message ?? e?.response?.data?.error ?? e?.message ?? "Failed to submit rating";
      setErrorMessage(msg);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: giveReviewFn,
    onSuccess: () => {
      setShowSuccess(true);
    },
    onError: (e: any) => {
      const msg =
        e?.response?.data?.message ?? e?.response?.data?.error ?? e?.message ?? "Failed to submit review";
      setErrorMessage(msg);
    },
  });

  const isSubmitting = ratingMutation.isPending || reviewMutation.isPending;

  const handleSubmit = () => {
    if (rating === 0) {
      setErrorMessage("Please select a star rating");
      return;
    }
    ratingMutation.mutate({ rating, jobId: Number(jobId) });
  };

  const profName = professional?.profile
    ? `${professional.profile.firstName ?? ""} ${professional.profile.lastName ?? ""}`.trim()
    : "Professional";
  const avatar = professional?.profile?.avatar;
  const initials = getInitials(professional?.profile);

  const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <>
      {errorMessage && <AlertMessageBanner type="error" message={errorMessage} />}

      <ContainerTemplate>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <HeaderComponent title="Leave Review" />
          <EmptyView height={20} />

          {/* ─── Professional Card ─────────────────────── */}
          {professionalId && (
            <View
              style={{ backgroundColor: selectioncardColor }}
              className="rounded-2xl px-4 py-4 mb-5 items-center"
            >
              {avatar && !imageError ? (
                <Image
                  source={{ uri: avatar }}
                  className="w-20 h-20 rounded-full mb-3"
                  onError={() => setImageError(true)}
                />
              ) : (
                <View
                  style={{ backgroundColor: primaryColor + "20" }}
                  className="w-20 h-20 rounded-full items-center justify-center mb-3"
                >
                  <Text style={{ color: primaryColor, fontSize: 24, fontFamily: "TTFirsNeueMedium" }}>
                    {initials}
                  </Text>
                </View>
              )}
              <ThemeText size={Textstyles.text_small}>{profName}</ThemeText>
              <EmptyView height={4} />
              <ThemeTextsecond size={Textstyles.text_xsmall}>
                How was your experience?
              </ThemeTextsecond>
            </View>
          )}

          {/* ─── Star Rating ──────────────────────────── */}
          <View
            style={{ backgroundColor: selectioncardColor }}
            className="rounded-2xl px-4 py-5 mb-4 items-center"
          >
            <View className="flex-row items-center mb-3">
              <View
                style={{ backgroundColor: backgroundColortwo + '20' }}
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
              >
                <AntDesign name="star" size={16} color={backgroundColortwo} />
              </View>
              <ThemeText size={Textstyles.text_small}>Rating</ThemeText>
            </View>

            <View className="flex-row gap-x-4 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  activeOpacity={0.7}
                >
                  <AntDesign
                    name={star <= (hoverRating || rating) ? "star" : "staro"}
                    size={40}
                    color={star <= (hoverRating || rating) ? backgroundColortwo : secondaryTextColor + "40"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {rating > 0 && (
              <View
                style={{ backgroundColor: backgroundColortwo + '15', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 }}
              >
                <Text style={{ color: backgroundColortwo, fontSize: 14, fontFamily: "TTFirsNeueMedium" }}>
                  {ratingLabels[rating]}
                </Text>
              </View>
            )}
          </View>

          {/* ─── Review Text ──────────────────────────── */}
          <View
            style={{ backgroundColor: selectioncardColor }}
            className="rounded-2xl px-4 py-4 mb-4"
          >
            <View className="flex-row items-center mb-3">
              <View
                style={{ backgroundColor: primaryColor + "20" }}
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
              >
                <Ionicons name="chatbox-ellipses-outline" size={16} color={primaryColor} />
              </View>
              <ThemeText size={Textstyles.text_small}>Your Review</ThemeText>
            </View>

            <InputComponentTextarea
              color={primaryColor}
              placeholder="Share your experience... (optional)"
              placeholdercolor={secondaryTextColor}
              value={reviewText}
              onChange={(text: string) => {
                const words = text.trim().split(/\s+/);
                if (words.length <= MAX_WORDS || text.length < reviewText.length) {
                  setReviewText(text);
                }
              }}
            />

            <View className="flex-row justify-end mt-2">
              <Text
                style={{
                  color: wordCount >= MAX_WORDS ? backgroundColortwo : secondaryTextColor,
                  fontSize: 12,
                  fontFamily: "TTFirsNeueMedium",
                }}
              >
                {wordCount}/{MAX_WORDS} words
              </Text>
            </View>
          </View>

          {/* ─── Submit Button ─────────────────────────── */}
          <View className="my-4">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting || rating === 0}
              style={{
                backgroundColor: rating > 0 ? primaryColor : secondaryTextColor + "30",
                opacity: isSubmitting ? 0.7 : 1,
              }}
              className="h-14 rounded-2xl items-center justify-center flex-row"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons
                    name="send"
                    size={18}
                    color={rating > 0 ? "#fff" : secondaryTextColor}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      color: rating > 0 ? "#fff" : secondaryTextColor,
                      fontSize: 16,
                      fontFamily: "TTFirsNeueMedium",
                    }}
                  >
                    Submit Review
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          <EmptyView height={30} />
        </ScrollView>
      </ContainerTemplate>

      {/* ─── Success Modal ─────────────────────────── */}
      {showSuccess && (
        <SliderModalNoScrollview
          modalHeight="55%"
          showmodal={showSuccess}
          setshowmodal={setShowSuccess}
        >
          <View className="items-center justify-center flex-1 px-6">
            <View
              style={{ backgroundColor: primaryColor + '15' }}
              className="w-20 h-20 rounded-full items-center justify-center mb-5"
            >
              <FontAwesome6 name="circle-check" size={44} color={primaryColor} />
            </View>
            <ThemeText size={Textstyles.text_medium}>Thank You!</ThemeText>
            <EmptyView height={8} />
            <ThemeTextsecond size={Textstyles.text_xsmall}>
              Your review has been submitted successfully.
            </ThemeTextsecond>
            <EmptyView height={30} />
            <TouchableOpacity
              onPress={() => {
                setShowSuccess(false);
                router.back();
              }}
              style={{ backgroundColor: primaryColor }}
              className="h-12 w-full rounded-2xl items-center justify-center"
            >
              <Text style={{ color: "#fff", fontSize: 15, fontFamily: "TTFirsNeueMedium" }}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </SliderModalNoScrollview>
      )}
    </>
  );
};

export default LeaveReview;