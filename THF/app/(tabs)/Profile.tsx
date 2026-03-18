import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Navbar from '../../components/Navbar';
import { useUserStore } from '@/src/hooks/useUserStore';
import { auth } from '@/src/services/firebaseConfig';

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
export default function ProfileScreen() {
  const router = useRouter();
  const { profile, loading } = useUserStore();

  const chefName = profile?.name ?? '';
  const chefId = auth.currentUser?.uid?.slice(0, 6).toUpperCase() ?? '----';
  const isVerified = profile?.kycStatus === 'approved';
  const city = profile?.city ?? '';
  const language = profile?.language ?? 'en';

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color="#E8304A" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Navbar />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>My profile</Text>

        {/* ── Profile Card ── */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{chefName ? chefName.charAt(0).toUpperCase() : '?'}</Text>
            </View>
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{chefName || 'Partner'}</Text>
            <TouchableOpacity onPress={() => router.push('/edit/EditDetails')} activeOpacity={0.7} style={styles.editBtn}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.specialty}>Partner | {city || 'City not set'}</Text>
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

        {/* ── KYC Status Row ── */}
        <View style={styles.kycCard}>
          <Text style={styles.kycLabel}>KYC Status</Text>
          <Text style={[
            styles.kycValue,
            profile?.kycStatus === 'approved' && { color: '#2e7d32' },
            profile?.kycStatus === 'rejected' && { color: '#E8304A' },
          ]}>
            {(profile?.kycStatus ?? 'pending').toUpperCase()}
          </Text>
        </View>

        {/* ── Menu Items ── */}
        <View style={styles.menuSection}>
          <MenuRow label="Account detail" onPress={() => router.push('/edit/AccountDetails')} />
          <View style={styles.menuDivider} />
          <MenuRow label="Bank details" onPress={() => router.push('/edit/AccountDetails')} />
          <View style={styles.menuDivider} />
          <MenuRow label="Refer a friend & Earn" badge="Earn upto ₹5000" onPress={() => router.push('/edit/ReferFriend')} />
          <View style={styles.menuDivider} />
          <MenuRow label="Change Language" onPress={() => router.push('/edit/ChangeLanguage')} />
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

  /* KYC Card */
  kycCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  kycLabel: { fontSize: 14, color: '#555', fontWeight: '500' },
  kycValue: { fontSize: 14, fontWeight: '700', color: '#B8860B' },
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
