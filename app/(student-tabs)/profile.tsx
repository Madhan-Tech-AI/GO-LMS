import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/constants/theme';
import { User, Mail, GraduationCap, Building, Users, Trophy } from 'lucide-react-native';

interface Student {
  studentName: string;
  registerNumber: string;
  email: string;
  department: string;
  yearSemester: string;
  followedFaculty: string[];
  completedAssignments: string[];
  quizResults: any[];
}

export default function StudentProfile() {
  const [student, setStudent] = useState<Student | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      const currentUserData = await AsyncStorage.getItem('currentUser');
      if (currentUserData) {
        setStudent(JSON.parse(currentUserData));
      }
    } catch (error) {
      console.error('Failed to load student data:', error);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('currentUser');
    router.replace('/landing');
  };

  if (!student) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <User size={48} color={colors.secondary.main} />
        </View>

        <Text style={styles.studentName}>{student.studentName}</Text>
        <Text style={styles.registerNumber}>Reg No: {student.registerNumber}</Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Mail size={20} color={colors.text.secondary} />
            <Text style={styles.infoText}>{student.email}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Building size={20} color={colors.text.secondary} />
            <Text style={styles.infoText}>{student.department}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <GraduationCap size={20} color={colors.text.secondary} />
            <Text style={styles.infoText}>{student.yearSemester}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Users size={24} color={colors.secondary.main} />
            <Text style={styles.statNumber}>{student.followedFaculty.length}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          
          <View style={styles.statCard}>
            <Trophy size={24} color={colors.success.main} />
            <Text style={styles.statNumber}>{student.completedAssignments.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/ai-chatbot')}
          >
            <Text style={styles.actionButtonText}>AI Assistant</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/calendar')}
          >
            <Text style={styles.actionButtonText}>Calendar</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  profileCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    backgroundColor: colors.background.secondary,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  studentName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  registerNumber: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  infoContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.lg,
    minWidth: 80,
  },
  statNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.secondary.main,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  logoutButton: {
    backgroundColor: colors.error.main,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});