import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../hooks/useAttendance';

import { AttendanceStatusCard } from '../../components/attendance/AttendanceStatusCard';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ErrorState } from '../../components/common/FeedbackStates';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';
import type { AttendanceRecord } from '../../types';
import {
  CalendarCheck,
  Calendar,
  History,
  Building,
  CheckCircle,
  FileText,
  XCircle,
  ChevronRight,
  Clock,
} from 'lucide-react-native';

export const StaffDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    todayInfo,
    recentHistory,
    monthlyStats,
    loadingToday,
    loadingHistory,
    isLoading,
    checkingIn,
    error,
    refreshAll,
    confirmAndCheckIn,
  } = useAttendance();

  const renderRecentItem = (item: AttendanceRecord) => {
    const formattedDate = new Date(item.attendance_date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const timeFormatted = item.check_in_time
      ? `${item.check_in_time.substring(0, 5)} WIB`
      : item.check_in
      ? `${item.check_in.substring(11, 16)} WIB`
      : '-';

    return (
      <View key={item.id} style={styles.recentItem}>
        <View style={styles.recentLeft}>
          <View style={styles.recentIconCircle}>
            <Clock size={16} color={COLORS.secondary} />
          </View>
          <View>
            <Text style={styles.recentDate}>{formattedDate}</Text>
            <Text style={styles.recentTime}>{timeFormatted}</Text>
          </View>
        </View>
        <StatusBadge status={item.status} size="sm" />
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: Math.max(insets.top, 16) + SPACING.sm,
          paddingBottom: Math.max(insets.bottom, 16) + SPACING.xxl,
        },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refreshAll}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Hero */}
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText}>Selamat datang,</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name || 'Pegawai'}
            </Text>
            <View style={styles.roleRow}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
              </View>
              {user?.employee?.department ? (
                <View style={styles.unitBadge}>
                  <Building size={12} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.unitText}>{user.employee.department}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Server Date & Time display */}
        <View style={styles.serverDateRow}>
          <Calendar size={14} color="rgba(255,255,255,0.8)" />
          <Text style={styles.serverDateText}>
            {todayInfo?.server_date || new Date().toISOString().split('T')[0]} •{' '}
            {todayInfo?.day_name ? todayInfo.day_name.toUpperCase() : 'HARI INI'}
          </Text>
        </View>
      </View>

      {/* Error state if server call fails */}
      {error ? (
        <ErrorState message={error} onRetry={refreshAll} />
      ) : (
        <>
          {/* 2. Today Attendance Status Card */}
          <AttendanceStatusCard
            todayInfo={todayInfo}
            loading={loadingToday}
            checkingIn={checkingIn}
            onCheckInPress={confirmAndCheckIn}
          />

          {/* 3. Monthly Attendance Statistics */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Statistik Bulan Ini</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { borderLeftColor: COLORS.success }]}>
              <View style={styles.statIconBadgeSuccess}>
                <CheckCircle size={16} color={COLORS.success} />
              </View>
              <Text style={styles.statValue}>
                {monthlyStats !== null ? `${monthlyStats.hadir}` : '-'}
              </Text>
              <Text style={styles.statLabel}>Hadir</Text>
            </View>

            <View style={[styles.statBox, { borderLeftColor: COLORS.primary }]}>
              <View style={styles.statIconBadgeIzin}>
                <FileText size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>
                {monthlyStats !== null ? `${monthlyStats.izin}` : '-'}
              </Text>
              <Text style={styles.statLabel}>Izin</Text>
            </View>

            <View style={[styles.statBox, { borderLeftColor: COLORS.danger }]}>
              <View style={styles.statIconBadgeDanger}>
                <XCircle size={16} color={COLORS.danger} />
              </View>
              <Text style={styles.statValue}>
                {monthlyStats !== null ? `${monthlyStats.tidakHadir}` : '-'}
              </Text>
              <Text style={styles.statLabel}>Tidak Hadir</Text>
            </View>
          </View>

          {/* 4. Recent Attendance Section */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Absensi Terbaru</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('HistoryTab')}
              style={styles.seeAllBtn}
            >
              <Text style={styles.seeAllText}>Lihat Semua</Text>
              <ChevronRight size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <AppCard style={styles.recentCard}>
            {loadingHistory ? (
              <View style={{ padding: SPACING.md }}>
                <Text style={styles.loadingText}>Memuat riwayat...</Text>
              </View>
            ) : recentHistory.length === 0 ? (
              <View style={styles.emptyRecentBox}>
                <History size={28} color={COLORS.textMuted} />
                <Text style={styles.emptyRecentTitle}>Belum ada riwayat absensi.</Text>
                <Text style={styles.emptyRecentSub}>
                  Data kehadiran Anda akan tercatat setelah melakukan absensi.
                </Text>
              </View>
            ) : (
              recentHistory.slice(0, 4).map(renderRecentItem)
            )}
          </AppCard>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  heroCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textWhite,
    marginVertical: 2,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textWhite,
  },
  unitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  unitText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  serverDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  serverDateText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3.5,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statIconBadgeSuccess: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statIconBadgeIzin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statIconBadgeDanger: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  recentCard: {
    padding: 0,
    overflow: 'hidden',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  recentIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentDate: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  recentTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  emptyRecentBox: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRecentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
    marginTop: SPACING.sm,
  },
  emptyRecentSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
