import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { leadershipApi } from '../../api/leadership';
import { LeaveRequest, PaginationMeta } from '../../types';
import { COLORS, FONTS, RADIUS, SPACING } from '../../utils/theme';
import { AppHeader } from '../../components/common/AppHeader';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState, EmptyState, ErrorState } from '../../components/common/FeedbackStates';
import {
  Calendar,
  Paperclip,
  X,
  Eye,
  Clock,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react-native';

export default function LeadershipMonitoringScreen() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'menunggu' | 'disetujui' | 'ditolak'>('all');

  // Detail Modal State
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchLeaves = useCallback(
    async (pageNumber = 1) => {
      setError(null);
      if (pageNumber === 1) setLoading(true);

      try {
        const res = await leadershipApi.getLeaves({
          page: pageNumber,
          per_page: 15,
          status: activeFilter === 'all' ? undefined : activeFilter,
        });

        if (res.success && res.data) {
          setLeaves(res.data.items || []);
          setPagination(res.data.pagination);
        }
      } catch (err: any) {
        if (err.response?.status === 403) {
          setError('Akses ditolak. Anda tidak memiliki izin pimpinan.');
        } else if (!err.response) {
          setError('Periksa koneksi internet Anda.');
        } else {
          setError('Gagal memuat permohonan izin staf.');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeFilter]
  );

  useEffect(() => {
    fetchLeaves(1);
  }, [fetchLeaves]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeaves(1);
  };

  const openDetailModal = async (item: LeaveRequest) => {
    setSelectedLeave(item);
    setModalVisible(true);
    try {
      const res = await leadershipApi.getLeaveDetail(item.id);
      if (res.success && res.data) {
        setSelectedLeave(res.data);
      }
    } catch {}
  };

  const renderLeaveItem = ({ item }: { item: LeaveRequest }) => (
    <AppCard style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.user?.name || 'Pegawai'}</Text>
          <Text style={styles.userRoleUnit}>
            {item.user?.role?.toUpperCase()} • {item.user?.employee?.department || 'Unit STKIP'}
          </Text>
        </View>
        <StatusBadge status={item.status} size="sm" />
      </View>

      <View style={styles.divider} />

      <View style={styles.cardMetaRow}>
        <View style={styles.metaItem}>
          <Calendar size={13} color={COLORS.secondary} />
          <Text style={styles.metaText}>
            {item.start_date} s/d {item.end_date}
          </Text>
        </View>
        <View style={styles.leaveTypeTag}>
          <Text style={styles.leaveTypeTagText}>{item.type.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.reasonText} numberOfLines={2}>
        "{item.reason}"
      </Text>

      <TouchableOpacity
        style={styles.detailBtn}
        onPress={() => openDetailModal(item)}
        activeOpacity={0.8}
      >
        <Eye size={14} color={COLORS.primary} />
        <Text style={styles.detailBtnText}>Lihat Rincian Pengajuan</Text>
      </TouchableOpacity>
    </AppCard>
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title="Monitoring Izin"
        subtitle="Daftar pengajuan izin staf & dosen STKIP"
      />

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {(['all', 'menunggu', 'disetujui', 'ditolak'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              activeFilter === filter && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === filter && styles.filterChipTextActive,
              ]}
            >
              {filter === 'all'
                ? 'Semua'
                : filter === 'menunggu'
                ? 'Menunggu'
                : filter === 'disetujui'
                ? 'Disetujui'
                : 'Ditolak'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <LoadingState message="Memuat seluruh data pengajuan izin..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchLeaves(1)} />
      ) : (
        <FlatList
          data={leaves}
          renderItem={renderLeaveItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="Tidak Ada Data Izin"
              description="Tidak ditemukan data permohonan izin pada kategori ini."
            />
          }
        />
      )}

      {/* Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Detail Permohonan Izin</Text>
                <Text style={styles.modalSubtitle}>Hak Akses Eksekutif: Read-Only</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedLeave && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalBody}
              >
                <View style={styles.modalTopStatus}>
                  <StatusBadge status={selectedLeave.status} />
                  <Text style={styles.modalCreatedAt}>
                    Diajukan:{' '}
                    {new Date(selectedLeave.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </View>

                {/* Pemohon Info */}
                <View style={styles.sectionBox}>
                  <Text style={styles.sectionBoxTitle}>Identitas Pemohon</Text>
                  <Text style={styles.sectionValueBold}>{selectedLeave.user?.name}</Text>
                  <Text style={styles.sectionValueSub}>
                    NIP: {selectedLeave.user?.employee?.employee_number || '-'}
                  </Text>
                  <Text style={styles.sectionValueSub}>
                    Unit: {selectedLeave.user?.employee?.department || '-'}
                  </Text>
                  <Text style={styles.sectionValueSub}>
                    Posisi: {selectedLeave.user?.employee?.position || selectedLeave.user?.role?.toUpperCase()}
                  </Text>
                </View>

                {/* Izin Details */}
                <View style={styles.sectionBox}>
                  <Text style={styles.sectionBoxTitle}>Rincian Izin</Text>
                  <Text style={styles.sectionValueSub}>
                    Jenis Izin:{' '}
                    <Text style={{ fontWeight: '700', color: COLORS.secondary }}>
                      {selectedLeave.type.toUpperCase()}
                    </Text>
                  </Text>
                  <Text style={styles.sectionValueSub}>
                    Rentang Tanggal:{' '}
                    <Text style={{ fontWeight: '700', color: COLORS.secondary }}>
                      {selectedLeave.start_date} s/d {selectedLeave.end_date}
                    </Text>
                  </Text>
                  <Text style={styles.sectionBoxSubtitle}>Alasan / Keterangan:</Text>
                  <Text style={styles.reasonFullText}>{selectedLeave.reason}</Text>
                </View>

                {/* Rejection Note if any */}
                {selectedLeave.review_note && selectedLeave.status === 'ditolak' && (
                  <View
                    style={[
                      styles.sectionBox,
                      { backgroundColor: COLORS.dangerLight, borderColor: COLORS.dangerBorder },
                    ]}
                  >
                    <View style={styles.rejectionHeaderRow}>
                      <AlertCircle size={16} color={COLORS.danger} />
                      <Text style={[styles.sectionBoxTitle, { color: COLORS.danger, marginBottom: 0 }]}>
                        Catatan Penolakan Admin
                      </Text>
                    </View>
                    <Text style={[styles.reasonFullText, { color: COLORS.danger, marginTop: 4 }]}>
                      {selectedLeave.review_note}
                    </Text>
                  </View>
                )}

                {/* Attachment notice */}
                {selectedLeave.attachment_url || selectedLeave.attachment ? (
                  <TouchableOpacity
                    style={styles.attachmentNotice}
                    onPress={() => {
                      if (selectedLeave.attachment_url) {
                        Linking.openURL(selectedLeave.attachment_url);
                      } else {
                        Alert.alert('Lampiran', 'Berkas dokumen tersimpan di server.');
                      }
                    }}
                  >
                    <Paperclip size={16} color={COLORS.primary} />
                    <Text style={styles.attachmentNoticeText}>
                      Buka Dokumen Lampiran Pemohon
                    </Text>
                    <ExternalLink size={14} color={COLORS.primary} />
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.noAttachmentText}>
                    Tidak ada dokumen lampiran yang diunggah pemohon.
                  </Text>
                )}

                <AppButton
                  title="Tutup Rincian"
                  variant="outline"
                  onPress={() => setModalVisible(false)}
                  style={{ marginTop: SPACING.md }}
                />
              </ScrollView>
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
    gap: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
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
  listContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  card: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text,
  },
  userRoleUnit: {
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
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.secondary,
  },
  leaveTypeTag: {
    backgroundColor: COLORS.primaryBg,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: RADIUS.xs,
  },
  leaveTypeTagText: {
    fontFamily: FONTS.bold,
    fontSize: 10.5,
    color: COLORS.primaryDark,
  },
  reasonText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: COLORS.cardMuted,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
    color: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 16,
    color: COLORS.secondary,
  },
  modalSubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  modalBody: {
    gap: SPACING.md,
    paddingBottom: SPACING.md,
  },
  modalTopStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalCreatedAt: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  sectionBox: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionBoxTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 11.5,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sectionBoxSubtitle: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    marginBottom: 2,
  },
  sectionValueBold: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text,
  },
  sectionValueSub: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  reasonFullText: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: COLORS.text,
    lineHeight: 18,
    marginTop: 2,
  },
  rejectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attachmentNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryBg,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  attachmentNoticeText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.primaryDark,
    flex: 1,
    marginHorizontal: 8,
  },
  noAttachmentText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});
