import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, StyleSheet } from "react-native";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import InputComponent from "component/controls/textinput";
import ButtonComponent from "component/buttoncomponent";
import SelectComponent from "component/dashboardComponent/selectComponent";
import { getAllStates, getLgasByState } from "utilizes/fetchlistofstateandlga";
import { useToast } from "context/ToastContext";
import * as ImagePicker from 'expo-image-picker';
import { uploadAvatarToLocal } from "services/localUploadService";
import { useDispatch } from "react-redux";
import { setRegistrationData } from "redux/slices/authSlice";

interface PersonalInfoStepProps {
  onNext: () => void;
  roleLabel: string;
}

const PersonalInfoStep = ({ onNext, roleLabel }: PersonalInfoStepProps) => {
  const { theme } = useTheme();
  const { primaryColor, subText, backgroundColortwo } = getColors(theme);
  const isDark = theme === 'dark';
  const toast  = useToast();
  const dispatch = useDispatch();

  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [state,     setState]     = useState('');
  const [lga,       setLga]       = useState('');
  const [address,   setAddress]   = useState('');
  const [lgaList,   setLgaList]   = useState<string[]>([]);
  const [photoUrl,  setPhotoUrl]  = useState('');
  const [uploading, setUploading] = useState(false);

  const cardBg   = isDark ? '#1F2937' : '#FFFFFF';
  const border   = isDark ? '#374151' : '#E5E7EB';
  const textMain = isDark ? '#F9FAFB' : '#111827';

  useEffect(() => {
    if (state) setLgaList(getLgasByState(state));
  }, [state]);

  const handleStateChange = (v: string) => {
    setState(v);
    setLga('');
  };

  const onUpload = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      toast.error('Permission Required', 'Please allow access to your media library');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.length) return;
    setUploading(true);
    try {
      const url = await uploadAvatarToLocal(result.assets[0].uri);
      setPhotoUrl(url);
      toast.success('Photo Uploaded', 'Profile photo set successfully');
    } catch (e: any) {
      toast.error('Upload Failed', e?.message || 'Could not upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    if (!firstName || !lastName || !state || !lga || !address || !photoUrl) {
      toast.error('Missing Fields', 'Please complete all fields and add a profile photo');
      return;
    }
    dispatch(setRegistrationData({ firstName, lastName, state, lga, address, avatar: photoUrl }));
    onNext();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar picker */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={onUpload} disabled={uploading} style={[styles.avatarRing, { borderColor: primaryColor }]}>
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: primaryColor + '15' }]}>
                {uploading
                  ? <Ionicons name="cloud-upload-outline" size={28} color={primaryColor} />
                  : <Ionicons name="camera-outline" size={28} color={primaryColor} />}
              </View>
            )}
            {/* Edit badge */}
            <View style={[styles.editBadge, { backgroundColor: primaryColor }]}>
              <Ionicons name="pencil" size={10} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.avatarHint, { color: subText }]}>
            {uploading ? 'Uploading…' : photoUrl ? 'Tap to change photo' : 'Add profile photo'}
          </Text>
          {!photoUrl && (
            <View style={[styles.requiredBadge, { backgroundColor: backgroundColortwo + '15' }]}>
              <Ionicons name="alert-circle-outline" size={12} color={backgroundColortwo} />
              <Text style={[styles.requiredText, { color: backgroundColortwo }]}>Required</Text>
            </View>
          )}
        </View>

        {/* Name card */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={16} color={primaryColor} />
            <Text style={[styles.sectionTitle, { color: textMain }]}>Full Name</Text>
          </View>
          <View style={styles.fieldGroup}>
            <InputComponent color={primaryColor} placeholder="First Name" placeholdercolor={subText} value={firstName} onChange={setFirstName} editable />
            <View style={[styles.divider, { backgroundColor: border }]} />
            <InputComponent color={primaryColor} placeholder="Last Name" placeholdercolor={subText} value={lastName} onChange={setLastName} editable />
          </View>
        </View>

        {/* Location card */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={16} color={primaryColor} />
            <Text style={[styles.sectionTitle, { color: textMain }]}>Location</Text>
          </View>
          <View style={styles.fieldGroup}>
            <SelectComponent title="Select State" width="100%" data={getAllStates()} setValue={handleStateChange} value={state} />
            <View style={[styles.divider, { backgroundColor: border }]} />
            <SelectComponent title={state ? "Select LGA" : "Select state first"} width="100%" data={lgaList} setValue={setLga} value={lga} />
            <View style={[styles.divider, { backgroundColor: border }]} />
            <View style={{ gap: 6 }}>
              <Text style={[styles.fieldLabel, { color: subText }]}>Residential Address</Text>
              <InputComponent color={primaryColor} placeholder="Enter your full address" placeholdercolor={subText} value={address} onChange={setAddress} editable />
            </View>
          </View>
        </View>

        {/* Validation note */}
        <View style={[styles.noteBanner, { backgroundColor: primaryColor + '10', borderColor: primaryColor + '25' }]}>
          <Ionicons name="information-circle-outline" size={15} color={primaryColor} />
          <Text style={[styles.noteText, { color: primaryColor }]}>
            Please ensure all details are accurate — they'll be used for identity verification.
          </Text>
        </View>

        <View style={{ marginTop: 20 }}>
          <ButtonComponent color={primaryColor} text="Continue" textcolor="#fff" onPress={handleNext} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  avatarSection: { alignItems: 'center', paddingVertical: 20 },
  avatarRing: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 2.5, overflow: 'visible',
    position: 'relative',
  },
  avatarImg: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
  },
  editBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 22, height: 22, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  avatarHint: { fontSize: 12, fontFamily: 'TTFirsNeue', marginTop: 8 },
  requiredBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, marginTop: 6,
  },
  requiredText: { fontSize: 11, fontFamily: 'TTFirsNeue' },

  card: {
    borderRadius: 20, borderWidth: 1,
    padding: 18, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle:  { fontSize: 14, fontWeight: '700', fontFamily: 'TTFirsNeueMedium' },
  fieldGroup: { gap: 2 },
  divider:    { height: 1, marginVertical: 10 },
  fieldLabel: { fontSize: 12, fontFamily: 'TTFirsNeue', marginBottom: 4 },

  noteBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  noteText: { flex: 1, fontSize: 12, fontFamily: 'TTFirsNeue', lineHeight: 17 },
});

export default PersonalInfoStep;
