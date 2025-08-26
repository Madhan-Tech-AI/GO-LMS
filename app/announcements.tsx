import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/constants/theme';
import { ArrowLeft, Megaphone } from 'lucide-react-native';

interface Announcement {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  facultyId: string;
  facultyName: string;
  visibility: 'followers' | 'public';
}

export default function Announcements() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [visibility, setVisibility] = useState<'followers' | 'public'>('followers');
  const router = useRouter();

  useEffect(() => {
    loadCurrentUser();
    loadAnnouncements();
  }, []);

  const loadCurrentUser = async () => {
    const u = await AsyncStorage.getItem('currentUser');
    if (u) setCurrentUser(JSON.parse(u));
  };

  const loadAnnouncements = async () => {
    const raw = await AsyncStorage.getItem('announcements');
    setAnnouncements(raw ? JSON.parse(raw) : []);
  };

  const postAnnouncement = async () => {
    if (!title.trim() || !message.trim()) return;
    if (currentUser?.userType !== 'faculty') {
      Alert.alert('Only faculty can post');
      return;
    }
    const ann: Announcement = {
      id: Date.now().toString(),
      title: title.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
      facultyId: currentUser.staffId,
      facultyName: currentUser.staffName,
      visibility,
    };
    const list = [ann, ...announcements];
    await AsyncStorage.setItem('announcements', JSON.stringify(list));
    setAnnouncements(list);
    setTitle('');
    setMessage('');
  };

  const visibleAnnouncements = announcements.filter((a) => {
    if (!currentUser) return a.visibility === 'public';
    if (currentUser.userType === 'faculty') return a.facultyId === currentUser.staffId;
    if (currentUser.userType === 'student') {
      const follows = currentUser.followedFaculty || [];
      return a.visibility === 'public' || follows.includes(a.facultyId);
    }
    return false;
  });

  const isFaculty = currentUser?.userType === 'faculty';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.primary.main} />
        </TouchableOpacity>
        <Text style={styles.title}>Announcements</Text>
      </View>

      {isFaculty && (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
          <TextInput style={[styles.input, styles.textArea]} placeholder="Message" value={message} onChangeText={setMessage} multiline numberOfLines={3} />
          <View style={styles.row}>
            {(['followers','public'] as const).map(v => (
              <TouchableOpacity key={v} style={[styles.chip, visibility===v && styles.chipActive]} onPress={()=>setVisibility(v)}>
                <Text style={[styles.chipText, visibility===v && styles.chipTextActive]}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.postButton} onPress={postAnnouncement}>
            <Megaphone size={18} color={colors.white} />
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      )}

      {visibleAnnouncements.length === 0 ? (
        <View style={styles.empty}>
          <Megaphone size={48} color={colors.text.secondary} />
          <Text style={styles.emptyText}>No announcements</Text>
        </View>
      ) : (
        <FlatList
          data={visibleAnnouncements}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>By {item.facultyName} • {new Date(item.createdAt).toLocaleString()}</Text>
              <Text style={styles.cardMsg}>{item.message}</Text>
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary, paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  backButton: { padding: spacing.sm, marginRight: spacing.md },
  title: { fontSize: typography.fontSize.xxl, fontWeight: typography.fontWeight.bold, color: colors.primary.main },
  form: { backgroundColor: colors.white, marginHorizontal: spacing.lg, borderRadius: 12, padding: spacing.lg, marginBottom: spacing.lg },
  input: { backgroundColor: colors.background.secondary, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: typography.fontSize.md, marginBottom: spacing.md },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  chip: { backgroundColor: colors.background.secondary, borderRadius: 14, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  chipActive: { backgroundColor: colors.primary.main },
  chipText: { color: colors.text.primary },
  chipTextActive: { color: colors.white },
  postButton: { backgroundColor: colors.primary.main, borderRadius: 8, paddingVertical: spacing.md, alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  postButtonText: { color: colors.white, fontWeight: typography.fontWeight.bold },
  list: { paddingHorizontal: spacing.lg },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: spacing.lg, marginBottom: spacing.md },
  cardTitle: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.text.primary },
  cardMeta: { fontSize: typography.fontSize.xs, color: colors.text.secondary, marginTop: spacing.xs },
  cardMsg: { fontSize: typography.fontSize.sm, color: colors.text.primary, marginTop: spacing.sm },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.text.secondary },
});


