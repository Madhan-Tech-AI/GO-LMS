import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '@/constants/theme';
import { ClipboardList, Calendar, CircleCheck as CheckCircle, Clock } from 'lucide-react-native';

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  facultyName: string;
  isSubmitted?: boolean;
  facultyId?: string;
}

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const currentUserData = await AsyncStorage.getItem('currentUser');
      if (currentUserData) {
        const student = JSON.parse(currentUserData);
        
        // Load assignments from followed faculty
        const allAssignments = await AsyncStorage.getItem('faculty_assignments');
        if (allAssignments) {
          const assignmentsData = JSON.parse(allAssignments);
          
          // Filter assignments from followed faculty
          const studentAssignments = assignmentsData.filter((assignment: any) =>
            student.followedFaculty.some((facultyId: string) => 
              assignment.facultyId === facultyId
            )
          );
          
          setAssignments(studentAssignments);
        }
      }
    } catch (error) {
      console.error('Failed to load assignments:', error);
    }
  };

  const isOverdue = (dueDate: string) => {
    const due = new Date(dueDate.split('/').reverse().join('-'));
    return due < new Date();
  };

  const getStatusIcon = (assignment: Assignment) => {
    if (assignment.isSubmitted) {
      return <CheckCircle size={20} color={colors.success.main} />;
    }
    if (isOverdue(assignment.dueDate)) {
      return <Clock size={20} color={colors.error.main} />;
    }
    return <Clock size={20} color={colors.warning.main} />;
  };

  const getStatusText = (assignment: Assignment) => {
    if (assignment.isSubmitted) return 'Submitted';
    if (isOverdue(assignment.dueDate)) return 'Overdue';
    return 'Pending';
  };

  const getStatusColor = (assignment: Assignment) => {
    if (assignment.isSubmitted) return colors.success.main;
    if (isOverdue(assignment.dueDate)) return colors.error.main;
    return colors.warning.main;
  };

  const submitAssignment = async (assignmentId: string) => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (!userData) return;
      const student = JSON.parse(userData);
      const submissionsRaw = await AsyncStorage.getItem('assignment_submissions');
      const submissions = submissionsRaw ? JSON.parse(submissionsRaw) : [];
      const existing = submissions.find((s: any) => s.assignmentId === assignmentId && s.registerNumber === student.registerNumber);
      if (existing) return;
      submissions.push({
        id: Date.now().toString(),
        assignmentId,
        registerNumber: student.registerNumber,
        studentName: student.studentName,
        submittedAt: new Date().toISOString(),
        grade: null,
      });
      await AsyncStorage.setItem('assignment_submissions', JSON.stringify(submissions));
      // increment faculty assignment submissions count
      const allAssignmentsRaw = await AsyncStorage.getItem('faculty_assignments');
      if (allAssignmentsRaw) {
        const list = JSON.parse(allAssignmentsRaw);
        const idx = list.findIndex((a: any) => a.id === assignmentId);
        if (idx >= 0) {
          list[idx].submissions = (list[idx].submissions || 0) + 1;
          await AsyncStorage.setItem('faculty_assignments', JSON.stringify(list));
        }
      }
      // mark local state as submitted
      setAssignments(prev => prev.map(a => a.id === assignmentId ? { ...a, isSubmitted: true } : a));
    } catch (e) {}
  };

  const renderAssignment = ({ item }: { item: Assignment }) => (
    <View style={styles.assignmentCard}>
      <View style={styles.cardHeader}>
        <ClipboardList size={24} color={colors.primary.main} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.facultyName}>By: {item.facultyName}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.dateContainer}>
          <Calendar size={16} color={colors.text.secondary} />
          <Text style={styles.dateText}>Due: {item.dueDate}</Text>
        </View>
        
        <View style={styles.statusContainer}>
          {getStatusIcon(item)}
          <Text style={[styles.statusText, { color: getStatusColor(item) }]}>
            {getStatusText(item)}
          </Text>
        </View>
      </View>
      
      {!item.isSubmitted && !isOverdue(item.dueDate) && (
        <TouchableOpacity style={styles.submitButton} onPress={() => submitAssignment(item.id)}>
          <Text style={styles.submitButtonText}>Submit Assignment</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Assignments</Text>
      </View>

      {assignments.length === 0 ? (
        <View style={styles.emptyState}>
          <ClipboardList size={48} color={colors.text.secondary} />
          <Text style={styles.emptyStateText}>No assignments available</Text>
          <Text style={styles.emptyStateSubtext}>
            Follow faculty to see their assignments
          </Text>
        </View>
      ) : (
        <FlatList
          data={assignments}
          renderItem={renderAssignment}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          showsVerticalScrollIndicator={false}
        />
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
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  assignmentCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  cardInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cardTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  facultyName: {
    fontSize: typography.fontSize.sm,
    color: colors.secondary.main,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.xs,
  },
  submitButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  submitButtonText: {
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