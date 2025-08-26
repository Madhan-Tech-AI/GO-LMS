import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '@/constants/theme';
import { UserCheck, UserX } from 'lucide-react-native';

interface FollowRequest {
  registerNumber: string;
  studentName: string;
  department: string;
  requestedAt: string;
}

export default function FollowRequestsScreen() {
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [faculty, setFaculty] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const current = await AsyncStorage.getItem('currentUser');
      if (!current) return;
      const parsed = JSON.parse(current);
      if (parsed.userType !== 'faculty') return;
      setFaculty(parsed);

      const rawFaculty = await AsyncStorage.getItem(`faculty_${parsed.staffId}`);
      const fullFaculty = rawFaculty ? JSON.parse(rawFaculty) : parsed;
      const list = Array.isArray(fullFaculty.followRequests) ? fullFaculty.followRequests : [];
      setRequests(list);
    } catch (e) {}
  };

  const approve = async (req: FollowRequest) => {
    try {
      const facultyKey = `faculty_${faculty.staffId}`;
      const raw = await AsyncStorage.getItem(facultyKey);
      if (!raw) return;
      const f = JSON.parse(raw);
      f.followRequests = (f.followRequests || []).filter((r: any) => r.registerNumber !== req.registerNumber);
      f.followers = Array.isArray(f.followers) ? f.followers : [];
      if (!f.followers.includes(req.registerNumber)) f.followers.push(req.registerNumber);
      await AsyncStorage.setItem(facultyKey, JSON.stringify(f));

      const studentKey = `student_${req.registerNumber}`;
      const sraw = await AsyncStorage.getItem(studentKey);
      if (sraw) {
        const s = JSON.parse(sraw);
        s.followedFaculty = Array.isArray(s.followedFaculty) ? s.followedFaculty : [];
        if (!s.followedFaculty.includes(faculty.staffId)) s.followedFaculty.push(faculty.staffId);
        await AsyncStorage.setItem(studentKey, JSON.stringify(s));
      }

      Alert.alert('Approved', `You and ${req.studentName} are now connected`);
      loadData();
    } catch (e) {
      Alert.alert('Error', 'Could not approve');
    }
  };

  const reject = async (req: FollowRequest) => {
    try {
      const facultyKey = `faculty_${faculty.staffId}`;
      const raw = await AsyncStorage.getItem(facultyKey);
      if (!raw) return;
      const f = JSON.parse(raw);
      f.followRequests = (f.followRequests || []).filter((r: any) => r.registerNumber !== req.registerNumber);
      await AsyncStorage.setItem(facultyKey, JSON.stringify(f));
      loadData();
    } catch (e) {
      Alert.alert('Error', 'Could not reject');
    }
  };

  const renderItem = ({ item }: { item: FollowRequest }) => (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.studentName}</Text>
        <Text style={styles.meta}>Reg: {item.registerNumber}</Text>
        <Text style={styles.meta}>Dept: {item.department}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.approve} onPress={() => approve(item)}>
          <UserCheck size={18} color={colors.white} />
          <Text style={styles.btnText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reject} onPress={() => reject(item)}>
          <UserX size={18} color={colors.white} />
          <Text style={styles.btnText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Follow Requests</Text>
      {requests.length === 0 ? (
        <View style={styles.empty}> 
          <Text style={styles.emptyText}>No pending requests</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.registerNumber}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingBottom: spacing.xl }]}
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
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  info: { flex: 1 },
  name: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  meta: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  actions: { flexDirection: 'row', gap: spacing.sm },
  approve: {
    backgroundColor: colors.primary.main,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  reject: {
    backgroundColor: colors.error.main,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  btnText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    marginLeft: 4,
  },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.text.secondary, fontSize: typography.fontSize.md },
});


