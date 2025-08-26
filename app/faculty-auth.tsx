import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '@/constants/theme';
import { ArrowLeft } from 'lucide-react-native';

export default function FacultyAuth() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    staffName: '',
    staffId: '',
    email: '',
    password: '',
    department: '',
    designation: '',
    contactNumber: '',
  });
  const router = useRouter();

  const handleLogin = async () => {
    if (!formData.staffId || !formData.password) {
      Alert.alert('Error', 'Please enter Staff ID and Password');
      return;
    }

    try {
      // Check if faculty exists
      const facultyData = await AsyncStorage.getItem(`faculty_${formData.staffId}`);
      if (!facultyData) {
        Alert.alert('Error', 'Faculty not found. Please sign up first.');
        return;
      }

      const faculty = JSON.parse(facultyData);
      if (faculty.password !== formData.password) {
        Alert.alert('Error', 'Invalid password');
        return;
      }

      // Save current session
      await AsyncStorage.setItem('currentUser', JSON.stringify({
        ...faculty,
        userType: 'faculty'
      }));

      router.replace('/(faculty-tabs)');
    } catch (error) {
      Alert.alert('Error', 'Login failed');
    }
  };

  const handleSignup = async () => {
    if (!formData.staffName || !formData.staffId || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      // Check if staff ID already exists
      const existingFaculty = await AsyncStorage.getItem(`faculty_${formData.staffId}`);
      if (existingFaculty) {
        Alert.alert('Error', 'Staff ID already exists');
        return;
      }

      // Save faculty data
      const facultyData = {
        ...formData,
        followers: [],
        followRequests: [],
        materialsUploaded: 0,
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(`faculty_${formData.staffId}`, JSON.stringify(facultyData));
      Alert.alert('Success', 'Faculty account created successfully!', [
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
        <Text style={styles.title}>Faculty Portal</Text>
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
              placeholder="Staff ID"
              value={formData.staffId}
              onChangeText={(text) => updateFormData('staffId', text)}
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
              placeholder="Staff Name"
              value={formData.staffName}
              onChangeText={(text) => updateFormData('staffName', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Staff ID"
              value={formData.staffId}
              onChangeText={(text) => updateFormData('staffId', text)}
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
              placeholder="Designation"
              value={formData.designation}
              onChangeText={(text) => updateFormData('designation', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Contact Number"
              value={formData.contactNumber}
              onChangeText={(text) => updateFormData('contactNumber', text)}
              keyboardType="phone-pad"
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
    backgroundColor: colors.primary.main,
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
    backgroundColor: colors.primary.main,
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