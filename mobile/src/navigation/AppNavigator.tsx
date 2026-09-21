import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { Colors, Typography } from '../utils/theme';

// Auth Screen
import { LoginScreen } from '../screens/auth/LoginScreen';

// Staff Screens
import { StaffDashboardScreen } from '../screens/staff/StaffDashboardScreen';
import AttendanceScreen from '../screens/staff/AttendanceScreen';
import LeaveScreen from '../screens/staff/LeaveScreen';
import HistoryScreen from '../screens/staff/HistoryScreen';
import ProfileScreen from '../screens/staff/ProfileScreen';

// Leadership Screens
import LeadershipDashboardScreen from '../screens/leadership/LeadershipDashboardScreen';
import LeadershipAttendanceScreen from '../screens/leadership/LeadershipAttendanceScreen';
import LeadershipMonitoringScreen from '../screens/leadership/LeadershipMonitoringScreen';
import LeadershipReportScreen from '../screens/leadership/LeadershipReportScreen';

// Icons
import { 
  LayoutDashboard, 
  Clock, 
  CalendarClock, 
  History, 
  User, 
  ShieldCheck,
  FileSearch,
  FileBarChart
} from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Staff (Dosen / Tendik) Tab Navigator
function StaffTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: Platform.OS === 'android' ? 66 : 60,
          paddingBottom: Platform.OS === 'android' ? 10 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="StaffDashboardTab"
        component={StaffDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="AttendanceTab"
        component={AttendanceScreen}
        options={{
          tabBarLabel: 'Absensi',
          tabBarIcon: ({ color, size }) => <Clock size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="LeaveTab"
        component={LeaveScreen}
        options={{
          tabBarLabel: 'Izin',
          tabBarIcon: ({ color, size }) => <CalendarClock size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'Riwayat',
          tabBarIcon: ({ color, size }) => <History size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => <User size={20} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Leadership (Pimpinan) Tab Navigator
function LeadershipTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: Platform.OS === 'android' ? 66 : 60,
          paddingBottom: Platform.OS === 'android' ? 10 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="LeadershipDashboardTab"
        component={LeadershipDashboardScreen}
        options={{
          tabBarLabel: 'Beranda',
          tabBarIcon: ({ color, size }) => <ShieldCheck size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="LeadershipAttendanceTab"
        component={LeadershipAttendanceScreen}
        options={{
          tabBarLabel: 'Absensi',
          tabBarIcon: ({ color, size }) => <Clock size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="LeadershipLeaveTab"
        component={LeadershipMonitoringScreen}
        options={{
          tabBarLabel: 'Izin',
          tabBarIcon: ({ color, size }) => <FileSearch size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="LeadershipReportTab"
        component={LeadershipReportScreen}
        options={{
          tabBarLabel: 'Laporan',
          tabBarIcon: ({ color, size }) => <FileBarChart size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="LeadershipProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => <User size={20} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Memuat Sistem Presensi STKIP...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // Unauthenticated Stack
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : user.role === 'pimpinan' ? (
        // Leadership App Stack
        <Stack.Screen name="LeadershipApp" component={LeadershipTabNavigator} />
      ) : (
        // Staff App Stack (Dosen & Tendik)
        <Stack.Screen name="StaffApp" component={StaffTabNavigator} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    gap: 12,
  },
  loadingText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
