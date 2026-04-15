import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, StatusBar, Alert,  } from 'react-native';
import Navbar from '@/components/Navbar';
import { updateBookingStatus } from '@/src/services/bookingService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/src/hooks/useLanguage';
import type { TranslationKey } from '@/src/i18n/translations';
import { CustomText as Text } from '../../components/CustomText';

// ─── Types ────────────────────────────────────────────────────────────────────
interface JobDetails {
  title: string;
  time: string;
  location: string;
  guests: number;
  cuisine: string;
}


// ─── Job Card ─────────────────────────────────────────────────────────────────
const JobCard = ({ job, t }: { job: JobDetails; t: (key: TranslationKey) => string }) => (
  <View style={styles.jobCard}>
    <Text style={styles.currentJobLabel}>{t('currentJob')}</Text>
    <Text style={styles.jobTitle}>{job.title}</Text>
    <View style={styles.jobMeta}>
      <Text style={styles.jobMetaText}>⏰  {t('timePrefix')} {job.time}</Text>
      <Text style={styles.jobMetaText}>📍  {t('locationPrefix')} {job.location}</Text>
      <Text style={styles.jobMetaText}>
        👥  {job.guests} {t('guestsLabel')}  |  {job.cuisine}
      </Text>
    </View>
  </View>
);

// ─── Timer Display ────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0');

interface TimerDisplayProps {
  seconds: number;
  running: boolean;
  t: (key: TranslationKey) => string;
}

const TimerDisplay = ({ seconds, running, t }: TimerDisplayProps) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const TimerUnit = ({
    value,
    label,
  }: {
    value: string;
    label: string;
  }) => (
    <View style={styles.timerUnit}>
      <Text style={styles.timerDigits}>{value}</Text>
      <Text style={styles.timerLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.timerRow}>
      <TimerUnit value={pad(h)} label={t('hours')} />
      <Text style={styles.timerColon}>:</Text>
      <TimerUnit value={pad(m)} label={t('minutes')} />
      <Text style={styles.timerColon}>:</Text>
      <TimerUnit value={pad(s)} label={t('seconds')} />
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────


export default function JobTimerScreen() {
  const { t } = useLanguage();
  const params = useLocalSearchParams<{
    bookingId?: string;
    title?: string;
    time?: string;
    location?: string;
    guests?: string;
    cuisine?: string;
  }>();

  // Combine params with safe fallbacks
  const JOB: JobDetails = {
    title: params.title || 'Ongoing Job',
    time: params.time || 'N/A',
    location: params.location || 'N/A',
    guests: parseInt(params.guests || '0', 10),
    cuisine: params.cuisine || 'N/A',
  };

  const { bookingId } = params;
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);


  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const handleStart = () => {
    setRunning(true);
  };

  const handlePause = () => setRunning(false);

  const handleEnd = () => {
    Alert.alert(t('quitConfirmTitle'), t('quitConfirmMsg'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('yes'),
        style: 'destructive',
        onPress: async () => {
          setRunning(false);
          
          if (bookingId) {
            try {
              await updateBookingStatus(bookingId, 'completed');
            } catch (err) {
              console.error('[JobTimer] error marking completed:', err);
            }
          }

          // Redirect to dashboard after a short delay or immediately
          // Based on "on finished direct to dashboard screen"
          router.replace('/(tabs)/Dashboard');
        },
      },
    ]);
  };


  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <View style={styles.screen}>
        <Navbar />
        <JobCard job={JOB} t={t} />

        <View style={{ height: 100 }}></View>

        {/* Timer area */}
        <View style={styles.timerArea}>



          {/* Status badge */}
          {running ? (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>{t('live')}</Text>
            </View>
          ): <View style={styles.void}>
              
            </View>}
          <TimerDisplay seconds={elapsed} running={running} t={t} />
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaArea}>
          {/* Initial State: Only Start Button */}
          {!running && elapsed === 0 && (
            <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.88}>
              <Text style={styles.startBtnText}>{t('startJobTimer')}</Text>
            </TouchableOpacity>
          )}

          {/* Running State: Stop and Pause Buttons */}
          {running && (
            <View style={styles.runningBtns}>
              <TouchableOpacity style={styles.endBtn} onPress={handleEnd} activeOpacity={0.85}>
                <Text style={styles.endBtnText}>{t('stopBtn')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pauseBtn} onPress={handlePause} activeOpacity={0.85}>
                <Text style={styles.pauseBtnText}>{t('pauseLabel')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Paused State: Resume and Stop Buttons */}
          {!running && elapsed > 0 && (
            <View style={styles.runningBtns}>
              <TouchableOpacity style={styles.endBtn} onPress={handleEnd} activeOpacity={0.85}>
                <Text style={styles.endBtnText}>{t('stopBtn')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.startBtn, { flex: 1, height: 54 }]} 
                onPress={handleStart} 
                activeOpacity={0.88}
              >
                <Text style={styles.startBtnText}>{t('resumeLabel')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const RED = '#E53935';
const RED_DARK = '#C62828';
const TEXT = '#1A1A1A';
const MUTED = '#6B7280';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  screen: { flex: 1, backgroundColor: '#F5F5F5' },
  jobCard: {
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DCDCDC',
  },
  currentJobLabel: {
    fontSize: 11,
    color: MUTED,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: TEXT,
    lineHeight: 26,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  jobMeta: { gap: 3 },
  jobMetaText: { fontSize: 13, color: '#444', lineHeight: 20 },
  timerArea: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 30,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RED,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 20,
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },
  liveBadgeText: { color: '#FFFFFF', fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  timerUnit: { alignItems: 'center', minWidth: 70 },
  timerDigits: {
    fontSize: 58,
    fontWeight: '800',
    color: TEXT,
    letterSpacing: -2,
    lineHeight: 66,
    fontVariant: ['tabular-nums'],
  },
  void: {
    height: 46,
  },
  timerLabel: {
    fontSize: 10,
    color: MUTED,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  timerColon: {
    fontSize: 48,
    fontWeight: '300',
    color: '#BDBDBD',
    marginBottom: 16,
    lineHeight: 56,
  },
  ctaArea: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
  },
  startBtn: {
    height: 54,
    borderRadius: 12,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  runningBtns: {
    flexDirection: 'row',
    gap: 16,
    marginHorizontal: 40,
  },
  pauseBtn: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#4591E8',
    borderWidth: 2,
    borderColor: '#4591E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  endBtn: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#e2e5e6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#d3dbe2',
  },
  endBtnText: { fontSize: 15, fontWeight: '800', color: '#36394a' },
});
