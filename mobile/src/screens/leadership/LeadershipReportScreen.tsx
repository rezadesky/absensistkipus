import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { leadershipApi, LeadershipSummaryResult } from '../../api/leadership';
import { COLORS, FONTS, RADIUS, SPACING } from '../../utils/theme';
import { AppHeader } from '../../components/common/AppHeader';
import { AppCard } from '../../components/common/AppCard';
import { LoadingState, ErrorState } from '../../components/common/FeedbackStates';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CheckCircle,
  FileClock,
  PieChart,
  Users,
  ShieldCheck,
} from 'lucide-react-native';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export default function LeadershipReportScreen() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [summary, setSummary] = useState<LeadershipSummaryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setError(null);
    try {
      const res = await leadershipApi.getAttendanceSummary(selectedMonth, selectedYear);
      if (res.success && res.data) {
        setSummary(res.data);
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Akses ditolak. Anda tidak memiliki izin pimpinan.');
      } else if (!err.response) {
        setError('Periksa koneksi internet Anda.');
      } else {
        setError('Gagal memuat rekapitulasi laporan absensi.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSummary();
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  // Calculate percentages based on real records
  const totalRecord = summary?.total_record || 0;
  const totalHadir = summary?.total_hadir || 0;
  const totalIzin = summary?.total_izin || 0;

  const hadirPercentage = totalRecord > 0 ? Math.round((totalHadir / totalRecord) * 100) : 0;
  const izinPercentage = totalRecord > 0 ? Math.round((totalIzin / totalRecord) * 100) : 0;

  if (loading) {
    return <LoadingState message="Memuat rekap laporan institusi..." />;
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Laporan Eksekutif"
        subtitle="Ringkasan evaluasi kehadiran fungsional bulanan"
      />

      {/* Month Selector Filter */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={handlePrevMonth}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={18} color={COLORS.secondary} />
        </TouchableOpacity>

        <View style={styles.monthDisplay}>
          <Calendar size={15} color={COLORS.primary} />
          <Text style={styles.monthText}>
            {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.navButton}
          onPress={handleNextMonth}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronRight size={18} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <ErrorState message={error} onRetry={fetchSummary} />
        ) : (
          <>
            {/* Percentage Overview Hero Card */}
            <AppCard style={styles.heroCard}>
              <View style={styles.heroBadge}>
                <TrendingUp size={13} color={COLORS.primaryDark} />
                <Text style={styles.heroBadgeText}>Tingkat Kehadiran Institusi</Text>
              </View>

              <Text style={styles.percentageBig}>{hadirPercentage}%</Text>
              <Text style={styles.percentageSub}>
                Rasio kehadiran resmi fungsional dosen & tendik pada {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
              </Text>

              {/* Progress bar visualizer */}
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarHadir,
                    { width: `${Math.min(100, Math.max(0, hadirPercentage))}%` },
                  ]}
                />
                <View
                  style={[
                    styles.progressBarIzin,
                    { width: `${Math.min(100, Math.max(0, izinPercentage))}%` },
                  ]}
                />
              </View>
            </AppCard>

            {/* Metrics Breakdown Grid */}
            <Text style={styles.sectionTitle}>Akumulasi Presensi Periode Ini</Text>

            <View style={styles.statsGrid}>
              <View style={[styles.statBox, { borderLeftColor: COLORS.success }]}>
                <View style={styles.iconCircleSuccess}>
                  <CheckCircle size={18} color={COLORS.success} />
                </View>
                <Text style={styles.statNumber}>{totalHadir}</Text>
                <Text style={styles.statLabel}>Total Hadir (Log)</Text>
              </View>

              <View style={[styles.statBox, { borderLeftColor: COLORS.primary }]}>
                <View style={styles.iconCircleIzin}>
                  <FileClock size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.statNumber}>{totalIzin}</Text>
                <Text style={styles.statLabel}>Total Izin (Log)</Text>
              </View>

              <View style={[styles.statBox, { borderLeftColor: COLORS.secondary }]}>
                <View style={styles.iconCircleTotal}>
                  <PieChart size={18} color={COLORS.secondary} />
                </View>
                <Text style={styles.statNumber}>{totalRecord}</Text>
                <Text style={styles.statLabel}>Total Akumulasi</Text>
              </View>

              <View style={[styles.statBox, { borderLeftColor: COLORS.info }]}>
                <View style={styles.iconCircleStaff}>
                  <Users size={18} color={COLORS.info} />
                </View>
                <Text style={styles.statNumber}>
                  {summary ? `${summary.active_employees.total}` : '-'}
                </Text>
                <Text style={styles.statLabel}>Pegawai Aktif</Text>
              </View>
            </View>

            {/* Active Staff Composition */}
            <AppCard style={styles.staffCard}>
              <Text style={styles.staffTitle}>Sumber Daya Fungsional Tercatat</Text>
              
              <View style={styles.staffRow}>
                <Text style={styles.staffLabel}>Dosen Aktif</Text>
                <Text style={styles.staffValue}>
                  {summary?.active_employees.dosen ?? '-'} Orang
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.staffRow}>
                <Text style={styles.staffLabel}>Tenaga Kependidikan (Tendik)</Text>
                <Text style={styles.staffValue}>
                  {summary?.active_employees.tendik ?? '-'} Orang
                </Text>
              </View>
            </AppCard>

            <View style={styles.noticeBox}>
              <ShieldCheck size={16} color={COLORS.secondary} />
              <Text style={styles.noticeText}>
                Laporan ini dihitung secara realtime dari database presensi resmi institusi STKIP Usman Safri.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  navButton: {
    padding: SPACING.xs,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.cardMuted,
  },
  monthDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  monthText: {
    fontFamily: FONTS.extraBold,
    fontSize: 14,
    color: COLORS.secondary,
  },
  scrollContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  heroCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryBg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xs,
  },
  heroBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.primaryDark,
  },
  percentageBig: {
    fontFamily: FONTS.black,
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.secondary,
    letterSpacing: -1,
  },
  percentageSub: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 16,
    maxWidth: '90%',
  },
  progressBarBg: {
    flexDirection: 'row',
    height: 8,
    width: '100%',
    backgroundColor: COLORS.cardMuted,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
    overflow: 'hidden',
  },
  progressBarHadir: {
    backgroundColor: COLORS.success,
    height: '100%',
  },
  progressBarIzin: {
    backgroundColor: COLORS.primary,
    height: '100%',
  },
  sectionTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: SPACING.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statBox: {
    width: '48.5%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3.5,
    padding: SPACING.md,
    alignItems: 'center',
  },
  iconCircleSuccess: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconCircleIzin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconCircleTotal: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconCircleStaff: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.infoLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statNumber: {
    fontFamily: FONTS.extraBold,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  statLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  staffCard: {
    padding: SPACING.md,
  },
  staffTitle: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  staffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  staffLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  staffValue: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 4,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.cardMuted,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noticeText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
});
