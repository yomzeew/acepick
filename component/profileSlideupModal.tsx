import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  Animated,
  Pressable,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'hooks/useTheme';
import { getColors } from 'static/color';
import { Textstyles } from 'static/textFontsize';
import RatingStar from 'component/rating';
import { ThemeText } from 'component/ThemeText';
import { useRouter } from 'expo-router';
import { JobProps } from 'types/type';
import { LinearGradient } from 'expo-linear-gradient';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.88;

interface ProfileSlideupModalProps {
  isVisible: boolean;
  onClose: () => void;
  profileData: {
    type: 'professional' | 'client';
    data: JobProps['professional'] | JobProps['client'];
  } | null;
}

const ProfileSlideupModal: React.FC<ProfileSlideupModalProps> = ({
  isVisible,
  onClose,
  profileData,
}) => {
  const { theme } = useTheme();
  const {
    primaryColor,
    backgroundColor,
    backgroundColortwo,
    secondaryTextColor,
    selectioncardColor,
    textColor,
  } = getColors(theme);
  const router = useRouter();

  // Animation refs
  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 200,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: MODAL_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  if (!profileData || !isVisible) return null;

  const { type, data } = profileData;
  const isProfessional = type === 'professional';
  const profile = data?.profile;
  const name = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim();
  const avatar = profile?.avatar || '';
  const email = isProfessional ? null : (data as any)?.email;
  const phone = isProfessional ? null : (data as any)?.phone;

  // Professional data
  const avgRating = isProfessional ? (profile as any)?.professional?.avgRating || 0 : 0;
  const numRating = isProfessional ? (profile as any)?.professional?.numRating || 0 : 0;
  const yearsOfExp = isProfessional ? (profile as any)?.professional?.yearsOfExp : null;
  const available = isProfessional ? (profile as any)?.professional?.available : undefined;
  const chargeFrom = isProfessional ? (profile as any)?.professional?.chargeFrom : null;
  const intro = isProfessional ? (data as any)?.intro : null;
  const language = isProfessional ? (data as any)?.language : null;
  const profession = isProfessional ? (profile as any)?.professional?.profession?.title : null;

  // Location
  const location = isProfessional
    ? (profile as any)?.user?.location || (data as any)?.location
    : (data as any)?.location;
  const parts = [location?.state, location?.lga, location?.city].filter(
    (v, i, arr) => v && arr.indexOf(v) === i
  );
  const fullAddress = parts.join(', ');

  // Arrays
  const education = isProfessional ? (profile as any)?.education || [] : [];
  const certification = isProfessional ? (profile as any)?.certification || [] : [];
  const portfolio = isProfessional ? (profile as any)?.portfolio || [] : [];
  const experience = isProfessional ? (profile as any)?.experience || [] : [];
  const reviews = isProfessional ? (profile as any)?.user?.professionalReviews || [] : [];

  const handleCall = () => {
    const userIdData = {
      userId: profile?.userId || data?.id || '',
      [isProfessional ? 'professionalId' : 'clientId']: data?.id,
    };
    router.push(`/callchat/${JSON.stringify(userIdData)}`);
    onClose();
  };

  const handleChat = () => {
    const userIdData = {
      userId: profile?.userId || data?.id || '',
      [isProfessional ? 'professionalId' : 'clientId']: data?.id,
    };
    router.push(`/mainchat/${JSON.stringify(userIdData)}`);
    onClose();
  };

  // Colors
  const isDark = theme === 'dark';
  const cardBg = isDark ? '#1A2540' : '#F0F4FF';
  const dividerColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const cyan = '#00D4E8';
  const cyanDim = 'rgba(0,212,232,0.12)';

  return (
    <Modal
      visible={isVisible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: 'rgba(0,0,0,0.65)',
            opacity: backdropAnim,
          },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: isDark ? '#0F1A2E' : '#FFFFFF',
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Drag Handle */}
        <View style={styles.dragHandle}>
          <View style={[styles.handleBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }]} />
        </View>

        {/* Header Row */}
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            {isProfessional ? 'Professional Profile' : 'Client Profile'}
          </Text>
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: cyanDim }]}>
            <Ionicons name="close" size={18} color={cyan} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* ── Hero Section ── */}
          <View style={styles.heroContainer}>
            <LinearGradient
              colors={isProfessional
                ? ['rgba(0,212,232,0.18)', 'rgba(0,212,232,0.04)', 'transparent']
                : ['rgba(59,130,246,0.18)', 'rgba(59,130,246,0.04)', 'transparent']}
              style={styles.heroGradient}
            />

            {/* Avatar */}
            <View style={styles.avatarRing}>
              <View style={[styles.avatarInner, { borderColor: isProfessional ? cyan : '#3B82F6' }]}>
                {avatar ? (
                  <Image resizeMode="cover" style={styles.avatarImage} source={{ uri: avatar }} />
                ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: cyanDim }]}>
                    <FontAwesome5 name="user" size={36} color={cyan} />
                  </View>
                )}
              </View>
              {/* Online dot */}
              {isProfessional && available !== undefined && (
                <View style={[
                  styles.statusDot,
                  { backgroundColor: available ? '#22C55E' : '#EF4444', borderColor: isDark ? '#0F1A2E' : '#fff' }
                ]} />
              )}
            </View>

            {/* Name */}
            <Text style={[styles.heroName, { color: textColor }]}>{name || 'Unknown'}</Text>

            {/* Role Badge */}
            <View style={[styles.roleBadge, { backgroundColor: isProfessional ? 'rgba(0,212,232,0.12)' : 'rgba(59,130,246,0.12)' }]}>
              <View style={[styles.roleDot, { backgroundColor: isProfessional ? cyan : '#3B82F6' }]} />
              <Text style={[styles.roleBadgeText, { color: isProfessional ? cyan : '#3B82F6' }]}>
                {isProfessional ? (profession || 'Professional') : 'Client'}
              </Text>
            </View>

            {/* Rating */}
            {isProfessional && avgRating > 0 && (
              <View style={styles.ratingRow}>
                <RatingStar numberOfStars={avgRating} />
                {numRating > 0 && (
                  <Text style={[styles.ratingCount, { color: secondaryTextColor }]}>
                    ({numRating} review{numRating !== 1 ? 's' : ''})
                  </Text>
                )}
              </View>
            )}

            {/* Quick Stats Row */}
            {isProfessional && (
              <View style={styles.statsRow}>
                {yearsOfExp && (
                  <View style={[styles.statChip, { backgroundColor: cardBg }]}>
                    <Ionicons name="briefcase-outline" size={13} color={cyan} />
                    <Text style={[styles.statChipText, { color: textColor }]}>{yearsOfExp} yrs exp</Text>
                  </View>
                )}
                {chargeFrom && (
                  <View style={[styles.statChip, { backgroundColor: cardBg }]}>
                    <Text style={[styles.statChipText, { color: cyan }]}>
                      from ₦{Number(chargeFrom).toLocaleString()}
                    </Text>
                  </View>
                )}
                {language && (
                  <View style={[styles.statChip, { backgroundColor: cardBg }]}>
                    <Ionicons name="language-outline" size={13} color={cyan} />
                    <Text style={[styles.statChipText, { color: textColor }]}>{language}</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* ── Action Buttons ── */}
          <View style={[styles.actionBar, { borderColor: dividerColor }]}>
            <TouchableOpacity onPress={handleCall} style={styles.actionBtn} activeOpacity={0.8}>
              <View style={[styles.actionIconCircle, { backgroundColor: cyan }]}>
                <FontAwesome5 name="phone" size={16} color="#0F1A2E" />
              </View>
              <Text style={[styles.actionLabel, { color: secondaryTextColor }]}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleChat} style={styles.actionBtn} activeOpacity={0.8}>
              <View style={[styles.actionIconCircle, { backgroundColor: cyan }]}>
                <Ionicons name="chatbubbles-sharp" size={18} color="#0F1A2E" />
              </View>
              <Text style={[styles.actionLabel, { color: secondaryTextColor }]}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert('Profile', 'Full profile view coming soon!')}
              style={styles.actionBtn}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconCircleOutline, { borderColor: cyan }]}>
                <FontAwesome5 name="user" size={16} color={cyan} />
              </View>
              <Text style={[styles.actionLabel, { color: secondaryTextColor }]}>Profile</Text>
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 16 }}>

            {/* ── Contact Info ── */}
            {(email || phone || fullAddress) && (
              <SectionCard title="Contact" icon="call-outline" cardBg={cardBg} dividerColor={dividerColor} textColor={textColor} secondaryTextColor={secondaryTextColor} cyan={cyan}>
                {email && (
                  <InfoRow icon={<Ionicons name="mail-outline" size={15} color={cyan} />} label={email} textColor={textColor} secondaryTextColor={secondaryTextColor} />
                )}
                {phone && (
                  <InfoRow icon={<Ionicons name="call-outline" size={15} color={cyan} />} label={phone} textColor={textColor} secondaryTextColor={secondaryTextColor} />
                )}
                {fullAddress && (
                  <InfoRow icon={<Ionicons name="location-outline" size={15} color={cyan} />} label={fullAddress} textColor={textColor} secondaryTextColor={secondaryTextColor} />
                )}
              </SectionCard>
            )}

            {/* ── Introduction ── */}
            {intro && (
              <SectionCard title="About" icon="document-text-outline" cardBg={cardBg} dividerColor={dividerColor} textColor={textColor} secondaryTextColor={secondaryTextColor} cyan={cyan}>
                <Text style={[styles.introText, { color: secondaryTextColor }]}>{intro}</Text>
              </SectionCard>
            )}

            {/* ── Education ── */}
            {education.length > 0 && (
              <SectionCard title="Education" icon="school-outline" cardBg={cardBg} dividerColor={dividerColor} textColor={textColor} secondaryTextColor={secondaryTextColor} cyan={cyan}>
                {education.map((edu: any, index: number) => (
                  <TimelineItem
                    key={edu.id || index}
                    title={edu.course}
                    subtitle={edu.school}
                    isLast={index === education.length - 1}
                    textColor={textColor}
                    secondaryTextColor={secondaryTextColor}
                    cyan={cyan}
                    dividerColor={dividerColor}
                  />
                ))}
              </SectionCard>
            )}

            {/* ── Certifications ── */}
            {certification.length > 0 && (
              <SectionCard title="Certifications" icon="ribbon-outline" cardBg={cardBg} dividerColor={dividerColor} textColor={textColor} secondaryTextColor={secondaryTextColor} cyan={cyan}>
                {certification.map((cert: any, index: number) => (
                  <TimelineItem
                    key={cert.id || index}
                    title={cert.title}
                    subtitle={cert.date}
                    isLast={index === certification.length - 1}
                    textColor={textColor}
                    secondaryTextColor={secondaryTextColor}
                    cyan={cyan}
                    dividerColor={dividerColor}
                  />
                ))}
              </SectionCard>
            )}

            {/* ── Experience ── */}
            {experience.length > 0 && (
              <SectionCard title="Experience" icon="briefcase-outline" cardBg={cardBg} dividerColor={dividerColor} textColor={textColor} secondaryTextColor={secondaryTextColor} cyan={cyan}>
                {experience.map((exp: any, index: number) => (
                  <TimelineItem
                    key={exp.id || index}
                    title={exp.title}
                    subtitle={`${exp.company} · ${exp.duration}`}
                    isLast={index === experience.length - 1}
                    textColor={textColor}
                    secondaryTextColor={secondaryTextColor}
                    cyan={cyan}
                    dividerColor={dividerColor}
                  />
                ))}
              </SectionCard>
            )}

            {/* ── Portfolio ── */}
            {portfolio.length > 0 && (
              <SectionCard title="Portfolio" icon="images-outline" cardBg={cardBg} dividerColor={dividerColor} textColor={textColor} secondaryTextColor={secondaryTextColor} cyan={cyan}>
                {portfolio.map((item: any, index: number) => (
                  <View
                    key={item.id || index}
                    style={[
                      styles.portfolioItem,
                      index < portfolio.length - 1 && { borderBottomWidth: 1, borderBottomColor: dividerColor },
                    ]}
                  >
                    <Text style={[styles.portfolioTitle, { color: textColor }]}>{item.title}</Text>
                    {item.description && (
                      <Text style={[styles.portfolioDesc, { color: secondaryTextColor }]} numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                ))}
              </SectionCard>
            )}

            {/* ── Reviews ── */}
            {reviews.length > 0 && (
              <SectionCard title={`Reviews (${reviews.length})`} icon="star-outline" cardBg={cardBg} dividerColor={dividerColor} textColor={textColor} secondaryTextColor={secondaryTextColor} cyan={cyan}>
                {reviews.slice(0, 3).map((review: any, index: number) => (
                  <View
                    key={review.id || index}
                    style={[
                      styles.reviewItem,
                      index < Math.min(reviews.length, 3) - 1 && { borderBottomWidth: 1, borderBottomColor: dividerColor },
                    ]}
                  >
                    <View style={styles.reviewHeader}>
                      <View style={[styles.reviewAvatar, { backgroundColor: 'rgba(0,212,232,0.12)' }]}>
                        <Text style={[styles.reviewAvatarLetter, { color: cyan }]}>
                          {(review.clientUser?.profile?.firstName || '?')[0].toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={[styles.reviewerName, { color: textColor }]}>
                          {review.clientUser?.profile?.firstName} {review.clientUser?.profile?.lastName}
                        </Text>
                        <RatingStar numberOfStars={review.rating} />
                      </View>
                    </View>
                    <Text style={[styles.reviewText, { color: secondaryTextColor }]}>{review.review}</Text>
                  </View>
                ))}
                {reviews.length > 3 && (
                  <TouchableOpacity
                    onPress={() => Alert.alert('All Reviews', 'View all reviews feature coming soon!')}
                    style={[styles.viewAllBtn, { borderColor: 'rgba(0,212,232,0.25)' }]}
                  >
                    <Text style={{ color: cyan, fontSize: 13, fontWeight: '600' }}>
                      View all {reviews.length} reviews
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color={cyan} />
                  </TouchableOpacity>
                )}
              </SectionCard>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

/* ── Sub-components ── */

const SectionCard = ({
  title, icon, children, cardBg, dividerColor, textColor, secondaryTextColor, cyan
}: any) => (
  <View style={[styles.sectionCard, { backgroundColor: cardBg }]}>
    <View style={[styles.sectionHeader, { borderBottomColor: dividerColor }]}>
      <Ionicons name={icon} size={15} color={cyan} />
      <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
    </View>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

const InfoRow = ({ icon, label, textColor, secondaryTextColor }: any) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>{icon}</View>
    <Text style={[styles.infoLabel, { color: textColor }]}>{label}</Text>
  </View>
);

const TimelineItem = ({ title, subtitle, isLast, textColor, secondaryTextColor, cyan, dividerColor }: any) => (
  <View style={[styles.timelineItem, !isLast && { borderBottomWidth: 1, borderBottomColor: dividerColor }]}>
    <View style={[styles.timelineDot, { backgroundColor: cyan }]} />
    <View style={{ flex: 1 }}>
      <Text style={[styles.timelineTitle, { color: textColor }]}>{title}</Text>
      {subtitle && <Text style={[styles.timelineSubtitle, { color: secondaryTextColor }]}>{subtitle}</Text>}
    </View>
  </View>
);

/* ── Styles ── */
const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: MODAL_HEIGHT,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  dragHandle: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Hero
  heroContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  avatarRing: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2.5,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: 8,
    textAlign: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
    gap: 6,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 6,
  },
  ratingCount: {
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 4,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  statChipText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Action bar
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 6,
  },
  actionIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconCircleOutline: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Section card
  sectionCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  sectionBody: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },

  // Info row
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  infoIcon: {
    width: 20,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    flex: 1,
  },

  // Intro text
  introText: {
    fontSize: 14,
    lineHeight: 21,
    paddingVertical: 12,
  },

  // Timeline
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    gap: 12,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  timelineSubtitle: {
    fontSize: 12,
  },

  // Portfolio
  portfolioItem: {
    paddingVertical: 12,
  },
  portfolioTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  portfolioDesc: {
    fontSize: 13,
    lineHeight: 18,
  },

  // Reviews
  reviewItem: {
    paddingVertical: 14,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarLetter: {
    fontSize: 15,
    fontWeight: '700',
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  reviewText: {
    fontSize: 13,
    lineHeight: 19,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 4,
    borderTopWidth: 1,
    gap: 4,
  },
});

export default ProfileSlideupModal;
