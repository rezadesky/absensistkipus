import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  Linking,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLeave } from '../../hooks/useLeave';
import { LeaveRequest, LeaveType } from '../../types';
import { showAppAlert } from '../../utils/alert';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';
import { AppHeader } from '../../components/common/AppHeader';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState, EmptyState, ErrorState } from '../../components/common/FeedbackStates';
import {
  FilePlus,
  Calendar,
  Paperclip,
  X,
  AlertCircle,
  Eye,
  FileText,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react-native';

const LEAVE_TYPES: { key: LeaveType; label: string; desc: string }[] = [
  { key: 'izin', label: 'Izin', desc: 'Keperluan pribadi/umum' },
  { key: 'sakit', label: 'Sakit', desc: 'Disertai surat dokter jika ada' },
  { key: 'dinas', label: 'Dinas Luar', desc: 'Tugas institusi/pelatihan' },
  { key: 'keperluan_keluarga', label: 'Keperluan Keluarga', desc: 'Urusan keluarga mendesak' },
  { key: 'lainnya', label: 'Lainnya', desc: 'Keterangan khusus lainnya' },
];

export default function LeaveScreen() {
  const {
    leaves,
    pagination,
    loading,
    submitting,
    error,
    fetchLeaves,
    fetchLeaveDetail,
    createLeave,
  } = useLeave();

  // Create Modal state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<LeaveType>('izin');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState<{
    uri: string;
    name: string;
    type: string;
    size?: number;
  } | null>(null);

  // Detail Modal state
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<LeaveRequest | null>(null);

  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'menunggu' | 'disetujui' | 'ditolak'>('all');

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaves(1, statusFilter === 'all' ? undefined : statusFilter);
    setRefreshing(false);
  };

  const handleFilterChange = (filter: 'all' | 'menunggu' | 'disetujui' | 'ditolak') => {
    setStatusFilter(filter);
    fetchLeaves(1, filter === 'all' ? undefined : filter);
  };

  // Document / Image Pickers
  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        // Validate max 5MB
        if (file.size && file.size > 5 * 1024 * 1024) {
          showAppAlert('Ukuran Terlalu Besar', 'Maksimal ukuran lampiran adalah 5MB.');
          return;
        }
        setAttachment({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
          size: file.size,
        });
      }
    } catch (err) {
      console.warn('Document picker error:', err);
    }
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showAppAlert('Izin Dibutuhkan', 'Mohon izinkan akses galeri untuk mengunggah foto surat dokter/lampiran.');
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        const filename = asset.fileName || `lampiran_${Date.now()}.jpg`;
        setAttachment({
          uri: asset.uri,
          name: filename,
          type: asset.mimeType || 'image/jpeg',
          size: asset.fileSize,
        });
      }
    } catch (err) {
      console.warn('Image picker error:', err);
    }
  };

  const handleOpenCreateModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedType('izin');
    setStartDate(today);
    setEndDate(today);
    setReason('');
    setAttachment(null);
    setCreateModalVisible(true);
  };

  const handleSubmit = () => {
    // Form validation
    if (!startDate || !endDate || !reason.trim()) {
      showAppAlert('Form Belum Lengkap', 'Harap isi semua kolom wajib (Tanggal Mulai, Tanggal Selesai, dan Alasan).');
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      showAppAlert('Format Tanggal Salah', 'Format tanggal harus YYYY-MM-DD (contoh: 2026-09-25)');
      return;
    }

    if (endDate < startDate) {
      showAppAlert('Tanggal Tidak Valid', 'Tanggal selesai tidak boleh sebelum tanggal mulai.');
      return;
    }

    // Confirmation before submit
    showAppAlert(
      'Konfirmasi Pengajuan Izin',
      `Apakah Anda yakin ingin mengajukan izin ${selectedType.toUpperCase()} dari ${startDate} sampai ${endDate}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Kirim Pengajuan',
          onPress: async () => {
            const success = await createLeave({
              type: selectedType,
              start_date: startDate,
              end_date: endDate,
              reason: reason.trim(),
              attachmentFile: attachment,
            });

            if (success) {
              setCreateModalVisible(false);
            }
          },
        },
      ]
    );
  };

  const handleOpenDetail = async (item: LeaveRequest) => {
    setSelectedDetail(item);
    setDetailModalVisible(true);
    setDetailLoading(true);
    const detail = await fetchLeaveDetail(item.id);
    if (detail) {
      setSelectedDetail(detail);
    }
    setDetailLoading(false);
  };

  const renderLeaveItem = ({ item }: { item: LeaveRequest }) => {
    const getLeaveLabel = (type: LeaveType | string) => {
      const found = LEAVE_TYPES.find((t) => t.key === type);
      return found ? found.label : type.toUpperCase();
    };

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => handleOpenDetail(item)}
      >
        <AppCard style={styles.leaveCard}>
          <View style={styles.cardTopRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{getLeaveLabel(item.type)}</Text>
            </View>
            <StatusBadge status={item.status} size="sm" />
          </View>

          <View style={styles.dateRow}>
            <Calendar size={14} color={COLORS.secondary} />
            <Text style={styles.dateRangeText}>
              {item.start_date} s/d {item.end_date}
            </Text>
          </View>

          <Text style={styles.reasonText} numberOfLines={2}>
            {item.reason}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.createdAtBox}>
              <Clock size={12} color={COLORS.textMuted} />
              <Text style={styles.createdAtText}>
                Diajukan:{' '}
                {new Date(item.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>

            {item.attachment ? (
              <View style={styles.attachmentChip}>
                <Paperclip size={12} color={COLORS.primary} />
                <Text style={styles.attachmentChipText}>Ada Dokumen</Text>
              </View>
            ) : null}
          </View>
        </AppCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Pengajuan Izin"
        subtitle="Kelola dan pantau permohonan izin fungsional"
        rightAction={
          <TouchableOpacity
            style={styles.headerAddBtn}
            onPress={handleOpenCreateModal}
            activeOpacity={0.8}
          >
            <FilePlus size={16} color="#FFFFFF" />
            <Text style={styles.headerAddBtnText}>Ajukan Izin</Text>
          </TouchableOpacity>
        }
      />

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        {(['all', 'menunggu', 'disetujui', 'ditolak'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              statusFilter === filter && styles.filterTabActive,
            ]}
            onPress={() => handleFilterChange(filter)}
          >
            <Text
              style={[
                styles.filterTabText,
                statusFilter === filter && styles.filterTabTextActive,
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

      {/* Content State Handling */}
      {loading ? (
        <LoadingState message="Memuat daftar pengajuan izin..." />
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
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="Belum Ada Pengajuan Izin"
              description="Anda belum memiliki data permohonan izin pada status ini."
            />
          }
        />
      )}

      {/* MODAL 1: FORM AJUKAN IZIN */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Form Pengajuan Izin</Text>
                <Text style={styles.modalSubtitle}>Isi rincian permohonan ketidakhadiran</Text>
              </View>
              <TouchableOpacity
                onPress={() => setCreateModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formContent}
            >
              {/* 1. Jenis Izin */}
              <Text style={styles.fieldLabel}>Jenis Izin *</Text>
              <View style={styles.typeGrid}>
                {LEAVE_TYPES.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.typeOptionCard,
                      selectedType === item.key && styles.typeOptionCardActive,
                    ]}
                    onPress={() => setSelectedType(item.key)}
                  >
                    <Text
                      style={[
                        styles.typeOptionTitle,
                        selectedType === item.key && styles.typeOptionTitleActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        styles.typeOptionDesc,
                        selectedType === item.key && styles.typeOptionDescActive,
                      ]}
                    >
                      {item.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 2. Rentang Tanggal */}
              <View style={styles.dateInputsRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Tanggal Mulai *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={COLORS.textMuted}
                    value={startDate}
                    onChangeText={setStartDate}
                  />
                </View>
                <View style={{ width: SPACING.md }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Tanggal Selesai *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={COLORS.textMuted}
                    value={endDate}
                    onChangeText={setEndDate}
                  />
                </View>
              </View>

              {/* 3. Alasan */}
              <View style={styles.reasonHeaderRow}>
                <Text style={styles.fieldLabel}>Alasan / Keterangan *</Text>
                <Text style={styles.charCount}>{reason.length}/2000</Text>
              </View>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Tuliskan keterangan lengkap alasan permohonan izin Anda..."
                placeholderTextColor={COLORS.textMuted}
                value={reason}
                onChangeText={setReason}
                maxLength={2000}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {/* 4. Lampiran Dokumen */}
              <Text style={styles.fieldLabel}>Lampiran Dokumen (Opsional - PDF/JPG/PNG)</Text>
              {attachment ? (
                <View style={styles.attachmentPreviewBox}>
                  <View style={styles.attachmentPreviewLeft}>
                    <FileText size={20} color={COLORS.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.attachmentName} numberOfLines={1}>
                        {attachment.name}
                      </Text>
                      <Text style={styles.attachmentSize}>
                        {attachment.size
                          ? `${(attachment.size / 1024).toFixed(1)} KB`
                          : 'Dokumen Terpilih'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setAttachment(null)}
                    style={styles.removeFileBtn}
                  >
                    <Trash2 size={16} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.pickerActionsRow}>
                  <TouchableOpacity
                    style={styles.pickerBtn}
                    onPress={pickDocument}
                    activeOpacity={0.7}
                  >
                    <Paperclip size={16} color={COLORS.secondary} />
                    <Text style={styles.pickerBtnText}>Pilih Dokumen PDF</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.pickerBtn}
                    onPress={pickImage}
                    activeOpacity={0.7}
                  >
                    <ImageIcon size={16} color={COLORS.secondary} />
                    <Text style={styles.pickerBtnText}>Pilih Foto / Galeri</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.modalActionButtons}>
                <AppButton
                  title="Batal"
                  variant="outline"
                  onPress={() => setCreateModalVisible(false)}
                  style={{ flex: 1 }}
                />
                <AppButton
                  title={submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
                  onPress={handleSubmit}
                  loading={submitting}
                  style={{ flex: 1.5 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: DETAIL IZIN */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Rincian Pengajuan Izin</Text>
                <Text style={styles.modalSubtitle}>Informasi status dan verifikasi</Text>
              </View>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <X size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedDetail && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.detailScrollBody}
              >
                {/* Status Bar */}
                <View style={styles.detailStatusRow}>
                  <StatusBadge status={selectedDetail.status} />
                  <Text style={styles.detailDateText}>
                    Diajukan:{' '}
                    {new Date(selectedDetail.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </View>

                {/* Main Information Box */}
                <View style={styles.detailSectionBox}>
                  <Text style={styles.sectionHeaderTitle}>Informasi Permohonan</Text>
                  
                  <View style={styles.detailInfoRow}>
                    <Text style={styles.detailLabel}>Jenis Izin:</Text>
                    <Text style={styles.detailValueBold}>
                      {selectedDetail.type.toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.detailInfoRow}>
                    <Text style={styles.detailLabel}>Rentang Tanggal:</Text>
                    <Text style={styles.detailValueBold}>
                      {selectedDetail.start_date} s/d {selectedDetail.end_date}
                    </Text>
                  </View>

                  <Text style={[styles.detailLabel, { marginTop: SPACING.sm }]}>
                    Alasan / Keterangan:
                  </Text>
                  <Text style={styles.reasonDetailText}>{selectedDetail.reason}</Text>
                </View>

                {/* Reviewer / Decision Box */}
                {selectedDetail.status === 'ditolak' && selectedDetail.review_note ? (
                  <View style={styles.rejectionDetailBox}>
                    <View style={styles.rejectionHeaderRow}>
                      <AlertCircle size={18} color={COLORS.danger} />
                      <Text style={styles.rejectionBoxTitle}>Catatan Penolakan</Text>
                    </View>
                    <Text style={styles.rejectionBoxText}>
                      "{selectedDetail.review_note}"
                    </Text>
                    {selectedDetail.reviewer ? (
                      <Text style={styles.reviewerSub}>
                        Diverifikasi oleh: {selectedDetail.reviewer.name}
                      </Text>
                    ) : null}
                  </View>
                ) : selectedDetail.status === 'disetujui' ? (
                  <View style={styles.approvalDetailBox}>
                    <View style={styles.rejectionHeaderRow}>
                      <CheckCircle2 size={18} color={COLORS.successDark} />
                      <Text style={styles.approvalBoxTitle}>Pengajuan Disetujui</Text>
                    </View>
                    <Text style={styles.approvalBoxText}>
                      Izin ini telah resmi disetujui dan dicatat dalam rekapitulasi kehadiran institusi.
                    </Text>
                    {selectedDetail.reviewed_at ? (
                      <Text style={styles.reviewerSub}>
                        Tanggal Disetujui:{' '}
                        {new Date(selectedDetail.reviewed_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Text>
                    ) : null}
                  </View>
                ) : (
                  <View style={styles.pendingDetailBox}>
                    <Clock size={16} color="#B45309" />
                    <Text style={styles.pendingDetailText}>
                      Pengajuan sedang menunggu tinjauan dan verifikasi dari Bagian Kepegawaian.
                    </Text>
                  </View>
                )}

                {/* Attachment Section */}
                {selectedDetail.attachment_url || selectedDetail.attachment ? (
                  <View style={styles.attachmentViewBox}>
                    <Text style={styles.sectionHeaderTitle}>Dokumen Lampiran</Text>
                    <TouchableOpacity
                      style={styles.viewAttachmentButton}
                      onPress={() => {
                        if (selectedDetail.attachment_url) {
                          Linking.openURL(selectedDetail.attachment_url);
                        } else {
                          showAppAlert('Lampiran', 'Berkas lampiran tersimpan di server.');
                        }
                      }}
                    >
                      <Paperclip size={16} color={COLORS.primary} />
                      <Text style={styles.viewAttachmentText}>Buka Berkas Lampiran</Text>
                      <ExternalLink size={14} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                ) : null}

                <AppButton
                  title="Tutup Rincian"
                  variant="outline"
                  onPress={() => setDetailModalVisible(false)}
                  style={{ marginTop: SPACING.lg }}
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
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  headerAddBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.xs,
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.cardMuted,
  },
  filterTabActive: {
    backgroundColor: COLORS.secondary,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
    gap: SPACING.md,
  },
  leaveCard: {
    padding: SPACING.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  typeBadge: {
    backgroundColor: COLORS.infoLight,
    paddingVertical: 3,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.xs,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.info,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  dateRangeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  reasonText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  createdAtBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  createdAtText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryBg,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: RADIUS.xs,
  },
  attachmentChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  // Modal Common
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  modalSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  formContent: {
    paddingVertical: SPACING.md,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 6,
    marginTop: SPACING.sm,
  },
  typeGrid: {
    gap: 6,
    marginBottom: SPACING.xs,
  },
  typeOptionCard: {
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  typeOptionCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryBg,
  },
  typeOptionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  typeOptionTitleActive: {
    color: COLORS.primaryDark,
  },
  typeOptionDesc: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  typeOptionDescActive: {
    color: COLORS.primaryDark,
  },
  dateInputsRow: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.text,
  },
  reasonHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  textArea: {
    height: 85,
    paddingTop: 10,
  },
  attachmentPreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryBg,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: 2,
  },
  attachmentPreviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  attachmentName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  attachmentSize: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  removeFileBtn: {
    padding: SPACING.xs,
  },
  pickerActionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: 2,
  },
  pickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  pickerBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  // Detail Modal Specific
  detailScrollBody: {
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  detailStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailDateText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  detailSectionBox: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  detailInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  detailValueBold: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  reasonDetailText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
    marginTop: 4,
  },
  rejectionDetailBox: {
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  rejectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  rejectionBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.danger,
  },
  rejectionBoxText: {
    fontSize: 12,
    color: COLORS.danger,
    lineHeight: 18,
  },
  reviewerSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
  },
  approvalDetailBox: {
    backgroundColor: COLORS.successLight,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  approvalBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.successDark,
  },
  approvalBoxText: {
    fontSize: 12,
    color: COLORS.successDark,
    lineHeight: 18,
  },
  pendingDetailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.warningLight,
    borderWidth: 1,
    borderColor: COLORS.warningBorder,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  pendingDetailText: {
    fontSize: 11,
    color: '#92400E',
    flex: 1,
    lineHeight: 16,
    fontWeight: '500',
  },
  attachmentViewBox: {
    marginTop: SPACING.xs,
  },
  viewAttachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryBg,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  viewAttachmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    flex: 1,
  },
});
