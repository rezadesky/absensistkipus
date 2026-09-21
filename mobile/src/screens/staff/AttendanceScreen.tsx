import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../hooks/useAttendance';
import { AttendanceStatusCard } from '../../components/attendance/AttendanceStatusCard';
import { AppHeader } from '../../components/common/AppHeader';
import { AppCard } from '../../components/common/AppCard';
import { ErrorState } from '../../components/common/FeedbackStates';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';
import {
  Building2,
  Calendar,
  CreditCard,
  Briefcase,
  ShieldCheck,
  Clock,
} from 'lucide-react-native';

export default function AttendanceScreen() {
  const { user } = useAuth();
  const {
    todayInfo,
    loadingToday,
    isLoading,
    checkingIn,
    error,
    refreshAll,
    confirmAndCheckIn,
  } = useAttendance();

  return (
    <View style={styles.container}>
      <AppHeader
        title="Absensi Masuk"
        subtitle="Presensi Kehadiran Fungsional Terpadu"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
        {/* Server Clock / Date Banner */}
        <View style={styles.clockCard}>
          <View style={styles.clockIconRow}>
            <Calendar size={18} color={COLORS.primary} />
            <Text style={styles.clockDate}>
              {todayInfo?.server_date
                ? `${todayInfo.day_name}, ${todayInfo.server_date}`
                : 'Memuat tanggal server...'}
            </Text>
          </View>
          <Text style={styles.serverTimeDisplay}>
            {todayInfo?.server_time ? `${todayInfo.server_time} WIB` : '--:-- WIB'}
          </Text>
          <View style={styles.institutionTag}>
            <Building2 size={13} color={COLORS.textSecondary} />
            <Text style={styles.institutionText}>Kampus STKIP Usman Safri</Text>
          </View>
        </View>

        {error ? (
          <ErrorState message={error} onRetry={refreshAll} />
        ) : (
          <>
            {/* Reusable Attendance Status Card */}
            <AttendanceStatusCard
              todayInfo={todayInfo}
              loading={loadingToday}
              checkingIn={checkingIn}
              onCheckInPress={confirmAndCheckIn}
            />

            {/* Employee Functional Details Card */}
            <AppCard style={styles.infoCard}>
              <Text style={styles.cardSectionTitle}>Data Pegawai Fungsional</Text>
              
              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <CreditCard size={15} color={COLORS.secondary} />
                </View>
                <View style={styles.infoTextCol}>
                  <Text style={styles.infoLabel}>Nama Lengkap</Text>
                  <Text style={styles.infoValue}>{user?.name}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <ShieldCheck size={15} color={COLORS.secondary} />
                </View>
                <View style={styles.infoTextCol}>
                  <Text style={styles.infoLabel}>NIP / NIDN</Text>
                  <Text style={styles.infoValue}>
                    {user?.employee?.employee_number || '-'}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Building2 size={15} color={COLORS.secondary} />
                </View>
                <View style={styles.infoTextCol}>
                  <Text style={styles.infoLabel}>Unit / Bagian</Text>
                  <Text style={styles.infoValue}>
                    {user?.employee?.department || '-'}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Briefcase size={15} color={COLORS.secondary} />
                </View>
                <View style={styles.infoTextCol}>
                  <Text style={styles.infoLabel}>Jabatan</Text>
                  <Text style={styles.infoValue}>
                    {user?.employee?.position || user?.role?.toUpperCase()}
                  </Text>
                </View>
              </View>
            </AppCard>
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
    paddingBottom: SPACING.xxxl,
  },
  clockCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  clockIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  clockDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  serverTimeDisplay: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.secondary,
    letterSpacing: 1,
    marginVertical: 4,
  },
  institutionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.cardMuted,
    paddingVertical: 4,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.xs,
  },
  institutionText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  infoCard: {
    padding: SPACING.lg,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: 2,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.xs,
  },
});
