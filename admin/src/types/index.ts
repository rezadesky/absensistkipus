export type UserRole = 'dosen' | 'tendik' | 'pimpinan' | 'admin';
export type UserStatus = 'active' | 'inactive';

export type AttendanceStatus =
  | 'hadir'
  | 'izin'
  | 'belum_absen'
  | 'tidak_hadir'
  | 'menunggu'
  | 'disetujui'
  | 'ditolak';

export interface EmployeeProfile {
  id?: number;
  employee_number?: string;
  employee_type?: string;
  position?: string;
  department?: string;
  phone?: string;
}

export interface User {
  id: number | string;
  name: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  employee?: EmployeeProfile | null;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceItem {
  id: string;
  attendance_id?: number | null;
  user_id?: number | string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    employee?: EmployeeProfile | null;
  } | null;
  name?: string;
  nip?: string;
  role?: string;
  unit?: string;
  position?: string;
  attendance_date?: string;
  check_in?: string | null;
  checkInTime?: string | null;
  check_in_time?: string | null;
  status: AttendanceStatus;
  notes?: string | null;
}

export interface DashboardStats {
  total_dosen: number;
  total_tendik: number;
  hadir_hari_ini: number;
  belum_absen: number;
  izin: number;
}

export interface LeaveRequestItem {
  id: number;
  user_id: number;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    employee?: EmployeeProfile | null;
  } | null;
  name?: string;
  role?: string;
  unit?: string;
  type: 'izin' | 'sakit' | 'dinas' | 'keperluan_keluarga' | 'lainnya';
  start_date: string;
  end_date: string;
  reason: string;
  attachment?: string | null;
  attachment_url?: string | null;
  status: 'menunggu' | 'disetujui' | 'ditolak';
  reviewed_by?: number | null;
  reviewer?: {
    id: number;
    name: string;
    role?: string;
  } | null;
  reviewed_at?: string | null;
  review_note?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from?: number;
  to?: number;
  has_more_pages?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface WorkDayConfig {
  id: number;
  day: string;
  is_active: boolean;
}

export interface HolidayConfig {
  id: number;
  date: string;
  name: string;
  description?: string | null;
}
