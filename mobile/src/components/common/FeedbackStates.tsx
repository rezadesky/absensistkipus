import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AlertCircle, Inbox } from 'lucide-react-native';
import { COLORS, SPACING } from '../../utils/theme';
import { AppButton } from './AppButton';

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'Memuat data...',
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={[styles.subtitle, { marginTop: SPACING.md }]}>{message}</Text>
    </View>
  );
};

export const EmptyState: React.FC<{ 
  message?: string; 
  submessage?: string;
  title?: string;
  description?: string;
}> = ({
  message,
  submessage,
  title,
  description,
}) => {
  const displayTitle = title || message || 'Data Tidak Ditemukan';
  const displaySub = description || submessage;

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Inbox size={28} color={COLORS.textMuted} />
      </View>
      <Text style={styles.title}>{displayTitle}</Text>
      {displaySub ? <Text style={styles.subtitle}>{displaySub}</Text> : null}
    </View>
  );
};

export const ErrorState: React.FC<{
  message: string;
  onRetry?: () => void;
}> = ({ message, onRetry }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: COLORS.dangerLight }]}>
        <AlertCircle size={28} color={COLORS.danger} />
      </View>
      <Text style={[styles.title, { color: COLORS.danger }]}>{message}</Text>
      {onRetry ? (
        <AppButton
          title="Coba Lagi"
          onPress={onRetry}
          variant="outline"
          size="sm"
          style={{ marginTop: SPACING.md }}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: COLORS.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
