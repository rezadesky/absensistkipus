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

export type LeaveType = 'izin' | 'sakit' | 'dinas' | 'keperluan_keluarga' | 'lainnya';
export type LeaveStatus = 'menunggu' | 'disetujui' | 'ditolak';

export interface EmployeeProfile {
  id?: number;
  employee_number?: string;
  employee_type?: string;
  position?: string;
  department?: string;
  phone?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  employee?: EmployeeProfile | null;
  created_at?: string;
}

export interface AttendanceRecord {
  id: number;
  user_id: number;
  attendance_date: string;
  check_in: string | null;
  check_in_time?: string | null;
  status: AttendanceStatus;
  notes?: string | null;
  created_at?: string;
}

export interface TodayAttendanceInfo {
  attendance: AttendanceRecord | null;
  has_checked_in: boolean;
  server_date: string;
  server_time: string;
  day_name: string;
  is_work_day: boolean;
  is_holiday: boolean;
  holiday_name: string | null;
}

export interface LeaveRequest {
  id: number;
  user_id: number;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    employee?: EmployeeProfile | null;
  } | null;
  type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  attachment?: string | null;
  attachment_url?: string | null;
  status: LeaveStatus;
  reviewed_by?: number | null;
  reviewer?: {
    id: number;
    name: string;
  } | null;
  reviewed_at?: string | null;
  review_note?: string | null;
  created_at: string;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  has_more_pages?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}
