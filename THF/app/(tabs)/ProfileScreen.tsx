import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,

  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Navbar from '../../components/Navbar';

/* ── Types ── */
interface ProfileScreenProps {
  chefName?: string;
  chefId?: string;
  specialty?: string;
  cuisine?: string;
  city?: string;
  isVerified?: boolean;
  profileImage?: any;
  bookings?: number;
  earnings?: string;
  experience?: number;
  onHelp?: () => void;
  onEditProfile?: () => void;
  onAccountDetail?: () => void;
  onBankDetails?: () => void;
  onReferFriend?: () => void;
  onReferCustomer?: () => void;
  onChangeLanguage?: () => void;
  onTabChange?: (tab: string) => void;
}

/* ── Menu Row ── */
function MenuRow({
  label,
  badge,
  onPress,
}: {
  label: string;
  badge?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={menuStyles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={menuStyles.label}>{label}</Text>
      <View style={menuStyles.right}>
        {badge && (
          <View style={menuStyles.badge}>
            <Text style={menuStyles.badgeText}>{badge}</Text>
          </View>
        )}
        <Text style={menuStyles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}




/* ── Main Screen ── */
export default function ProfileScreen({
  chefName = 'Vinod Singh',
  chefId = '1234',
  specialty = 'Home Chef',
  cuisine = 'North Indian',
  city = 'Delhi',
  isVerified = true,
  profileImage,
  bookings = 100,
  earnings = '₹30k',
  experience = 7,
  onHelp,
  onEditProfile,
  onAccountDetail,
  onBankDetails,
  onReferFriend,
  onChangeLanguage,
}: ProfileScreenProps) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Top Nav ── */}
      <Navbar onHelp={onHelp} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>My profile</Text>

        {/* ── Profile Card ── */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            {profileImage ? (
              <Image source={profileImage} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{chefName.charAt(0)}</Text>
              </View>
            )}
          </View>

          {/* Name + edit */}
          <View style={styles.nameRow}>
            <Text style={styles.name}>{chefName}</Text>
            <TouchableOpacity onPress={onEditProfile} activeOpacity={0.7} style={styles.editBtn}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>

          {/* Specialty */}
          <Text style={styles.specialty}>
            {specialty} | {cuisine} | {city}
          </Text>

          {/* Badges */}
          <View style={styles.badgeRow}>
            {isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ verified</Text>
              </View>
            )}
            <View style={styles.chefIdBadge}>
              <Text style={styles.chefIdText}>Chef-id: {chefId}</Text>
            </View>
          </View>
        </View>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{bookings}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{earnings}</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{experience} yrs.</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
        </View>

        {/* ── Menu Items ── */}
        <View style={styles.menuSection}>
          <MenuRow label="Account detail" onPress={() => onAccountDetail ? onAccountDetail() : router.push('/edit/AccountDetailsScreen')} />
          <View style={styles.menuDivider} />
          <MenuRow label="Bank details" onPress={() => onBankDetails ? onBankDetails() : router.push('/edit/AccountDetailsScreen')} />
          <View style={styles.menuDivider} />
          <MenuRow
            label="Refer a friend & Earn"
            badge="Earn upto ₹5000"
            onPress={() => onReferFriend ? onReferFriend() : router.push('/edit/ReferFriendScreen')}
          />
          <View style={styles.menuDivider} />
          <MenuRow label="Change Language" onPress={() => onChangeLanguage ? onChangeLanguage() : router.push('/edit/ChangeLanguageScreen')} />
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>

    </SafeAreaView>
  );
}

/* ── Styles ── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },



  pageTitle: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 16 },

  /* Profile Card */
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarWrapper: { marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8304A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { color: '#fff', fontSize: 32, fontWeight: '700' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  name: { fontSize: 20, fontWeight: '700', color: '#111' },
  editBtn: { padding: 2 },
  editIcon: { fontSize: 16 },
  specialty: { fontSize: 13, color: '#888', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  verifiedText: { fontSize: 12, color: '#2e7d32', fontWeight: '500' },
  chefIdBadge: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  chefIdText: { fontSize: 12, color: '#555', fontWeight: '500' },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#999' },
  statDivider: { width: 1, backgroundColor: '#f0f0f0', marginVertical: 4 },

  /* Menu Section */
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  menuDivider: { height: 1, backgroundColor: '#f5f5f5', marginHorizontal: 16 },
});

const menuStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  label: { fontSize: 15, color: '#222', fontWeight: '400' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    backgroundColor: '#FFF9E0',
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  badgeText: { fontSize: 11, color: '#B8860B', fontWeight: '600' },
  chevron: { fontSize: 20, color: '#ccc', fontWeight: '300' },
});

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingBottom: 8,
    paddingTop: 8,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  icon: { fontSize: 20, marginBottom: 3, opacity: 0.4 },
  iconActive: { opacity: 1 },
  label: { fontSize: 11, color: '#aaa', fontWeight: '500' },
  labelActive: { color: '#E8304A', fontWeight: '600' },
});
