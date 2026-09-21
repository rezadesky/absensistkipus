import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';
import { AppHeader } from '../../components/common/AppHeader';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import {
  CreditCard,
  Building,
  Briefcase,
  ShieldCheck,
  LogOut,
  Phone,
  Mail,
  User as UserIcon,
  Info,
  CheckCircle,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    const executeLogout = async () => {
      setLoggingOut(true);
      try {
        await logout();
      } catch (err) {
        console.warn('Logout error:', err);
      } finally {
        setLoggingOut(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Apakah Anda yakin ingin keluar dari akun ini?');
      if (confirmed) {
        await executeLogout();
      }
      return;
    }

    Alert.alert(
      'Konfirmasi Keluar',
      'Apakah Anda yakin ingin keluar dari akun ini? Sesi login Anda akan dihapus dengan aman.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: executeLogout,
        },
      ]
    );
  };

  // Convert role identifier to user-friendly title
  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'dosen':
        return 'Dosen Fungsional';
      case 'tendik':
        return 'Tenaga Kependidikan';
      case 'pimpinan':
        return 'Pimpinan Institusi';
      case 'admin':
        return 'Administrator';
      default:
        return role ? role.toUpperCase() : '-';
    }
  };

  // User initials
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Profil Pengguna"
        subtitle="Informasi akun dan data kepegawaian"
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
        {/* 1. Profile Header Card */}
        <AppCard style={styles.profileHeaderCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Pegawai'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{getRoleDisplayName(user?.role)}</Text>
          </View>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </AppCard>

        {/* 2. Employee Functional Details Card */}
        <AppCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Data Kepegawaian Fungsional</Text>

          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <CreditCard size={18} color={COLORS.primary} />
            </View>
            <View style={styles.detailTextCol}>
              <Text style={styles.detailLabel}>NIP / NIDN</Text>
              <Text style={styles.detailValue}>
                {user?.employee?.employee_number || '-'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <Building size={18} color={COLORS.primary} />
            </View>
            <View style={styles.detailTextCol}>
              <Text style={styles.detailLabel}>Unit / Bagian</Text>
              <Text style={styles.detailValue}>
                {user?.employee?.department || '-'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <Briefcase size={18} color={COLORS.primary} />
            </View>
            <View style={styles.detailTextCol}>
              <Text style={styles.detailLabel}>Jabatan Fungsional</Text>
              <Text style={styles.detailValue}>
                {user?.employee?.position || '-'}
              </Text>
            </View>
          </View>

          {user?.employee?.phone ? (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <View style={styles.iconCircle}>
                  <Phone size={18} color={COLORS.primary} />
                </View>
                <View style={styles.detailTextCol}>
                  <Text style={styles.detailLabel}>Nomor Kontak</Text>
                  <Text style={styles.detailValue}>{user.employee.phone}</Text>
                </View>
              </View>
            </>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <ShieldCheck size={18} color={COLORS.primary} />
            </View>
            <View style={styles.detailTextCol}>
              <Text style={styles.detailLabel}>Status Akun</Text>
              <View style={styles.statusRow}>
                <CheckCircle size={14} color={COLORS.success} />
                <Text style={styles.statusValueText}>
                  {user?.status === 'active' ? 'Aktif Terdaftar' : 'Non-Aktif'}
                </Text>
              </View>
            </View>
          </View>
        </AppCard>

        {/* 3. Application System Information */}
        <AppCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Informasi Aplikasi</Text>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Sistem</Text>
            <Text style={styles.appInfoValue}>Presensi Fungsional STKIP</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Versi Rilis</Text>
            <Text style={styles.appInfoValue}>1.0.0 (Expo React Native)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Pengembang</Text>
            <Text style={styles.appInfoValue}>Reza Saputra Desky</Text>
          </View>
        </AppCard>

        {/* 4. Logout Action */}
        <AppButton
          title="Keluar dari Akun"
          variant="danger"
          loading={loggingOut}
          icon={<LogOut size={18} color="#FFFFFF" />}
          onPress={handleLogout}
          style={styles.logoutBtn}
        />
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
  profileHeaderCard: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.secondary,
    textAlign: 'center',
  },
  roleBadge: {
    backgroundColor: COLORS.primaryBg,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginVertical: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  sectionCard: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: 4,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailTextCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusValueText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.successDark,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.xs,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  appInfoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  appInfoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  logoutBtn: {
    marginTop: SPACING.xs,
  },
});
