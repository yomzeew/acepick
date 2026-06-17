import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import FallbackImage from "component/FallbackImage";
import HeaderComponent from "../../headerComp";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { useState, useEffect } from "react";
import SliderModalTemplate from "component/slideupModalTemplate";
import VerificationComponent from "./verificationcomp";
import SliderModal from "component/SlideUpModal";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "redux/store";
import { updateUserFromDashboard } from "redux/slices/authSlice";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { uploadAvatarToLocal } from "services/localUploadService";
import EditModal from "./editprofileModal";
import { AlertMessageBanner } from "component/AlertMessageBanner";
import { API_BASE_URL, PROFILE } from "utilizes/endpoints";
import { store } from "redux/store";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const Profileinfo = () => {
  const { theme } = useTheme();
  const { primaryColor, backgroundColortwo } = getColors(theme);
  const dispatch = useDispatch();
  const router = useRouter();

  const isDark = theme === "dark";
  const bgColor = isDark ? "#111827" : "#F3F4F6";
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const dividerColor = isDark ? "#374151" : "#E5E7EB";

  const [showmodal, setshowmodal] = useState(false);
  const [showmodaltwo, setshowmodaltwo] = useState(false);
  const [showmodalVerify, setshowmodalVerify] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const user = useSelector((state: RootState) => state.auth.user);
  const avatar = user?.profile?.avatar || "";
  const firstName = user?.profile?.firstName || "";
  const lastName = user?.profile?.lastName || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "User";

  const [avatarUri, setAvatarUri] = useState<string>(avatar);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    firstName: user?.profile?.firstName || "",
    lastName: user?.profile?.lastName || "",
    gender: user?.profile?.gender || "",
    dob: user?.profile?.birthDate || "",
    address: user?.location?.address || "",
    city: user?.location?.city || user?.location?.lga || "",
    state: user?.location?.state || "",
    country: user?.location?.country || "",
  });

  // Email and phone are read-only (not editable from this screen)
  const userEmail = user?.email || "Not set";
  const userPhone = user?.phone || "Not set";

  const pickAvatar = async () => {
    try {
      setAvatarError(null);
      setSuccessMessage(null);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const localUri = result.assets[0].uri;
        const response = await fetch(localUri);
        const blob = await response.blob();
        const sizeInMB = blob.size / (1024 * 1024);

        if (sizeInMB > 5) {
          setAvatarError("Image size must be less than 5MB");
          return;
        }

        // Show local preview immediately
        setAvatarUri(localUri);
        setIsUploadingAvatar(true);

        try {
          // 1. Upload to local backend
          const uploadedUrl = await uploadAvatarToLocal(localUri);
          setAvatarUri(uploadedUrl);

          // 2. Save to backend immediately
          const token = store.getState().auth?.token;
          await axios.post(
            `${API_BASE_URL}${PROFILE.UPDATE}`,
            { bio: { avatar: uploadedUrl } },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // 3. Update Redux store
          dispatch(updateUserFromDashboard({ profile: { avatar: uploadedUrl } }));
          setIsUploadingAvatar(false);
          setSuccessMessage("Profile picture updated!");
        } catch (uploadError: any) {
          setIsUploadingAvatar(false);
          setAvatarUri(avatar); // revert to old avatar on failure
          setAvatarError(uploadError?.message || "Failed to upload profile picture");
          console.error("Avatar upload error:", uploadError);
        }
      }
    } catch (error) {
      setAvatarError("Failed to select image. Please try again.");
      console.error("Image picker error:", error);
    }
  };

  // ── Backend update: POST /profile with { bio, contact, location } ──
  const updateProfileMutation = useMutation({
    mutationFn: async (payload: { bio?: any; contact?: any; location?: any }) => {
      const token = store.getState().auth?.token;
      const res = await axios.post(`${API_BASE_URL}${PROFILE.UPDATE}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: (response: any) => {
      console.log('Profile update response:', response);
      
      // Check if the API actually returned success
      if (response.success === false || response.status === false) {
        const errorMsg = response.message || response.error || 'Failed to update profile';
        setErrorMessage(errorMsg);
        return;
      }
      
      // Update Redux store with new profile + location data
      dispatch(
        updateUserFromDashboard({
          profile: {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            gender: profileData.gender,
            birthDate: profileData.dob,
            avatar: avatarUri,
          },
          location: {
            address: profileData.address,
            city: profileData.city,
            state: profileData.state,
            country: profileData.country,
          },
        })
      );
      setSuccessMessage("Profile updated successfully!");
      setshowmodaltwo(false);
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);
      let msg = "Failed to update profile";
      if (error?.response?.data?.message) msg = error.response.data.message;
      else if (error?.response?.data?.errors) {
        const errs = error.response.data.errors;
        msg = Object.values(errs).flat().join(", ");
      } else if (error?.message) msg = error.message;
      setErrorMessage(msg);
    },
  });

  const handleSubmit = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate required fields
    if (!profileData.firstName || !profileData.lastName) {
      setErrorMessage("First name and last name are required.");
      return;
    }

    try {
      // Build payload matching backend schema: { bio, location }
      // Note: avatar is saved automatically on pick, email/phone are NOT editable
      const payload: any = {};

      // Bio section
      const bio: any = {};
      if (profileData.firstName) bio.firstName = profileData.firstName;
      if (profileData.lastName) bio.lastName = profileData.lastName;
      if (profileData.gender) bio.gender = profileData.gender;
      // Only send birthDate if it's a valid non-empty value (z.coerce.date fails on empty string)
      if (profileData.dob && profileData.dob.trim() !== "") bio.birthDate = profileData.dob;
      if (Object.keys(bio).length > 0) payload.bio = bio;

      // Location section
      const location: any = {};
      if (profileData.address) location.address = profileData.address;
      if (profileData.city) location.city = profileData.city;
      if (profileData.state) location.state = profileData.state;
      if (profileData.country) location.country = profileData.country;
      if (Object.keys(location).length > 0) payload.location = location;

      console.log("Profile update payload:", JSON.stringify(payload));
      await updateProfileMutation.mutateAsync(payload);
    } catch (error: any) {
      console.error("Profile update failed:", error);
    }
  };

  const loading = updateProfileMutation.isPending || isUploadingAvatar;

  // ── Biodata display fields ──
  const biodataFields = [
    { label: "First Name", value: profileData.firstName, icon: "person-outline" },
    { label: "Last Name", value: profileData.lastName, icon: "person-outline" },
    { label: "Gender", value: profileData.gender ? profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1) : "Not set", icon: "male-female-outline" },
    { label: "Date of Birth", value: profileData.dob || "Not set", icon: "calendar-outline" },
  ];

  const contactFields = [
    { label: "Phone", value: userPhone, icon: "call-outline" },
    { label: "Email", value: userEmail, icon: "mail-outline" },
  ];

  const locationFields = [
    { label: "Address", value: profileData.address || "Not set", icon: "location-outline" },
    { label: "City", value: profileData.city || "Not set", icon: "business-outline" },
    { label: "State", value: profileData.state || "Not set", icon: "map-outline" },
    { label: "Country", value: profileData.country || "Not set", icon: "globe-outline" },
  ];

  return (
    <>
      {successMessage && <AlertMessageBanner type="success" message={successMessage} />}
      {errorMessage && <AlertMessageBanner type="error" message={errorMessage} />}
      {avatarError && <AlertMessageBanner type="error" message={avatarError} />}

      <SliderModalTemplate showmodal={showmodal} setshowmodal={setshowmodal} modalHeight={"85%"}>
        <VerificationComponent
          setshowmodalVerify={(text: boolean) => setshowmodalVerify(text)}
          setshowmodal={(text: boolean) => setshowmodal(text)}
        />
      </SliderModalTemplate>

      <SliderModalTemplate showmodal={showmodaltwo} setshowmodal={setshowmodaltwo} modalHeight={"85%"}>
        <EditModal
          profileData={profileData}
          setProfileData={setProfileData}
          onSave={handleSubmit}
          loading={loading}
        />
      </SliderModalTemplate>

      {showmodalVerify && (
        <SliderModal
          route="/profilelayout"
          title="Successfull"
          setshowmodal={setshowmodalVerify}
          showmodal={showmodalVerify}
          textbutton="Back to Profile"
          subtitle="We will update your profile after proper verification"
        />
      )}

      <View style={{ flex: 1, backgroundColor: bgColor }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* ── Header ── */}
          <View style={{
            backgroundColor: primaryColor,
            paddingTop: 52, paddingBottom: 50,
            borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
          }}>
            <View style={{ alignItems: "center", paddingHorizontal: 20 }}>
              {/* Back / Title row */}
              <View style={{ flexDirection: "row", alignItems: "center", width: "100%", marginBottom: 20 }}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
                  <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700", flex: 1, textAlign: "center", marginRight: 30 }}>
                  Edit Personal Information
                </Text>
              </View>

              {/* Avatar */}
              <View style={{ position: "relative" }}>
                <View style={{
                  width: 96, height: 96, borderRadius: 48,
                  borderWidth: 3, borderColor: "rgba(255,255,255,0.3)",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  overflow: "hidden",
                }}>
                  {isUploadingAvatar ? (
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                      <ActivityIndicator size="large" color="#fff" />
                      <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, marginTop: 4 }}>Uploading...</Text>
                    </View>
                  ) : avatarUri ? (
                    <FallbackImage source={{ uri: avatarUri }} style={{ width: 96, height: 96 }} resizeMode="cover" />
                  ) : (
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="person" size={40} color="rgba(255,255,255,0.7)" />
                    </View>
                  )}
                </View>
                {/* Edit button */}
                <TouchableOpacity
                  onPress={pickAvatar}
                  disabled={loading}
                  style={{
                    position: "absolute", bottom: 0, right: -4,
                    width: 32, height: 32, borderRadius: 16,
                    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
                    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  <Ionicons name="camera-outline" size={16} color={primaryColor} />
                </TouchableOpacity>
                {/* Changed indicator */}
                {avatarUri !== avatar && !isUploadingAvatar && avatarUri && (
                  <View style={{
                    position: "absolute", top: -4, right: -4,
                    width: 22, height: 22, borderRadius: 11,
                    backgroundColor: primaryColor, alignItems: "center", justifyContent: "center",
                    borderWidth: 2, borderColor: primaryColor,
                  }}>
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  </View>
                )}
              </View>

              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 10 }}>{fullName}</Text>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2 }}>{userEmail}</Text>
            </View>
          </View>

          {/* ── Personal Info Card ── */}
          <View style={{ marginHorizontal: 16, marginTop: -24 }}>
            <SectionCard
              title="Personal Information"
              icon="person-circle-outline"
              iconColor={primaryColor}
              fields={biodataFields}
              cardBg={cardBg}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              dividerColor={dividerColor}
              isDark={isDark}
              onEdit={() => setshowmodaltwo(true)}
            />
          </View>

          {/* ── Contact Card ── */}
          <View style={{ marginHorizontal: 16, marginTop: 12 }}>
            <SectionCard
              title="Contact Information"
              icon="call-outline"
              iconColor={primaryColor}
              fields={contactFields}
              cardBg={cardBg}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              dividerColor={dividerColor}
              isDark={isDark}
            />
          </View>

          {/* ── Location Card ── */}
          <View style={{ marginHorizontal: 16, marginTop: 12 }}>
            <SectionCard
              title="Location"
              icon="location-outline"
              iconColor={backgroundColortwo}
              fields={locationFields}
              cardBg={cardBg}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              dividerColor={dividerColor}
              isDark={isDark}
              onEdit={() => setshowmodaltwo(true)}
            />
          </View>

          {/* ── Verification Button ── */}
          <View style={{ marginHorizontal: 16, marginTop: 20 }}>
            <TouchableOpacity
              onPress={() => setshowmodal(true)}
              style={{
                backgroundColor: primaryColor, borderRadius: 14,
                paddingVertical: 14, alignItems: "center",
                flexDirection: "row", justifyContent: "center", gap: 8,
              }}
            >
              <Ionicons name="shield-checkmark-outline" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>Proceed to Verification</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

// ── Reusable Section Card ──
const SectionCard = ({
  title, icon, iconColor, fields, cardBg, textPrimary, textSecondary, dividerColor, isDark, onEdit,
}: {
  title: string;
  icon: string;
  iconColor: string;
  fields: { label: string; value: string; icon: string }[];
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  dividerColor: string;
  isDark: boolean;
  onEdit?: () => void;
}) => (
  <View style={{
    backgroundColor: cardBg, borderRadius: 16, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.25 : 0.06, shadowRadius: 8, elevation: 3,
  }}>
    {/* Section Header */}
    <View style={{
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 16, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: dividerColor,
    }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{
          width: 32, height: 32, borderRadius: 8,
          backgroundColor: iconColor + "15", alignItems: "center", justifyContent: "center",
        }}>
          <Ionicons name={icon as any} size={16} color={iconColor} />
        </View>
        <Text style={{ color: textPrimary, fontSize: 15, fontWeight: "700" }}>{title}</Text>
      </View>
      {onEdit && (
        <TouchableOpacity onPress={onEdit} style={{ padding: 4 }}>
          <Ionicons name="pencil-outline" size={18} color={iconColor} />
        </TouchableOpacity>
      )}
    </View>

    {/* Fields */}
    {fields.map((field, index) => (
      <View
        key={field.label}
        style={{
          flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12,
          borderBottomWidth: index < fields.length - 1 ? 1 : 0, borderBottomColor: dividerColor,
        }}
      >
        <Ionicons name={field.icon as any} size={16} color={textSecondary} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: textSecondary, fontSize: 11 }}>{field.label}</Text>
          <Text style={{ color: textPrimary, fontSize: 14, fontWeight: "500", marginTop: 1 }} numberOfLines={1}>
            {field.value}
          </Text>
        </View>
      </View>
    ))}
  </View>
);

export default Profileinfo;
