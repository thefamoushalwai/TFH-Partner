import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Navbar from '../../components/Navbar';
import { useUserStore } from '@/src/hooks/useUserStore';
import { getPartnerBookings, type Booking as FirestoreBooking } from '@/src/services/bookingService';
import { auth } from '@/src/services/firebaseConfig';
import dayjs from 'dayjs';
const { width } = Dimensions.get('window');

/* ── Types ── */
interface Booking {
  id: string;
  time: string;
  period: string;
  nextUpLabel: string;
  clientName: string;
  occasion: string;
  guests: number;
  location: string;
}

interface DashboardScreenProps {
  chefName?: string;
  chefId?: string;
  isVerified?: boolean;
  profileImage?: any;
  bookings?: number;
  earned?: number;
  ratings?: number;
  todaysBookings?: Booking[];
  onHelp?: () => void;
  onViewDetail?: (booking: Booking) => void;
  onLocation?: (booking: Booking) => void;
  onCallClient?: (booking: Booking) => void;
}

/* ── Summary Card ── */
function SummaryCard({
  icon,
  label,
  value,
  iconBg,
}: {
  icon: string;
  label: string;
  value: string;
  iconBg: string;
}) {
  return (
    <View style={summaryStyles.card}>
      <View style={[summaryStyles.iconBox, { backgroundColor: iconBg }]}>
        <Text style={summaryStyles.icon}>{icon}</Text>
      </View>
      <Text style={summaryStyles.label}>{label}</Text>
      <Text style={summaryStyles.value}>{value}</Text>
    </View>
  );
}

/* ── Booking Card ── */
function BookingCard({
  booking,
  showActions,
  onViewDetail,
  onLocation,
  onCallClient,
}: {
  booking: Booking;
  showActions: boolean;
  onViewDetail?: () => void;
  onLocation?: () => void;
  onCallClient?: () => void;
}) {
  return (
    <View style={bookingStyles.card}>
      <View style={bookingStyles.row}>
        {/* Time */}
        <View style={bookingStyles.timeBox}>
          <Text style={bookingStyles.timeNum}>{booking.time}</Text>
          <Text style={bookingStyles.timePeriod}>{booking.period}</Text>
        </View>

        {/* Info */}
        <View style={bookingStyles.info}>
          <Text style={bookingStyles.nextUp}>{booking.nextUpLabel}</Text>
          <Text style={bookingStyles.clientName}>{booking.clientName}</Text>
          <Text style={bookingStyles.meta}>
            {booking.occasion} | {booking.guests} guests | {booking.location}
          </Text>
        </View>
      </View>

      {showActions && (
        <>
          <View style={bookingStyles.divider} />
          <View style={bookingStyles.actions}>
            <TouchableOpacity style={bookingStyles.viewBtn} onPress={onViewDetail} activeOpacity={0.8}>
              <Text style={bookingStyles.viewBtnText}>View detail</Text>
            </TouchableOpacity>
            <TouchableOpacity style={bookingStyles.locationBtn} onPress={onLocation} activeOpacity={0.8}>
              <Text style={bookingStyles.locationBtnText}>📍 Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={bookingStyles.callBtn} onPress={onCallClient} activeOpacity={0.8}>
              <Text style={bookingStyles.callBtnText}>📞 Call Client</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}



/* ── Main Screen ── */
export default function DashboardScreen() {
  const { profile, loading: profileLoading } = useUserStore();
  const [bookings, setBookings] = useState<FirestoreBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setBookingsLoading(false); return; }
    getPartnerBookings(uid)
      .then(setBookings)
      .catch(console.error)
      .finally(() => setBookingsLoading(false));
  }, []);

  const chefName = profile?.name ?? '';
  const chefId = auth.currentUser?.uid?.slice(0, 6).toUpperCase() ?? '----';
  const isVerified = profile?.kycStatus === 'approved';

  // Today's bookings (status = active or accepted with today's date)
  const todayStr = dayjs().format('YYYY-MM-DD');
  const todaysBookings = bookings.filter((b) => {
    const bDate = b.date ? dayjs((b.date as any).toDate?.() ?? b.date).format('YYYY-MM-DD') : null;
    return bDate === todayStr && (b.status === 'active' || b.status === 'accepted' || b.status === 'pending');
  });

  // Stats: total completed bookings & earnings
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const totalEarned = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.amount ?? 0), 0);

  if (profileLoading) {
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

        {/* ── Welcome Card ── */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeLeft}>
            <Text style={styles.welcomeHi}>Welcome!</Text>
            <Text style={styles.welcomeName}>{chefName || 'Partner'}</Text>
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
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{chefName ? chefName.charAt(0).toUpperCase() : '?'}</Text>
          </View>
        </View>

        {/* ── Today's Summary ── */}
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.summaryRow}>
          <SummaryCard icon="📋" label="Bookings" value={String(completedCount)} iconBg="#FFF0F0" />
          <SummaryCard icon="💰" label="Earned" value={`₹${totalEarned}`} iconBg="#FFF5E0" />
          <SummaryCard icon="⭐" label="KYC" value={profile?.kycStatus ?? 'pending'} iconBg="#FFFBE0" />
        </View>

        {/* ── Today's Bookings ── */}
        <Text style={styles.sectionTitle}>Today's Bookings</Text>
        {bookingsLoading ? (
          <ActivityIndicator color="#E8304A" style={{ marginTop: 20 }} />
        ) : todaysBookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No bookings for today 🎉</Text>
          </View>
        ) : (
          todaysBookings.map((booking, index) => (
            <BookingCard
              key={booking.bookingId}
              booking={{
                id: booking.bookingId,
                time: dayjs((booking.date as any).toDate?.() ?? booking.date).format('hh'),
                period: dayjs((booking.date as any).toDate?.() ?? booking.date).format('a'),
                nextUpLabel: index === 0 ? 'Next up' : 'Upcoming',
                clientName: booking.clientName,
                occasion: booking.eventType,
                guests: booking.guests,
                location: booking.location,
              }}
              showActions={index === 0}
            />
          ))
        )}

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── Styles ── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },



  /* Welcome Card */
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  welcomeLeft: { flex: 1 },
  welcomeHi: { fontSize: 13, color: '#888', marginBottom: 2 },
  welcomeName: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 10 },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
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
  avatar: { width: 64, height: 64, borderRadius: 32, marginLeft: 12 },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8304A',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  avatarInitial: { color: '#fff', fontSize: 24, fontWeight: '700' },

  /* Section title */
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 14,
  },

  /* Summary Row */
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },

  /* Empty state */
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyText: { fontSize: 14, color: '#999', fontWeight: '500' },
});

const summaryStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  icon: { fontSize: 16 },
  label: { fontSize: 11, color: '#999', marginBottom: 4 },
  value: { fontSize: 20, fontWeight: '700', color: '#111' },
});

const bookingStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  timeBox: {
    alignItems: 'center',
    minWidth: 36,
  },
  timeNum: { fontSize: 26, fontWeight: '700', color: '#111', lineHeight: 30 },
  timePeriod: { fontSize: 12, color: '#999', fontWeight: '500' },
  info: { flex: 1 },
  nextUp: { fontSize: 11, color: '#888', marginBottom: 3 },
  clientName: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 3 },
  meta: { fontSize: 12, color: '#999' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 14 },
  actions: { flexDirection: 'row', gap: 10 },
  viewBtn: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  viewBtnText: { fontSize: 13, color: '#333', fontWeight: '500' },
  locationBtn: {
    flex: 1,
    backgroundColor: '#E8304A',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  locationBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' },
  callBtn: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  callBtnText: { fontSize: 13, color: '#2e7d32', fontWeight: '600' },
});


