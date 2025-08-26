import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '@/constants/theme';
import { Play, Award } from 'lucide-react-native';

export default function StudentQuizzes() {
  const [student, setStudent] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const u = await AsyncStorage.getItem('currentUser');
      if (u) setStudent(JSON.parse(u));
      const q = await AsyncStorage.getItem('quizzes');
      setQuizzes(q ? JSON.parse(q) : []);
      const r = await AsyncStorage.getItem('quiz_results');
      setResults(r ? JSON.parse(r) : []);
    })();
  }, []);

  const visibleQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      if (!student) return q.visibility === 'public';
      const follows = student.followedFaculty || [];
      return q.visibility === 'public' || follows.includes(q.facultyId);
    });
  }, [quizzes, student]);

  const startQuiz = async (quiz: any) => {
    // simple attempt: compute score randomly to simulate
    const correct = Math.floor(Math.random() * (quiz.questions.length + 1));
    const score = Math.round((correct / quiz.questions.length) * 100);
    const row = {
      id: Date.now().toString(),
      quizId: quiz.id,
      registerNumber: student.registerNumber,
      studentName: student.studentName,
      score,
      total: quiz.questions.length,
      takenAt: new Date().toISOString(),
    };
    const listRaw = await AsyncStorage.getItem('quiz_results');
    const list = listRaw ? JSON.parse(listRaw) : [];
    list.push(row);
    await AsyncStorage.setItem('quiz_results', JSON.stringify(list));
    setResults(list);
  };

  const renderQuiz = ({ item }: { item: any }) => {
    const myResults = results.filter((r) => r.quizId === item.id && r.registerNumber === student?.registerNumber);
    const best = myResults.length ? Math.max(...myResults.map((r) => r.score)) : null;
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>By {item.facultyName} • {item.questions.length} questions</Text>
        {best !== null && (
          <View style={styles.bestRow}>
            <Award size={16} color={colors.warning.main} />
            <Text style={styles.bestText}>Best Score: {best}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.playBtn} onPress={() => startQuiz(item)}>
          <Play size={16} color={colors.white} />
          <Text style={styles.playText}>Take Quiz</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={visibleQuizzes}
        keyExtractor={(q)=>q.id}
        renderItem={renderQuiz}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No quizzes available</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary, paddingTop: 50 },
  list: { paddingHorizontal: spacing.lg },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: spacing.lg, marginBottom: spacing.md },
  title: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.text.primary },
  meta: { fontSize: typography.fontSize.xs, color: colors.text.secondary, marginTop: spacing.xs },
  bestRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  bestText: { color: colors.text.secondary, fontSize: typography.fontSize.sm },
  playBtn: { marginTop: spacing.md, backgroundColor: colors.secondary.main, borderRadius: 8, paddingVertical: spacing.sm, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: spacing.xs },
  playText: { color: colors.white, fontWeight: typography.fontWeight.semibold },
  empty: { color: colors.text.secondary, textAlign: 'center', marginTop: spacing.lg },
});


