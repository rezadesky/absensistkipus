import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../../utils/theme';
import { AppButton } from '../common/AppButton';
import { StatusBadge } from '../common/StatusBadge';
import { CheckCircle2, Clock, Calendar, AlertTriangle, ShieldCheck } from 'lucide-react-native';
import type { TodayAttendanceInfo } from '../../types';

interface AttendanceStatusCardProps {
  todayInfo: TodayAttendanceInfo | null;
  loading: boolean;
  checkingIn: boolean;
  onCheckInPress: () => void;
}

export const AttendanceStatusCard: React.FC<AttendanceStatusCardProps> = ({
  todayInfo,
  loading,
  checkingIn,
  onCheckInPress,
}) => {
  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.skeletonHeader} />
        <View style={styles.skeletonContent} />
      </View>
    );
  }

  const hasCheckedIn = todayInfo?.has_checked_in || !!todayInfo?.attendance;
  const isHoliday = todayInfo?.is_holiday;
  const isWorkDay = todayInfo?.is_work_day ?? true;

  // Format check in time from server
  const checkInTimeFormatted = todayInfo?.attendance?.check_in_time
    ? `${todayInfo.attendance.check_in_time.substring(0, 5)} WIB`
    : todayInfo?.attendance?.check_in
    ? `${todayInfo.attendance.check_in.substring(11, 16)} WIB`
    : 'Tercatat';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Status Presensi Hari Ini</Text>
          <Text style={styles.cardSubtitle}>
            {todayInfo?.server_date
              ? `${todayInfo.day_name}, ${todayInfo.server_date}`
              : 'Presensi Fungsional STKIP'}
          </Text>
        </View>
        <StatusBadge
          status={
            hasCheckedIn
              ? 'hadir'
              : isHoliday || !isWorkDay
              ? 'tidak_hadir'
              : 'belum_absen'
          }
        />
      </View>

      <View style={styles.content}>
        {hasCheckedIn ? (
          <View style={styles.checkedInBox}>
            <View style={styles.iconCircleSuccess}>
              <CheckCircle2 size={22} color={COLORS.success} />
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.statusTitleSuccess}>Presensi Masuk Tercatat!</Text>
              <Text style={styles.timeLabel}>
                Waktu Masuk:{' '}
                <Text style={styles.timeValue}>{checkInTimeFormatted}</Text>
              </Text>
              <Text style={styles.subtext}>
                Kehadiran fungsional Anda hari ini telah divalidasi oleh server.
              </Text>
            </View>
          </View>
        ) : isHoliday ? (
          <View style={styles.holidayBox}>
            <AlertTriangle size={20} color={COLORS.warning} />
            <View style={styles.infoCol}>
              <Text style={styles.holidayTitle}>Hari Libur Nasional / Institusi</Text>
              <Text style={styles.holidaySub}>
                {todayInfo?.holiday_name || 'Tidak ada jadwal presensi aktif hari ini.'}
              </Text>
            </View>
          </View>
        ) : !isWorkDay ? (
          <View style={styles.holidayBox}>
            <Calendar size={20} color={COLORS.textSecondary} />
            <View style={styles.infoCol}>
              <Text style={styles.nonWorkTitle}>Bukan Hari Kerja Aktif</Text>
              <Text style={styles.holidaySub}>Hari ini adalah akhir pekan / non-aktif.</Text>
            </View>
          </View>
        ) : (
          <View style={styles.notCheckedBox}>
            <View style={styles.iconCirclePending}>
              <Clock size={22} color={COLORS.primary} />
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.statusTitlePending}>Belum Melakukan Absensi</Text>
              <Text style={styles.pendingSub}>
                Silakan tekan tombol di bawah untuk mencatat kehadiran hari ini.
              </Text>
            </View>
          </View>
        )}

        {/* Action Button: Only when not checked in and is a valid work day */}
        {!hasCheckedIn && isWorkDay && !isHoliday && (
          <AppButton
            title="Absen Masuk"
            onPress={onCheckInPress}
            loading={checkingIn}
            size="lg"
            icon={<ShieldCheck size={18} color={COLORS.textWhite} />}
            style={styles.ctaButton}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  cardTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  cardSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  content: {
    paddingTop: SPACING.md,
  },
  checkedInBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.successLight,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'flex-start',
  },
  iconCircleSuccess: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
  },
  notCheckedBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryBg,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'flex-start',
  },
  iconCirclePending: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  holidayBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.warningLight,
    borderWidth: 1,
    borderColor: COLORS.warningBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
  },
  statusTitleSuccess: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.successDark,
  },
  statusTitlePending: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  holidayTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  nonWorkTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  holidaySub: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  timeLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  timeValue: {
    fontFamily: FONTS.bold,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  subtext: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  pendingSub: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    marginTop: SPACING.md,
  },
  skeletonHeader: {
    height: 30,
    backgroundColor: COLORS.cardMuted,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
  },
  skeletonContent: {
    height: 80,
    backgroundColor: COLORS.cardMuted,
    borderRadius: RADIUS.md,
  },
});
