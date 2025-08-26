import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '@/constants/theme';
import { ArrowLeft } from 'lucide-react-native';

export default function StudentAuth() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    studentName: '',
    registerNumber: '',
    email: '',
    password: '',
    department: '',
    yearSemester: '',
  });
  const router = useRouter();

  const handleLogin = async () => {
    if (!formData.registerNumber || !formData.password) {
      Alert.alert('Error', 'Please enter Register Number and Password');
      return;
    }

    try {
      const studentData = await AsyncStorage.getItem(`student_${formData.registerNumber}`);
      if (!studentData) {
        Alert.alert('Error', 'Student not found. Please sign up first.');
        return;
      }

      const student = JSON.parse(studentData);
      if (student.password !== formData.password) {
        Alert.alert('Error', 'Invalid password');
        return;
      }

      await AsyncStorage.setItem('currentUser', JSON.stringify({
        ...student,
        userType: 'student'
      }));

      router.replace('/(student-tabs)');
    } catch (error) {
      Alert.alert('Error', 'Login failed');
    }
  };

  const handleSignup = async () => {
    if (!formData.studentName || !formData.registerNumber || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      const existingStudent = await AsyncStorage.getItem(`student_${formData.registerNumber}`);
      if (existingStudent) {
        Alert.alert('Error', 'Register Number already exists');
        return;
      }

      const studentData = {
        ...formData,
        followedFaculty: [],
        pendingFollowRequests: [],
        completedAssignments: [],
        quizResults: [],
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(`student_${formData.registerNumber}`, JSON.stringify(studentData));
      Alert.alert('Success', 'Student account created successfully!', [
        { text: 'OK', onPress: () => setActiveTab('login') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Signup failed');
    }
  };

  const updateFormData = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.primary.main} />
        </TouchableOpacity>
        <Text style={styles.title}>Student Portal</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'login' && styles.activeTab]}
          onPress={() => setActiveTab('login')}
        >
          <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
            Login
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
          onPress={() => setActiveTab('signup')}
        >
          <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {activeTab === 'login' ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Register Number"
              value={formData.registerNumber}
              onChangeText={(text) => updateFormData('registerNumber', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
              secureTextEntry
            />
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Student Name"
              value={formData.studentName}
              onChangeText={(text) => updateFormData('studentName', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Register Number"
              value={formData.registerNumber}
              onChangeText={(text) => updateFormData('registerNumber', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Department"
              value={formData.department}
              onChangeText={(text) => updateFormData('department', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Year/Semester"
              value={formData.yearSemester}
              onChangeText={(text) => updateFormData('yearSemester', text)}
            />
          </>
        )}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={activeTab === 'login' ? handleLogin : handleSignup}
        >
          <Text style={styles.submitButtonText}>
            {activeTab === 'login' ? 'Login' : 'Sign Up'}
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
    marginBottom: spacing.xl,
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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.secondary.main,
  },
  tabText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.white,
  },
  form: {
    paddingHorizontal: spacing.lg,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  submitButton: {
    backgroundColor: colors.secondary.main,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});