import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/constants/theme';
import { Bell, Calendar, MessageCircle, Bot, Users, FileText, Image as ImageIcon, Link } from 'lucide-react-native';

interface StudentData {
  studentName: string;
  registerNumber: string;
  department: string;
  yearSemester: string;
  followedFaculty: string[];
}

export default function StudentHome() {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [feed, setFeed] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadStudentData();
    loadFeed();
  }, []);

  const loadStudentData = async () => {
    try {
      const currentUserData = await AsyncStorage.getItem('currentUser');
      if (currentUserData) {
        setStudentData(JSON.parse(currentUserData));
      }
    } catch (error) {
      console.error('Failed to load student data:', error);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('currentUser');
    router.replace('/landing');
  };

  const loadFeed = async () => {
    try {
      const currentUserData = await AsyncStorage.getItem('currentUser');
      if (!currentUserData) return;
      const student = JSON.parse(currentUserData);
      const allMaterials = await AsyncStorage.getItem('faculty_materials');
      if (!allMaterials) return;
      const materials = JSON.parse(allMaterials);
      const visible = materials.filter((m: any) => {
        const isFromFollowed = student.followedFaculty?.includes(m.facultyId);
        if (m.visibility === 'public') return true;
        if (m.visibility === 'followers') return isFromFollowed;
        if (m.visibility === 'custom') return Array.isArray(m.audience) && m.audience.includes(student.registerNumber);
        return false;
      }).sort((a: any, b: any) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
      setFeed(visible);
    } catch (e) {}
  };

  if (!studentData) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing.xl }}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.nameText}>{studentData.studentName}</Text>
        <Text style={styles.roleText}>{studentData.department} - {studentData.yearSemester}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Users size={24} color={colors.secondary.main} />
          <Text style={styles.statNumber}>{studentData.followedFaculty.length}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
        <View style={styles.statCard}>
          <Bell size={24} color={colors.primary.main} />
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Notifications</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/chat')}
        >
          <MessageCircle size={24} color={colors.primary.main} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Messages</Text>
            <Text style={styles.actionSubtitle}>Chat with faculty</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/calendar')}
        >
          <Calendar size={24} color={colors.secondary.main} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Calendar</Text>
            <Text style={styles.actionSubtitle}>View academic events</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/ai-chatbot')}
        >
          <Bot size={24} color={colors.accent.main} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>AI Assistant</Text>
            <Text style={styles.actionSubtitle}>Get help with FAQs</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(student-tabs)/materials')}
        >
          <FileText size={24} color={colors.primary.main} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Materials</Text>
            <Text style={styles.actionSubtitle}>Notes, PDFs, videos</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(student-tabs)/assignments')}
        >
          <Calendar size={24} color={colors.secondary.main} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Assignments</Text>
            <Text style={styles.actionSubtitle}>View and submit</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(student-tabs)/quizzes')}
        >
          <Link size={24} color={colors.accent.main} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Quizzes</Text>
            <Text style={styles.actionSubtitle}>Practice and track scores</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/announcements')}
        >
          <Bell size={24} color={colors.primary.main} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Announcements</Text>
            <Text style={styles.actionSubtitle}>From your faculty</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.feedSection}>
        <Text style={styles.sectionTitle}>Latest from your faculty</Text>
        {feed.length === 0 ? (
          <Text style={styles.emptyFeed}>No posts yet. Follow faculty to see their materials.</Text>
        ) : (
          feed.map((item) => (
            <View key={item.id} style={styles.feedCard}>
              <View style={styles.feedHeader}>
                {item.type === 'pdf' ? <FileText size={20} color={colors.error.main} /> : item.category === 'video' ? <ImageIcon size={20} color={colors.success.main} /> : <Link size={20} color={colors.primary.main} />}
                <View style={styles.feedHeaderInfo}>
                  <Text style={styles.feedTitle}>{item.title}</Text>
                  <Text style={styles.feedMeta}>By {item.facultyName} • {new Date(item.uploadDate).toLocaleDateString()}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.openButton} onPress={() => router.push('/materials')}>
                <Text style={styles.openButtonText}>Open</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
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
    paddingVertical: spacing.xl,
    backgroundColor: colors.secondary.main,
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    marginBottom: spacing.lg,
  },
  welcomeText: {
    fontSize: typography.fontSize.lg,
    color: colors.white,
    opacity: 0.9,
  },
  nameText: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  roleText: {
    fontSize: typography.fontSize.md,
    color: colors.white,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  quickActions: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  actionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionContent: {
    marginLeft: spacing.md,
  },
  actionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  actionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  logoutButton: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.error.main,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoutText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  feedSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  feedCard: {
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
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedHeaderInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  feedTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  feedMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  openButton: {
    marginTop: spacing.md,
    backgroundColor: colors.secondary.main,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  openButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  emptyFeed: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
  },
});