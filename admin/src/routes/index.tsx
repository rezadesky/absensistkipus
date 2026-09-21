import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MasterUsersPage } from '@/pages/master/MasterUsersPage';
import { AttendanceTodayPage } from '@/pages/attendance/AttendanceTodayPage';
import { AttendanceHistoryPage } from '@/pages/attendance/AttendanceHistoryPage';
import { AttendanceRecapPage } from '@/pages/attendance/AttendanceRecapPage';
import { LeaveAdminPage } from '@/pages/leave/LeaveAdminPage';
import { AttendanceReportPage } from '@/pages/reports/AttendanceReportPage';
import { LeaveReportPage } from '@/pages/reports/LeaveReportPage';
import { SettingsWorkDaysPage } from '@/pages/settings/SettingsWorkDaysPage';
import { SettingsHolidaysPage } from '@/pages/settings/SettingsHolidaysPage';
import { SettingsSystemPage } from '@/pages/settings/SettingsSystemPage';

export const router = createBrowserRouter([
  // Public Login Route
  {
    path: '/login',
    element: <LoginPage />,
  },

  // Protected Admin Routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },

      // MASTER DATA
      {
        path: 'master/dosen',
        element: (
          <MasterUsersPage
            roleKey="dosen"
            title="Data Dosen"
            category="Master Data"
            description="Manajemen data dosen fungsional, NIDN, jabatan fungsional, dan unit prodi."
          />
        ),
      },
      {
        path: 'master/tendik',
        element: (
          <MasterUsersPage
            roleKey="tendik"
            title="Data Tendik"
            category="Master Data"
            description="Manajemen data tenaga kependidikan dan staf administrasi."
          />
        ),
      },
      {
        path: 'master/pimpinan',
        element: (
          <MasterUsersPage
            roleKey="pimpinan"
            title="Data Pimpinan"
            category="Master Data"
            description="Manajemen akun dan hak akses jajaran pimpinan institusi."
          />
        ),
      },
      {
        path: 'master/admin',
        element: (
          <MasterUsersPage
            roleKey="admins"
            title="Data Administrator"
            category="Master Data"
            description="Manajemen akun administrator sistem absensi."
          />
        ),
      },

      // ABSENSI
      {
        path: 'attendance/today',
        element: <AttendanceTodayPage />,
      },
      {
        path: 'attendance/history',
        element: <AttendanceHistoryPage />,
      },
      {
        path: 'attendance/recap',
        element: <AttendanceRecapPage />,
      },

      // IZIN
      {
        path: 'leave',
        element: <LeaveAdminPage />,
      },

      // LAPORAN
      {
        path: 'reports/attendance',
        element: <AttendanceReportPage />,
      },
      {
        path: 'reports/leave',
        element: <LeaveReportPage />,
      },

      // PENGATURAN
      {
        path: 'settings/work-days',
        element: <SettingsWorkDaysPage />,
      },
      {
        path: 'settings/holidays',
        element: <SettingsHolidaysPage />,
      },
      {
        path: 'settings/system',
        element: <SettingsSystemPage />,
      },

      // Fallback
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);
