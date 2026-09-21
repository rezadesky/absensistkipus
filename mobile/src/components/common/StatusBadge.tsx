import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../../utils/theme';
import type { AttendanceStatus, LeaveStatus } from '../../types';

interface StatusBadgeProps {
  status: AttendanceStatus | LeaveStatus | string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  style,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'hadir':
      case 'disetujui':
        return {
          label: status === 'hadir' ? 'Hadir' : 'Disetujui',
          bg: COLORS.successLight,
          border: COLORS.successBorder,
          text: COLORS.successDark,
        };
      case 'izin':
        return {
          label: 'Izin',
          bg: COLORS.primaryBg,
          border: COLORS.primaryLight,
          text: COLORS.primaryDark,
        };
      case 'menunggu':
        return {
          label: 'Menunggu',
          bg: COLORS.warningLight,
          border: COLORS.warningBorder,
          text: '#B45309',
        };
      case 'ditolak':
      case 'tidak_hadir':
        return {
          label: status === 'ditolak' ? 'Ditolak' : 'Tidak Hadir',
          bg: COLORS.dangerLight,
          border: COLORS.dangerBorder,
          text: COLORS.danger,
        };
      case 'belum_absen':
      default:
        return {
          label: 'Belum Absen',
          bg: COLORS.cardMuted,
          border: COLORS.border,
          text: COLORS.textSecondary,
        };
    }
  };

  const config = getStatusConfig();
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          paddingVertical: isSmall ? 3 : 5,
          paddingHorizontal: isSmall ? 8 : SPACING.md,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: config.text,
            fontSize: isSmall ? 10.5 : 12,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: FONTS.bold,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
