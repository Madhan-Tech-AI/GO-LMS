import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/constants/theme';
import { Search, User } from 'lucide-react-native';

interface Faculty {
  staffName: string;
  staffId: string;
  department: string;
  designation: string;
  email: string;
}

export default function FacultySearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>([]);
  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    loadFacultyList();
    loadCurrentStudent();
  }, []);

  useEffect(() => {
    filterFaculty();
  }, [searchQuery, facultyList]);

  const loadFacultyList = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const facultyKeys = keys.filter(key => key.startsWith('faculty_'));
      
      const facultyData = await AsyncStorage.multiGet(facultyKeys);
      const faculty = facultyData.map(([key, value]) => JSON.parse(value || '{}'));
      
      setFacultyList(faculty);
    } catch (error) {
      console.error('Failed to load faculty list:', error);
    }
  };

  const loadCurrentStudent = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed.userType === 'student') setCurrentStudent(parsed);
      }
    } catch (e) {}
  };

  const filterFaculty = () => {
    const query = (searchQuery || '').toLowerCase().trim();
    if (!query) {
      setFilteredFaculty([]);
      return;
    }

    const safeLower = (val: any) => (typeof val === 'string' ? val.toLowerCase() : '');
    const filtered = facultyList.filter((faculty: any) =>
      safeLower(faculty?.staffName).includes(query) ||
      safeLower(faculty?.staffId).includes(query) ||
      safeLower(faculty?.department).includes(query)
    );

    setFilteredFaculty(filtered);
  };

  const handleFacultyPress = (faculty: Faculty) => {
    router.push({
      pathname: '/faculty-profile',
      params: { staffId: faculty.staffId }
    });
  };

  const sendFollowRequest = async (faculty: Faculty) => {
    if (!currentStudent) {
      Alert.alert('Login required', 'Please login as student to send requests');
      return;
    }

    try {
      const facultyKey = `faculty_${faculty.staffId}`;
      const raw = await AsyncStorage.getItem(facultyKey);
      if (!raw) {
        Alert.alert('Error', 'Faculty not found');
        return;
      }
      const facultyData = JSON.parse(raw);
      facultyData.followRequests = Array.isArray(facultyData.followRequests) ? facultyData.followRequests : [];

      const alreadyFollower = Array.isArray(facultyData.followers) && facultyData.followers.includes(currentStudent.registerNumber);
      const alreadyRequested = facultyData.followRequests.some((r: any) => r.registerNumber === currentStudent.registerNumber);
      if (alreadyFollower) {
        Alert.alert('Info', 'You already follow this faculty');
        return;
      }
      if (alreadyRequested) {
        Alert.alert('Info', 'Follow request already sent');
        return;
      }

      facultyData.followRequests.push({
        registerNumber: currentStudent.registerNumber,
        studentName: currentStudent.studentName,
        department: currentStudent.department,
        requestedAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem(facultyKey, JSON.stringify(facultyData));
      Alert.alert('Success', 'Follow request sent');
    } catch (error) {
      Alert.alert('Error', 'Could not send request');
    }
  };

  const renderFacultyItem = ({ item }: { item: Faculty }) => (
    <TouchableOpacity
      style={styles.facultyCard}
      onPress={() => handleFacultyPress(item)}
    >
      <View style={styles.avatarContainer}>
        <User size={24} color={colors.primary.main} />
      </View>
      <View style={styles.facultyInfo}>
        <Text style={styles.facultyName}>{item.staffName}</Text>
        <Text style={styles.staffId}>Staff ID: {item.staffId}</Text>
        <Text style={styles.department}>{item.department}</Text>
        <Text style={styles.designation}>{item.designation}</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.followButton} onPress={() => sendFollowRequest(item)}>
            <Text style={styles.followButtonText}>Follow</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search Faculty</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={colors.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, Staff ID, or department..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {searchQuery.trim() === '' ? (
        <View style={styles.emptyState}>
          <Search size={48} color={colors.text.secondary} />
          <Text style={styles.emptyStateText}>
            Start typing to search for faculty
          </Text>
          <Text style={styles.emptyStateSubtext}>
            You can search by name, Staff ID, or department
          </Text>
        </View>
      ) : filteredFaculty.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No faculty found</Text>
          <Text style={styles.emptyStateSubtext}>
            Try searching with different keywords
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredFaculty}
          renderItem={renderFacultyItem}
          keyExtractor={(item) => item.staffId}
          style={styles.list}
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
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  facultyCard: {
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
  actionsRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  followButton: {
    backgroundColor: colors.secondary.main,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  followButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    backgroundColor: colors.background.secondary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  facultyInfo: {
    flex: 1,
  },
  facultyName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  staffId: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  department: {
    fontSize: typography.fontSize.sm,
    color: colors.secondary.main,
    fontWeight: typography.fontWeight.medium,
  },
  designation: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
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