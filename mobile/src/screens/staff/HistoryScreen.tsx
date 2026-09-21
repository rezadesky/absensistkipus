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
} from 'react-native';
import { attendanceApi } from '../../api/attendance';
import { AttendanceRecord, PaginationMeta } from '../../types';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';
import { AppHeader } from '../../components/common/AppHeader';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState, EmptyState, ErrorState } from '../../components/common/FeedbackStates';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  X,
  FileCheck,
  CheckCircle2,
} from 'lucide-react-native';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const DAY_NAMES: Record<number, string> = {
  0: 'Minggu',
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
};

export default function HistoryScreen() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detail Modal state
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Helper for error parsing
  const parseErrorMessage = (err: any): string => {
    if (!err.response) return 'Periksa koneksi internet Anda.';
    if (err.response.status === 401) return 'Sesi login telah berakhir.';
    return 'Gagal memuat riwayat absensi.';
  };

  const fetchHistory = useCallback(
    async (pageNumber = 1, isRefresh = false) => {
      setError(null);
      if (pageNumber === 1 && !isRefresh) {
        setLoading(true);
      } else if (pageNumber > 1) {
        setLoadingMore(true);
      }

      try {
        const res = await attendanceApi.getHistory(pageNumber, 15, selectedMonth, selectedYear);
        if (res.success && res.data) {
          const newItems = res.data.items || [];
          if (pageNumber === 1) {
            setRecords(newItems);
          } else {
            // Prevent duplicate records by id
            setRecords((prev) => {
              const existingIds = new Set(prev.map((r) => r.id));
              const uniqueNewItems = newItems.filter((r) => !existingIds.has(r.id));
              return [...prev, ...uniqueNewItems];
            });
          }
          setPagination(res.data.pagination);
        }
      } catch (err: any) {
        setError(parseErrorMessage(err));
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [selectedMonth, selectedYear]
  );

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory(1, true);
  };

  const handleLoadMore = () => {
    if (
      !loadingMore &&
      !loading &&
      pagination &&
      pagination.current_page < pagination.last_page
    ) {
      fetchHistory(pagination.current_page + 1);
    }
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

  const openDetail = (item: AttendanceRecord) => {
    setSelectedRecord(item);
    setDetailModalVisible(true);
  };

  const renderHistoryItem = ({ item }: { item: AttendanceRecord }) => {
    const dateObj = new Date(item.attendance_date);
    const dayName = DAY_NAMES[dateObj.getDay()] || 'Hari';
    const formattedDate = dateObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const checkInFormatted = item.check_in_time
      ? `${item.check_in_time.substring(0, 5)} WIB`
      : item.check_in
      ? `${item.check_in.substring(11, 16)} WIB`
      : '-';

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => openDetail(item)}
      >
        <AppCard style={styles.historyCard}>
          <View style={styles.cardHeader}>
            <View style={styles.dateCol}>
              <Text style={styles.dayNameText}>{dayName}</Text>
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
            <StatusBadge status={item.status} size="sm" />
          </View>

          <View style={styles.divider} />

          <View style={styles.cardFooterRow}>
            <View style={styles.checkInTimeBox}>
              <Clock size={14} color={COLORS.secondary} />
              <Text style={styles.timeLabel}>Waktu Masuk:</Text>
              <Text style={styles.timeValue}>{checkInFormatted}</Text>
            </View>

            <View style={styles.detailLink}>
              <Text style={styles.detailLinkText}>Rincian</Text>
              <Eye size={12} color={COLORS.primary} />
            </View>
          </View>
        </AppCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Riwayat Presensi"
        subtitle="Log kehadiran dan rekapitulasi fungsional"
      />

      {/* Month & Year Navigation Filter */}
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

      {/* Summary Chips */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryChip}>
          <Text style={styles.summaryChipLabel}>Total Kehadiran Bulan Ini:</Text>
          <Text style={styles.summaryChipValue}>
            {pagination ? `${pagination.total} Hari` : `${records.length} Hari`}
          </Text>
        </View>
      </View>

      {/* Main Content Area */}
      {loading ? (
        <LoadingState message="Memuat riwayat absensi..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchHistory(1)} />
      ) : (
        <FlatList
          data={records}
          renderItem={renderHistoryItem}
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
              title="Belum Ada Riwayat Absensi"
              description={`Tidak ditemukan catatan presensi pada ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}. Riwayat absensi Anda akan muncul setelah melakukan presensi.`}
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
              <Text style={styles.modalTitle}>Detail Record Presensi</Text>
              <TouchableOpacity
                onPress={() => setDetailModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedRecord && (
              <View style={styles.modalBody}>
                <View style={styles.modalStatusRow}>
                  <StatusBadge status={selectedRecord.status} />
                  <Text style={styles.modalRawDate}>{selectedRecord.attendance_date}</Text>
                </View>

                <View style={styles.detailItemBox}>
                  <Text style={styles.detailBoxLabel}>Hari & Tanggal</Text>
                  <Text style={styles.detailBoxValue}>
                    {new Date(selectedRecord.attendance_date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </View>

                <View style={styles.detailItemBox}>
                  <Text style={styles.detailBoxLabel}>Waktu Masuk Tercatat</Text>
                  <Text style={styles.detailBoxValue}>
                    {selectedRecord.check_in_time
                      ? `${selectedRecord.check_in_time.substring(0, 5)} WIB`
                      : selectedRecord.check_in
                      ? `${selectedRecord.check_in.substring(11, 16)} WIB`
                      : '-'}
                  </Text>
                </View>

                {selectedRecord.created_at ? (
                  <View style={styles.detailItemBox}>
                    <Text style={styles.detailBoxLabel}>Waktu Validasi Server</Text>
                    <Text style={styles.detailBoxValue}>
                      {new Date(selectedRecord.created_at).toLocaleString('id-ID')}
                    </Text>
                  </View>
                ) : null}

                {selectedRecord.notes ? (
                  <View style={styles.detailItemBox}>
                    <Text style={styles.detailBoxLabel}>Catatan Tambahan</Text>
                    <Text style={styles.detailBoxValue}>{selectedRecord.notes}</Text>
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
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  summaryBar: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryChipLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  summaryChipValue: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  listContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  historyCard: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateCol: {
    gap: 2,
  },
  dayNameText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkInTimeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  timeValue: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  footerLoaderText: {
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
    fontSize: 15,
    fontWeight: '800',
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
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  detailBoxValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
    marginTop: 2,
  },
});
