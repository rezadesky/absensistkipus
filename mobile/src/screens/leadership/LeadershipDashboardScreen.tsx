import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { leadershipApi, LeadershipDashboardStats, LeadershipAttendanceItem } from '../../api/leadership';
import { COLORS, FONTS, RADIUS, SPACING } from '../../utils/theme';
import { AppHeader } from '../../components/common/AppHeader';
import { AppCard } from '../../components/common/AppCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState, ErrorState } from '../../components/common/FeedbackStates';
import {
  Building2,
  Users,
  CheckCircle,
  FileClock,
  Clock,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react-native';

export default function LeadershipDashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [stats, setStats] = useState<LeadershipDashboardStats | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<LeadershipAttendanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setError(null);
    try {
      const res = await leadershipApi.getDashboard();
      if (res.success && res.data) {
        setStats(res.data.stats);
        setTodayAttendance(res.data.attendance_today || []);
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Akses ditolak. Anda tidak memiliki izin pimpinan.');
      } else if (!err.response) {
        setError('Periksa koneksi internet Anda.');
      } else {
        setError('Gagal memuat data dashboard pimpinan.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (loading) {
    return <LoadingState message="Memuat portal eksekutif pimpinan..." />;
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Dashboard Pimpinan"
        subtitle="Sistem Monitoring & Evaluasi Fungsional"
      />

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
        {/* Executive Banner Card */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerBadge}>
            <Building2 size={13} color="#FED7AA" />
            <Text style={styles.bannerBadgeText}>Portal Eksekutif STKIP</Text>
          </View>
          <Text style={styles.welcomeSubtitle}>Selamat datang,</Text>
          <Text style={styles.executiveName} numberOfLines={1}>
            {user?.name || 'Pimpinan Institusi'}
          </Text>
          <Text style={styles.dateLabel}>{currentDateFormatted}</Text>
        </View>

        {error ? (
          <ErrorState message={error} onRetry={fetchDashboardData} />
        ) : (
          <>
            {/* Realtime Attendance Metrics Grid */}
            <Text style={styles.sectionHeading}>Ringkasan Kehadiran Hari Ini</Text>
            
            <View style={styles.statsGrid}>
              <View style={[styles.statBox, { borderLeftColor: COLORS.success }]}>
                <View style={styles.iconCircleSuccess}>
                  <CheckCircle size={18} color={COLORS.success} />
                </View>
                <Text style={styles.statNumber}>
                  {stats ? `${stats.hadir_hari_ini}` : '-'}
                </Text>
                <Text style={styles.statTitle}>Hadir Hari Ini</Text>
              </View>

              <View style={[styles.statBox, { borderLeftColor: COLORS.primary }]}>
                <View style={styles.iconCircleIzin}>
                  <FileClock size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.statNumber}>
                  {stats ? `${stats.izin}` : '-'}
                </Text>
                <Text style={styles.statTitle}>Izin / Dinas</Text>
              </View>

              <View style={[styles.statBox, { borderLeftColor: COLORS.textMuted }]}>
                <View style={styles.iconCirclePending}>
                  <Clock size={18} color={COLORS.textSecondary} />
                </View>
                <Text style={styles.statNumber}>
                  {stats ? `${stats.belum_absen}` : '-'}
                </Text>
                <Text style={styles.statTitle}>Belum Absen</Text>
              </View>

              <View style={[styles.statBox, { borderLeftColor: COLORS.info }]}>
                <View style={styles.iconCircleStaff}>
                  <Users size={18} color={COLORS.info} />
                </View>
                <Text style={styles.statNumber}>
                  {stats ? `${stats.total_dosen + stats.total_tendik}` : '-'}
                </Text>
                <Text style={styles.statTitle}>Total Pegawai</Text>
              </View>
            </View>

            {/* Total breakdown: Dosen vs Tendik */}
            <AppCard style={styles.breakdownCard}>
              <Text style={styles.breakdownTitle}>Komposisi Sumber Daya Fungsional</Text>
              <View style={styles.breakdownRow}>
                <View style={styles.breakdownCol}>
                  <Text style={styles.breakdownLabel}>Dosen Aktif</Text>
                  <Text style={styles.breakdownValue}>{stats?.total_dosen ?? '-'} Orang</Text>
                </View>
                <View style={styles.breakdownDivider} />
                <View style={styles.breakdownCol}>
                  <Text style={styles.breakdownLabel}>Tendik Aktif</Text>
                  <Text style={styles.breakdownValue}>{stats?.total_tendik ?? '-'} Orang</Text>
                </View>
              </View>
            </AppCard>

            {/* Today Live Activity Preview */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Aktivitas Masuk Hari Ini</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AttendanceTab')}
                style={styles.seeAllBtn}
              >
                <Text style={styles.seeAllText}>Lihat Monitoring</Text>
                <ChevronRight size={14} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <AppCard style={styles.listCard}>
              {todayAttendance.length === 0 ? (
                <View style={styles.emptyCardBox}>
                  <Clock size={28} color={COLORS.textMuted} />
                  <Text style={styles.emptyTitle}>Belum ada aktivitas presensi hari ini.</Text>
                </View>
              ) : (
                todayAttendance.slice(0, 5).map((item) => (
                  <View key={item.id} style={styles.attendanceRowItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemMeta}>
                        {item.role} • {item.unit}
                      </Text>
                    </View>
                    <View style={styles.itemRightCol}>
                      <StatusBadge status={item.status} size="sm" />
                      {item.check_in || item.check_in_time ? (
                        <Text style={styles.itemTime}>
                          {item.check_in || item.check_in_time}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))
              )}
            </AppCard>

            {/* Read-Only Notice */}
            <View style={styles.noticeBox}>
              <ShieldCheck size={16} color={COLORS.secondary} />
              <Text style={styles.noticeText}>
                Hak Akses Eksekutif: Data ini bersifat Read-Only untuk keperluan pengawasan pimpinan institusi.
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
  scrollContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  bannerCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  bannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  bannerBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#FED7AA',
  },
  welcomeSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#94A3B8',
  },
  executiveName: {
    fontFamily: FONTS.extraBold,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  dateLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: '#CBD5E1',
    marginTop: 6,
  },
  sectionHeading: {
    fontFamily: FONTS.extraBold,
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: SPACING.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.primary,
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
  iconCirclePending: {
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
  statTitle: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  breakdownCard: {
    padding: SPACING.md,
  },
  breakdownTitle: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownCol: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.borderLight,
  },
  breakdownLabel: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  breakdownValue: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
  listCard: {
    padding: 0,
    overflow: 'hidden',
  },
  emptyCardBox: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  attendanceRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  itemName: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  itemMeta: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  itemRightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  itemTime: {
    fontFamily: FONTS.medium,
    fontSize: 10.5,
    color: COLORS.textMuted,
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
    marginTop: SPACING.xs,
  },
  noticeText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
});
