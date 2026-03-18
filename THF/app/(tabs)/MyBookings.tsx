import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Navbar from '../../components/Navbar';
import { auth } from '@/src/services/firebaseConfig';
import { getPartnerBookings, type Booking as FSBooking } from '@/src/services/bookingService';
import dayjs from 'dayjs';

/* ── Types ── */
type BookingStatus = 'Today' | 'Active' | 'Completed' | 'Upcoming';
type FilterTab = 'All' | 'Today' | 'Upcoming' | 'Completed';

interface Booking {
  id: string;
  day: string;
  month: string;
  title: string;
  time: string;
  guests: number;
  location: string;
  amount: number;
  status: BookingStatus;
}

interface NextUpBooking {
  label: string;
  title: string;
  time: string;
  locationNote: string;
  guests: number;
  cuisine: string;
}

interface MyBookingsScreenProps {
  dateLabel?: string;
  nextUp?: NextUpBooking;
  bookings?: Booking[];
  onHelp?: () => void;
  onNavigate?: (booking: NextUpBooking) => void;
  onCallClient?: (booking: NextUpBooking) => void;
  onBookingPress?: (booking: Booking) => void;
  onTabChange?: (tab: string) => void;
}

/* ── Status Badge ── */
function StatusBadge({ status }: { status: BookingStatus }) {
  const config: Record<BookingStatus, { bg: string; color: string }> = {
    Today:     { bg: '#FFF3CD', color: '#B8860B' },
    Active:    { bg: '#E3F0FF', color: '#1565C0' },
    Completed: { bg: '#E8F5E9', color: '#2e7d32' },
    Upcoming:  { bg: '#F3E5F5', color: '#6A1B9A' },
  };
  const { bg, color } = config[status];
  return (
    <View style={[badgeStyles.container, { backgroundColor: bg }]}>
      <Text style={[badgeStyles.text, { color }]}>{status}</Text>
    </View>
  );
}

/* ── Booking List Card ── */
function BookingCard({
  booking,
  onPress,
}: {
  booking: Booking;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Date Box */}
      <View style={cardStyles.dateBox}>
        <Text style={cardStyles.dateDay}>{booking.day}</Text>
        <Text style={cardStyles.dateMonth}>{booking.month}</Text>
      </View>

      {/* Info */}
      <View style={cardStyles.info}>
        <Text style={cardStyles.title}>{booking.title}</Text>
        <Text style={cardStyles.meta}>
          {booking.time} | {booking.guests} guests
        </Text>
        <Text style={cardStyles.location}>{booking.location}</Text>
      </View>

      {/* Right */}
      <View style={cardStyles.right}>
        <Text style={cardStyles.amount}>
          ₹{booking.amount === 0 ? '00' : booking.amount.toLocaleString('en-IN')}
        </Text>
        <StatusBadge status={booking.status} />
      </View>
    </TouchableOpacity>
  );
}

/* ── Bottom Tab Bar ── */
const TABS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'bookings', label: 'My Bookings', icon: '📅' },
  { id: 'earnings', label: 'Earnings', icon: '💰' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

function TabBar({ activeTab, onTabChange }: { activeTab: string; onTabChange?: (tab: string) => void }) {
  return (
    <View style={tabStyles.container}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={tabStyles.tab}
          onPress={() => onTabChange?.(tab.id)}
          activeOpacity={0.7}
        >
          <Text style={[tabStyles.icon, activeTab === tab.id && tabStyles.iconActive]}>{tab.icon}</Text>
          <Text style={[tabStyles.label, activeTab === tab.id && tabStyles.labelActive]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

/* ── Default Data ── */
const DEFAULT_NEXT_UP: NextUpBooking = {
  label: 'Next up - in 2 hours',
  title: 'John de ka Birthday Brunch',
  time: '00PM',
  locationNote: 'not assigned',
  guests: 0,
  cuisine: 'North Indian + Cake',
};

const DEFAULT_BOOKINGS: Booking[] = [
  { id: '1', day: '26', month: 'Feb', title: 'Booking - John de', time: '7:00 PM', guests: 8, location: 'Lajpat Nagar', amount: 0, status: 'Today' },
  { id: '2', day: '26', month: 'Feb', title: 'Booking - John de', time: '7:00 PM', guests: 8, location: 'Lajpat Nagar', amount: 0, status: 'Active' },
];

const FILTER_TABS: FilterTab[] = ['All', 'Today', 'Upcoming', 'Completed'];

/* ── Main Screen ── */
export default function MyBookingsScreen() {
  const [fsBookings, setFsBookings] = useState<FSBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');

  const dateLabel = dayjs().format('DD MMM YYYY | hh:mm a');

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoading(false); return; }
    getPartnerBookings(uid)
      .then(setFsBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Map Firestore bookings to the local display Booking shape
  const mappedBookings: Booking[] = fsBookings.map((b) => {
    const dateObj = (b.date as any).toDate ? (b.date as any).toDate() : new Date(b.date as any);
    const d = dayjs(dateObj);
    const now = dayjs();
    let status: BookingStatus = 'Upcoming';
    if (d.isSame(now, 'day')) status = 'Today';
    if (b.status === 'active') status = 'Active';
    if (b.status === 'completed') status = 'Completed';
    return {
      id: b.bookingId,
      day: d.format('DD'),
      month: d.format('MMM'),
      title: `Booking - ${b.clientName}`,
      time: d.format('h:mm A'),
      guests: b.guests,
      location: b.location,
      amount: b.amount,
      status,
    };
  });

  // Next up: earliest today/upcoming non-completed booking
  const nextUpBooking = mappedBookings.find(b => b.status === 'Today' || b.status === 'Active');
  const nextUp: NextUpBooking = nextUpBooking
    ? {
        label: nextUpBooking.status === 'Active' ? 'Active booking' : 'Next up today',
        title: nextUpBooking.title,
        time: nextUpBooking.time,
        locationNote: nextUpBooking.location,
        guests: nextUpBooking.guests,
        cuisine: fsBookings.find(b => b.bookingId === nextUpBooking.id)?.eventType ?? '',
      }
    : DEFAULT_NEXT_UP;

  const filteredBookings =
    activeFilter === 'All' ? mappedBookings : mappedBookings.filter(b => b.status === activeFilter);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Navbar />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>My Bookings</Text>
        <Text style={styles.dateLabel}>{dateLabel}</Text>

        {/* ── Next Up Card ── */}
        <View style={styles.nextUpCard}>
          <Text style={styles.nextUpLabel}>{nextUp.label}</Text>
          <Text style={styles.nextUpTitle}>{nextUp.title}</Text>
          <Text style={styles.nextUpMeta}>Time: {nextUp.time}</Text>
          <Text style={styles.nextUpMeta}>Location: {nextUp.locationNote}</Text>
          <Text style={styles.nextUpMeta}>{nextUp.guests} guests | {nextUp.cuisine}</Text>
          <View style={styles.nextUpActions}>
            <TouchableOpacity style={styles.navBtn} activeOpacity={0.8}>
              <Text style={styles.navBtnText}>Navigate location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.callBtn} activeOpacity={0.8}>
              <Text style={styles.callBtnText}>Call Client</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Filter Tabs ── */}
        <View style={styles.filterRow}>
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, activeFilter === tab && styles.filterTabActive]}
              onPress={() => setActiveFilter(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterTabText, activeFilter === tab && styles.filterTabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Booking List ── */}
        {loading ? (
          <ActivityIndicator color="#E8304A" style={{ marginTop: 20 }} />
        ) : filteredBookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {filteredBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </View>
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
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },



  pageTitle: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 4 },
  dateLabel: { fontSize: 13, color: '#888', marginBottom: 16 },

  /* Next Up Card */
  nextUpCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  nextUpLabel: { fontSize: 12, color: '#888', marginBottom: 6 },
  nextUpTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 10, lineHeight: 26 },
  nextUpMeta: { fontSize: 13, color: '#555', marginBottom: 4 },
  nextUpActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  navBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#ddd', borderRadius: 8,
    paddingVertical: 10, alignItems: 'center',
  },
  navBtnText: { fontSize: 13, color: '#555', fontWeight: '500' },
  callBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#ddd', borderRadius: 8,
    paddingVertical: 10, alignItems: 'center',
  },
  callBtnText: { fontSize: 13, color: '#555', fontWeight: '500' },

  /* Filter Tabs */
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  filterTabActive: {
    backgroundColor: '#E8304A',
    borderColor: '#E8304A',
  },
  filterTabText: { fontSize: 14, color: '#555', fontWeight: '500' },
  filterTabTextActive: { color: '#fff', fontWeight: '600' },

  /* List */
  bookingsList: { gap: 12 },

  /* Empty state */
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyText: { fontSize: 14, color: '#999', fontWeight: '500' },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  dateBox: {
    width: 44,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingVertical: 8,
  },
  dateDay: { fontSize: 20, fontWeight: '700', color: '#111', lineHeight: 24 },
  dateMonth: { fontSize: 11, color: '#888', fontWeight: '500' },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600', color: '#222', marginBottom: 3 },
  meta: { fontSize: 12, color: '#888', marginBottom: 2 },
  location: { fontSize: 12, color: '#aaa' },
  right: { alignItems: 'flex-end', gap: 6 },
  amount: { fontSize: 15, fontWeight: '700', color: '#22a75a' },
});

const badgeStyles = StyleSheet.create({
  container: {
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  text: { fontSize: 11, fontWeight: '600' },
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
