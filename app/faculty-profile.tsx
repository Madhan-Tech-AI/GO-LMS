import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '@/constants/theme';
import { ArrowLeft, User, Mail, Phone, Building, UserPlus, UserCheck } from 'lucide-react-native';

interface Faculty {
  staffName: string;
  staffId: string;
  department: string;
  designation: string;
  email: string;
  contactNumber: string;
  followers: string[];
}

export default function FacultyProfile() {
  const { staffId } = useLocalSearchParams<{ staffId: string }>();
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadFacultyData();
    loadCurrentStudent();
  }, []);

  const loadFacultyData = async () => {
    try {
      const facultyData = await AsyncStorage.getItem(`faculty_${staffId}`);
      if (facultyData) {
        setFaculty(JSON.parse(facultyData));
      }
    } catch (error) {
      console.error('Failed to load faculty data:', error);
    }
  };

  const loadCurrentStudent = async () => {
    try {
      const currentUserData = await AsyncStorage.getItem('currentUser');
      if (currentUserData) {
        const student = JSON.parse(currentUserData);
        setCurrentStudent(student);
        setIsFollowing(student.followedFaculty.includes(staffId));
      }
    } catch (error) {
      console.error('Failed to load current student:', error);
    }
  };

  const handleFollow = async () => {
    if (!faculty || !currentStudent) return;

    try {
      const updatedFollowing = isFollowing
        ? currentStudent.followedFaculty.filter((id: string) => id !== staffId)
        : [...currentStudent.followedFaculty, staffId];

      const updatedStudent = {
        ...currentStudent,
        followedFaculty: updatedFollowing,
      };

      const updatedFacultyFollowers = isFollowing
        ? faculty.followers.filter(id => id !== currentStudent.registerNumber)
        : [...faculty.followers, currentStudent.registerNumber];

      const updatedFaculty = {
        ...faculty,
        followers: updatedFacultyFollowers,
      };

      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedStudent));
      await AsyncStorage.setItem(`student_${currentStudent.registerNumber}`, JSON.stringify(updatedStudent));
      await AsyncStorage.setItem(`faculty_${staffId}`, JSON.stringify(updatedFaculty));

      setIsFollowing(!isFollowing);
      setCurrentStudent(updatedStudent);
      setFaculty(updatedFaculty);

      Alert.alert('Success', isFollowing ? 'Unfollowed successfully!' : 'Following successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  if (!faculty) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.primary.main} />
        </TouchableOpacity>
        <Text style={styles.title}>Faculty Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <User size={48} color={colors.primary.main} />
        </View>
        
        <Text style={styles.facultyName}>{faculty.staffName}</Text>
        <Text style={styles.staffId}>Staff ID: {faculty.staffId}</Text>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Building size={20} color={colors.text.secondary} />
            <Text style={styles.infoText}>{faculty.department}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <User size={20} color={colors.text.secondary} />
            <Text style={styles.infoText}>{faculty.designation}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Mail size={20} color={colors.text.secondary} />
            <Text style={styles.infoText}>{faculty.email}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Phone size={20} color={colors.text.secondary} />
            <Text style={styles.infoText}>{faculty.contactNumber}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{faculty.followers.length}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.followButton, isFollowing && styles.unfollowButton]}
          onPress={handleFollow}
        >
          {isFollowing ? (
            <UserCheck size={20} color={colors.white} />
          ) : (
            <UserPlus size={20} color={colors.white} />
          )}
          <Text style={styles.followButtonText}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
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
  facultyName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  staffId: {
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
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  statNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  followButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  unfollowButton: {
    backgroundColor: colors.success.main,
  },
  followButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});