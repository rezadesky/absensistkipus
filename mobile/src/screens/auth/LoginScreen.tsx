import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { AppButton } from '../../components/common/AppButton';
import { COLORS, FONTS, RADIUS, SPACING } from '../../utils/theme';
import { Lock, Mail, ShieldAlert, Sparkles } from 'lucide-react-native';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Perhatian', 'Email dan password wajib diisi.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login(email.trim(), password);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Gagal masuk. Periksa kembali email dan password Anda.';
      setErrorMessage(msg);
      Alert.alert('Gagal Masuk', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero */}
        <View style={styles.heroContainer}>
          <View style={styles.logoBadge}>
            <Image
              source={require('../../../assets/logo.webp')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandTitle}>STKIP USMAN SAFRI</Text>
          <Text style={styles.brandSubtitle}>
            Sistem Absensi Fungsional Dosen & Tendik
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Masuk ke Akun</Text>
          <Text style={styles.formSubtitle}>
            Gunakan akun Dosen, Tendik, atau Pimpinan Anda
          </Text>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <ShieldAlert size={16} color={COLORS.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Institusi</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="nama@stkipusmansafri.ac.id"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          {/* Submit Button */}
          <AppButton
            title="Masuk Sekarang"
            onPress={handleLogin}
            loading={isLoading}
            size="lg"
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondaryDark,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
    paddingVertical: SPACING.xxxl,
  },
  heroContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoBadge: {
    height: 80,
    width: 80,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    padding: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  logoImage: {
    height: '100%',
    width: '100%',
  },
  brandTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textWhite,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.78)',
    marginTop: 4,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  formTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  formSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
    marginBottom: SPACING.lg,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  errorText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.danger,
    flex: 1,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    fontFamily: FONTS.regular,
    flex: 1,
    height: 48,
    fontSize: 13.5,
    color: COLORS.text,
  },
  submitButton: {
    marginTop: SPACING.md,
  },
  helperBox: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: 4,
  },
  helperHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  helperTitle: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1,
  },
  accountLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.textSecondary,
    width: 65,
  },
  accountValue: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    flex: 1,
  },
});
