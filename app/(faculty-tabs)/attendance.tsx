import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '@/constants/theme';
import { Users, CircleCheck as CheckCircle, Circle as XCircle, Calendar } from 'lucide-react-native';

interface Student {
  registerNumber: string;
  studentName: string;
  department: string;
  isPresent?: boolean;
}

export default function Attendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toLocaleDateString());

  useEffect(() => {
    loadFollowingStudents();
  }, []);

  const loadFollowingStudents = async () => {
    try {
      const currentUserData = await AsyncStorage.getItem('currentUser');
      if (currentUserData) {
        const faculty = JSON.parse(currentUserData);
        
        // Load all students who follow this faculty
        const keys = await AsyncStorage.getAllKeys();
        const studentKeys = keys.filter(key => key.startsWith('student_'));
        const studentData = await AsyncStorage.multiGet(studentKeys);
        
        const followingStudents = studentData
          .map(([key, value]) => JSON.parse(value || '{}'))
          .filter(student => student.followedFaculty.includes(faculty.staffId))
          .map(student => ({
            registerNumber: student.registerNumber,
            studentName: student.studentName,
            department: student.department,
            isPresent: false,
          }));
        
        setStudents(followingStudents);
      }
    } catch (error) {
      console.error('Failed to load students:', error);
    }
  };

  const toggleAttendance = (registerNumber: string) => {
    setStudents(prev =>
      prev.map(student =>
        student.registerNumber === registerNumber
          ? { ...student, isPresent: !student.isPresent }
          : student
      )
    );
  };

  const saveAttendance = async () => {
    try {
      const attendanceRecord = {
        date: attendanceDate,
        students: students.map(student => ({
          registerNumber: student.registerNumber,
          isPresent: student.isPresent,
        })),
        timestamp: new Date().toISOString(),
      };

      const existingAttendance = await AsyncStorage.getItem('attendance_records');
      const records = existingAttendance ? JSON.parse(existingAttendance) : [];
      records.push(attendanceRecord);

      await AsyncStorage.setItem('attendance_records', JSON.stringify(records));
      Alert.alert('Success', 'Attendance saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save attendance');
    }
  };

  const renderStudent = ({ item }: { item: Student }) => (
    <TouchableOpacity
      style={[styles.studentCard, item.isPresent && styles.presentCard]}
      onPress={() => toggleAttendance(item.registerNumber)}
    >
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.studentName}</Text>
        <Text style={styles.registerNumber}>{item.registerNumber}</Text>
        <Text style={styles.department}>{item.department}</Text>
      </View>
      
      <View style={styles.attendanceStatus}>
        {item.isPresent ? (
          <CheckCircle size={24} color={colors.success.main} />
        ) : (
          <XCircle size={24} color={colors.error.main} />
        )}
        <Text style={[styles.statusText, item.isPresent && styles.presentText]}>
          {item.isPresent ? 'Present' : 'Absent'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const presentCount = students.filter(s => s.isPresent).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
        <View style={styles.dateContainer}>
          <Calendar size={20} color={colors.text.secondary} />
          <Text style={styles.dateText}>{attendanceDate}</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{presentCount}</Text>
          <Text style={styles.summaryLabel}>Present</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{students.length - presentCount}</Text>
          <Text style={styles.summaryLabel}>Absent</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{students.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
      </View>

      {students.length === 0 ? (
        <View style={styles.emptyState}>
          <Users size={48} color={colors.text.secondary} />
          <Text style={styles.emptyStateText}>No students found</Text>
          <Text style={styles.emptyStateSubtext}>
            Students who follow you will appear here
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={students}
            renderItem={renderStudent}
            keyExtractor={(item) => item.registerNumber}
            style={styles.list}
            showsVerticalScrollIndicator={false}
          />
          
          <TouchableOpacity style={styles.saveButton} onPress={saveAttendance}>
            <Text style={styles.saveButtonText}>Save Attendance</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  summaryCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    borderRadius: 12,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  studentCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: colors.error.main,
  },
  presentCard: {
    borderLeftColor: colors.success.main,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  registerNumber: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  department: {
    fontSize: typography.fontSize.sm,
    color: colors.secondary.main,
  },
  attendanceStatus: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    color: colors.error.main,
    marginTop: spacing.xs,
  },
  presentText: {
    color: colors.success.main,
  },
  saveButton: {
    backgroundColor: colors.primary.main,
    marginHorizontal: spacing.lg,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  saveButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyStateText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});