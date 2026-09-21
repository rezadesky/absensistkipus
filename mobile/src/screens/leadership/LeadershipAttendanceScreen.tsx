import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { leadershipApi, LeadershipAttendanceItem, LeadershipAttendanceFilterParams } from '../../api/leadership';
import { PaginationMeta } from '../../types';
import { COLORS, FONTS, RADIUS, SPACING } from '../../utils/theme';
import { AppHeader } from '../../components/common/AppHeader';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState, EmptyState, ErrorState } from '../../components/common/FeedbackStates';
import {
  Calendar,
  Clock,
  Filter,
  Eye,
  X,
  User as UserIcon,
  Building,
  Briefcase,
  ShieldCheck,
} from 'lucide-react-native';

export default function LeadershipAttendanceScreen() {
  const [items, setItems] = useState<LeadershipAttendanceItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [roleFilter, setRoleFilter] = useState<'all' | 'dosen' | 'tendik'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'hadir' | 'izin' | 'tidak_hadir'>('all');

  // Detail Modal state
  const [selectedItem, setSelectedItem] = useState<LeadershipAttendanceItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const fetchAttendance = useCallback(
    async (pageNumber = 1, isRefresh = false) => {
      setError(null);
      if (pageNumber === 1 && !isRefresh) {
        setLoading(true);
      } else if (pageNumber > 1) {
        setLoadingMore(true);
      }

      try {
        const params: LeadershipAttendanceFilterParams = {
          page: pageNumber,
          per_page: 15,
          role: roleFilter === 'all' ? undefined : roleFilter,
          status: statusFilter === 'all' ? undefined : statusFilter,
        };

        const res = await leadershipApi.getAttendanceHistory(params);
        if (res.success && res.data) {
          const newItems = res.data.items || [];
          if (pageNumber === 1) {
            setItems(newItems);
          } else {
            setItems((prev) => {
              const existingIds = new Set(prev.map((i) => i.id));
              const unique = newItems.filter((i) => !existingIds.has(i.id));
              return [...prev, ...unique];
            });
          }
          setPagination(res.data.pagination);
        }
      } catch (err: any) {
        if (err.response?.status === 403) {
          setError('Akses ditolak. Anda tidak memiliki izin pimpinan.');
        } else if (!err.response) {
          setError('Periksa koneksi internet Anda.');
        } else {
          setError('Gagal memuat data monitoring absensi.');
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [roleFilter, statusFilter]
  );

  useEffect(() => {
    fetchAttendance(1);
  }, [fetchAttendance]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAttendance(1, true);
  };

  const handleLoadMore = () => {
    if (
      !loadingMore &&
      !loading &&
      pagination &&
      pagination.current_page < pagination.last_page
    ) {
      fetchAttendance(pagination.current_page + 1);
    }
  };

  const openDetail = (item: LeadershipAttendanceItem) => {
    setSelectedItem(item);
    setDetailModalVisible(true);
  };

  const renderItem = ({ item }: { item: LeadershipAttendanceItem }) => {
    const formattedDate = new Date(item.attendance_date).toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const checkInText = item.check_in_time
      ? `${item.check_in_time.substring(0, 5)} WIB`
      : item.check_in
      ? `${item.check_in.substring(11, 16)} WIB`
      : '-';

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => openDetail(item)}
      >
        <AppCard style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userSub}>
                {item.role.toUpperCase()} • NIP: {item.nip || '-'}
              </Text>
            </View>
            <StatusBadge status={item.status} size="sm" />
          </View>

          <View style={styles.divider} />

          <View style={styles.cardBottomRow}>
            <View style={styles.dateMeta}>
              <Calendar size={13} color={COLORS.secondary} />
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
            <View style={styles.timeMeta}>
              <Clock size={13} color={COLORS.primary} />
              <Text style={styles.timeText}>{checkInText}</Text>
            </View>
          </View>
        </AppCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Monitoring Absensi"
        subtitle="Log kehadiran fungsional seluruh staf STKIP"
      />

      {/* Role Filter Chips */}
      <View style={styles.filterBar}>
        <Text style={styles.filterLabel}>Role:</Text>
        {(['all', 'dosen', 'tendik'] as const).map((r) => (
          <TouchableOpacity
            key={r}
            style={[
              styles.filterChip,
              roleFilter === r && styles.filterChipActive,
            ]}
            onPress={() => setRoleFilter(r)}
          >
            <Text
              style={[
                styles.filterChipText,
                roleFilter === r && styles.filterChipTextActive,
              ]}
            >
              {r === 'all' ? 'Semua' : r === 'dosen' ? 'Dosen' : 'Tendik'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Status Filter Chips */}
      <View style={styles.statusFilterBar}>
        {(['all', 'hadir', 'izin', 'tidak_hadir'] as const).map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.statusChip,
              statusFilter === s && styles.statusChipActive,
            ]}
            onPress={() => setStatusFilter(s)}
          >
            <Text
              style={[
                styles.statusChipText,
                statusFilter === s && styles.statusChipTextActive,
              ]}
            >
              {s === 'all'
                ? 'Semua Status'
                : s === 'hadir'
                ? 'Hadir'
                : s === 'izin'
                ? 'Izin'
                : 'Tidak Hadir'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <LoadingState message="Memuat log absensi institusi..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchAttendance(1)} />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="Belum Ada Data Absensi"
              description="Tidak ditemukan catatan log presensi pada filter ini."
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.footerLoaderText}>Memuat data berikutnya...</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* RECORD DETAIL MODAL */}
      <Modal
        visible={detailModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rincian Absensi Pegawai</Text>
              <TouchableOpacity
                onPress={() => setDetailModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <View style={styles.modalBody}>
                <View style={styles.modalStatusRow}>
                  <StatusBadge status={selectedItem.status} />
                  <Text style={styles.modalRawDate}>{selectedItem.attendance_date}</Text>
                </View>

                <View style={styles.detailItemBox}>
                  <Text style={styles.detailBoxLabel}>Nama Pegawai</Text>
                  <Text style={styles.detailBoxValue}>{selectedItem.name}</Text>
                </View>

                <View style={styles.detailItemBox}>
                  <Text style={styles.detailBoxLabel}>NIP / NIDN</Text>
                  <Text style={styles.detailBoxValue}>{selectedItem.nip || '-'}</Text>
                </View>

                <View style={styles.detailItemBox}>
                  <Text style={styles.detailBoxLabel}>Unit Kerja / Bagian</Text>
                  <Text style={styles.detailBoxValue}>{selectedItem.unit || '-'}</Text>
                </View>

                <View style={styles.detailItemBox}>
                  <Text style={styles.detailBoxLabel}>Waktu Masuk Tercatat</Text>
                  <Text style={styles.detailBoxValue}>
                    {selectedItem.check_in_time || selectedItem.check_in || '-'}
                  </Text>
                </View>

                {selectedItem.notes ? (
                  <View style={styles.detailItemBox}>
                    <Text style={styles.detailBoxLabel}>Catatan</Text>
                    <Text style={styles.detailBoxValue}>{selectedItem.notes}</Text>
                  </View>
                ) : null}

                <AppButton
                  title="Tutup"
                  variant="outline"
                  onPress={() => setDetailModalVisible(false)}
                  style={{ marginTop: SPACING.md }}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.card,
    gap: SPACING.xs,
  },
  filterLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardMuted,
  },
  filterChipActive: {
    backgroundColor: COLORS.secondary,
  },
  filterChipText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
  },
  statusFilterBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.card,
    gap: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statusChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryBg,
  },
  statusChipText: {
    fontFamily: FONTS.medium,
    fontSize: 10.5,
    color: COLORS.textSecondary,
  },
  statusChipTextActive: {
    color: COLORS.primaryDark,
    fontFamily: FONTS.bold,
  },
  listContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  card: {
    padding: SPACING.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    color: COLORS.text,
  },
  userSub: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: COLORS.secondary,
  },
  timeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
    color: COLORS.primaryDark,
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  footerLoaderText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 15,
    color: COLORS.secondary,
  },
  modalBody: {
    gap: SPACING.sm,
  },
  modalStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalRawDate: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  detailItemBox: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailBoxLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  detailBoxValue: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: 2,
  },
});
