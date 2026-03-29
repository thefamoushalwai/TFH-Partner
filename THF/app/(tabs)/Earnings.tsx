import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import Navbar from '../../components/Navbar';
import { auth } from '@/src/services/firebaseConfig';
import { getPartnerBookings, type Booking } from '@/src/services/bookingService';
import dayjs from 'dayjs';
import { useLanguage } from '@/src/hooks/useLanguage';


/* ── Local display type for TransactionRow component ── */
interface DisplayTransaction {
  id: string;
  clientName: string;
  date: string;
  guests: number;
  type: string;
  amount: number;
}

/* ── Transaction Row ── */
function TransactionRow({ transaction }: { transaction: DisplayTransaction }) {
  const isNegative = transaction.amount < 0;
  
  return (
    <View style={txStyles.row}>
      <View style={txStyles.iconBox}>
        <Image source={require('@/assets/THF/Check.svg')} style={{ width: 28, height: 28 }} />
      </View>
      <View style={txStyles.info}>
        <Text style={txStyles.name}>{transaction.type === 'fee' ? 'Platform Fee' : `Booking - ${transaction.clientName}`}</Text>
        <Text style={txStyles.meta}>
          {transaction.date} | {transaction.guests ? `${transaction.guests} guests | ` : ''}{transaction.type === 'fee' ? '10% deducted' : 'Payout'}
        </Text>
      </View>
      <Text style={[txStyles.amount, isNegative && txStyles.amountNegative]}>
        {isNegative ? '-' : '+'}₹{Math.abs(transaction.amount)}
      </Text>
    </View>
  );
}

/* ── Main Screen ── */
export default function EarningsScreen() {
  const [transactions, setTransactions] = useState<DisplayTransaction[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [completionRate, setCompletionRate] = useState('0%');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const month = dayjs().format('MMMM YYYY');
  const prevMonth = dayjs().subtract(1, 'month').format('MMMM YYYY');
  const { t } = useLanguage();

  const fetchTransactions = React.useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      // Fetch all bookings for the partner
      const bookingsData = await getPartnerBookings(uid);
      
      let sum = 0;
      const displayTx: DisplayTransaction[] = [];
      
      // Filter and process ONLY completed bookings for earnings
      const completedBookings = bookingsData.filter(b => b.status === 'completed');
      
      completedBookings.forEach(booking => {
        const amount = booking.amount || 0;
        sum += amount;
        
        displayTx.push({
          id: booking.bookingId,
          clientName: booking.clientName,
          date: dayjs((booking.date as any)?.toDate?.() ?? booking.date).format('DD MMM'),
          guests: booking.guests || 0,
          type: 'Payout',
          amount: amount,
        });

      
      });

      // Calculate completion rate based on all bookings
      if (bookingsData.length > 0) {
        const count = completedBookings.length;
        const rate = Math.round((count / bookingsData.length) * 100);
        setCompletionRate(`${rate}%`);
      } else {
        setCompletionRate('0%');
      }

      setTotalEarned(sum);
      setTransactions(displayTx);
    } catch (error) {
      console.error('[Earnings] fetch error:', error);
    }
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  }, [fetchTransactions]);

  useEffect(() => {
    fetchTransactions().finally(() => setLoading(false));
  }, [fetchTransactions]);

  const formatAmount = (amount: number) =>
    amount === 0 ? '0' : amount.toLocaleString('en-IN');
    
  const bookingsCount = transactions.length; 
  const avgRatings = '4.9';
  const comparisonPercent = '22%';


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f7" />
      <Navbar />
      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E8304A" />}
      >
        <Text style={styles.pageTitle}>{t('myEarnings')}</Text>
        <Text style={styles.monthLabel}>{month}</Text>

        {/* ── Summary Card ── */}
        <View style={styles.summaryCard}>
          <Text style={styles.totalLabel}>{t('totalEarned')} - {month}</Text>
          <Text style={styles.totalAmount}>₹{formatAmount(totalEarned)}</Text>
          <Text style={styles.comparison}>{comparisonPercent} compared to {prevMonth}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{bookingsCount}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{avgRatings}</Text>
              <Text style={styles.statLabel}>Avg. Ratings</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completionRate}</Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
            <View style={styles.void}>
             
            </View>
          </View>
        </View>

        {/* ── Recent Transactions ── */}
        <Text style={styles.sectionTitle}>{t('recentTransactions')}</Text>
        {loading && !refreshing ? (
          <ActivityIndicator color="#E8304A" style={{ marginTop: 16 }} />
        ) : transactions.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>{t('noTransactions')}</Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {transactions.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── Styles ── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },

  pageTitle: { fontSize: 20, fontWeight: '700', color: '#1A1C1E', marginBottom: 6 },
  monthLabel: { fontSize: 14, color: '#6C7278', marginBottom: 20 },

  /* Summary Card */
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#d3dbe2',
  },
  totalLabel: { fontSize: 13, color: '#6C7278', marginBottom: 0, fontWeight: '500' },
  totalAmount: { fontSize: 36, fontWeight: '800', color: '#1A1C1E', marginBottom: 0 },
  comparison: { fontSize: 13, color: '#6C7278', marginBottom: 15 },
  divider: { height: 1, backgroundColor: '#d3dbe2', marginBottom: 10 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'flex-start', width: '25%' },
  statValue: { fontSize: 24, fontWeight: '900',color: '#22A75D', marginBottom: 1 },
  statLabel: { fontSize: 11, color: '#889098' },
  void: { width: '10%' },

  /* Section */
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1C1E', marginBottom: 16 },

  /* Transactions list container */
  transactionsList: {
    gap: 12, // Spacing between each transaction card
  },

  /* Empty state */
  emptyBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: { fontSize: 14, color: '#889098', fontWeight: '500' },
});

const txStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d3dbe2',
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: '#1A1C1E', marginBottom: 4 },
  meta: { fontSize: 12, color: '#889098' },
  amount: { fontSize: 15, fontWeight: '700', color: '#22A75D' },
  amountNegative: { color: '#E8304A' },
});


