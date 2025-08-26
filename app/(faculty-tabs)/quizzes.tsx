import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '@/constants/theme';
import { Plus, Trash2, CheckCircle, HelpCircle } from 'lucide-react-native';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  facultyId: string;
  facultyName: string;
  visibility: 'followers' | 'public';
  questions: Question[];
}

export default function FacultyQuizzes() {
  const [faculty, setFaculty] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'followers' | 'public'>('followers');
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    (async () => {
      const u = await AsyncStorage.getItem('currentUser');
      if (u) setFaculty(JSON.parse(u));
      const raw = await AsyncStorage.getItem('quizzes');
      setQuizzes(raw ? JSON.parse(raw) : []);
    })();
  }, []);

  const addQuestion = () => {
    setQuestions(prev => ([...prev, { id: Date.now().toString(), text: '', options: ['', '', '', ''], correctIndex: 0 }]));
  };

  const updateQuestion = (qid: string, updater: (q: Question) => Question) => {
    setQuestions(prev => prev.map(q => q.id === qid ? updater(q) : q));
  };

  const removeQuestion = (qid: string) => {
    setQuestions(prev => prev.filter(q => q.id !== qid));
  };

  const saveQuiz = async () => {
    if (!faculty || !title.trim() || questions.length === 0) {
      Alert.alert('Please add title and at least one question');
      return;
    }
    const quiz: Quiz = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim() || undefined,
      createdAt: new Date().toISOString(),
      facultyId: faculty.staffId,
      facultyName: faculty.staffName,
      visibility,
      questions,
    };
    const list = [quiz, ...quizzes];
    await AsyncStorage.setItem('quizzes', JSON.stringify(list));
    setQuizzes(list);
    setTitle(''); setDescription(''); setQuestions([]); setVisibility('followers');
    Alert.alert('Quiz saved');
  };

  const renderQuiz = ({ item }: { item: Quiz }) => (
    <View style={styles.quizCard}>
      <Text style={styles.quizTitle}>{item.title}</Text>
      {!!item.description && <Text style={styles.quizDesc}>{item.description}</Text>}
      <Text style={styles.quizMeta}>{item.questions.length} questions • {item.visibility}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.headerTitle}>Create Quiz</Text>
        <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
        <TextInput style={[styles.input, styles.textArea]} placeholder="Description (optional)" value={description} onChangeText={setDescription} multiline numberOfLines={2} />
        <View style={styles.row}>
          {(['followers','public'] as const).map(v => (
            <TouchableOpacity key={v} style={[styles.chip, visibility===v && styles.chipActive]} onPress={()=>setVisibility(v)}>
              <Text style={[styles.chipText, visibility===v && styles.chipTextActive]}>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.questionsHeader}>
          <Text style={styles.headerTitle}>Questions</Text>
          <TouchableOpacity style={styles.addBtn} onPress={addQuestion}>
            <Plus size={16} color={colors.white} />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
        {questions.length === 0 ? (
          <View style={styles.emptyQ}> 
            <HelpCircle size={20} color={colors.text.secondary} />
            <Text style={styles.emptyQText}>No questions yet</Text>
          </View>
        ) : (
          questions.map(q => (
            <View key={q.id} style={styles.qCard}>
              <TextInput style={styles.input} placeholder="Question text" value={q.text} onChangeText={(t)=>updateQuestion(q.id, (qq)=>({ ...qq, text: t }))} />
              {q.options.map((opt, idx) => (
                <View key={idx} style={styles.optionRow}>
                  <TouchableOpacity onPress={()=>updateQuestion(q.id, qq=>({ ...qq, correctIndex: idx }))}>
                    <CheckCircle size={18} color={q.correctIndex===idx ? colors.success.main : colors.border.light} />
                  </TouchableOpacity>
                  <TextInput style={[styles.input, styles.optionInput]} placeholder={`Option ${idx+1}`} value={opt} onChangeText={(t)=>updateQuestion(q.id, qq=>{ const options=[...qq.options]; options[idx]=t; return { ...qq, options }; })} />
                </View>
              ))}
              <TouchableOpacity style={styles.removeBtn} onPress={()=>removeQuestion(q.id)}>
                <Trash2 size={16} color={colors.error.main} />
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <TouchableOpacity style={styles.saveBtn} onPress={saveQuiz}>
          <Text style={styles.saveBtnText}>Save Quiz</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={quizzes.filter(q => q.facultyId === faculty?.staffId)}
        keyExtractor={(q)=>q.id}
        renderItem={renderQuiz}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary, paddingTop: 50 },
  form: { backgroundColor: colors.white, marginHorizontal: spacing.lg, borderRadius: 12, padding: spacing.lg, marginBottom: spacing.lg },
  headerTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.text.primary, marginBottom: spacing.sm },
  input: { backgroundColor: colors.background.secondary, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: typography.fontSize.md, marginBottom: spacing.sm },
  textArea: { height: 60, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  chip: { backgroundColor: colors.background.secondary, borderRadius: 14, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  chipActive: { backgroundColor: colors.primary.main },
  chipText: { color: colors.text.primary },
  chipTextActive: { color: colors.white },
  questionsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  addBtn: { backgroundColor: colors.primary.main, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  addBtnText: { color: colors.white },
  emptyQ: { alignItems: 'center', marginVertical: spacing.md },
  emptyQText: { color: colors.text.secondary },
  qCard: { backgroundColor: colors.background.secondary, borderRadius: 8, padding: spacing.md, marginTop: spacing.sm },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  optionInput: { flex: 1, marginBottom: 0 },
  removeBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  removeBtnText: { color: colors.error.main },
  saveBtn: { backgroundColor: colors.success.main, borderRadius: 8, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.md },
  saveBtnText: { color: colors.white, fontWeight: typography.fontWeight.bold },
  list: { paddingHorizontal: spacing.lg },
  quizCard: { backgroundColor: colors.white, borderRadius: 12, padding: spacing.lg, marginBottom: spacing.md },
  quizTitle: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.text.primary },
  quizDesc: { fontSize: typography.fontSize.sm, color: colors.text.secondary, marginTop: spacing.xs },
  quizMeta: { fontSize: typography.fontSize.xs, color: colors.text.secondary, marginTop: spacing.xs },
});


