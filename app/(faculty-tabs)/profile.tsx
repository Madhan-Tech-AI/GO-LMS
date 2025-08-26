import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '@/constants/theme';
import { User, Mail, Phone, Building, CreditCard as Edit } from 'lucide-react-native';

interface Faculty {
  staffName: string;
  staffId: string;
  email: string;
  department: string;
  designation: string;
  contactNumber: string;
  bio?: string;
  subjectsHandled?: string;
}

export default function FacultyProfile() {
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Faculty>({} as Faculty);

  useEffect(() => {
    loadFacultyData();
  }, []);

  const loadFacultyData = async () => {
    try {
      const currentUserData = await AsyncStorage.getItem('currentUser');
      if (currentUserData) {
        const facultyData = JSON.parse(currentUserData);
        setFaculty(facultyData);
        setFormData(facultyData);
      }
    } catch (error) {
      console.error('Failed to load faculty data:', error);
    }
  };

  const saveProfile = async () => {
    try {
      await AsyncStorage.setItem('currentUser', JSON.stringify(formData));
      await AsyncStorage.setItem(`faculty_${formData.staffId}`, JSON.stringify(formData));
      
      setFaculty(formData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const updateFormData = (key: keyof Faculty, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
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
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Edit size={20} color={colors.white} />
          <Text style={styles.editButtonText}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <User size={48} color={colors.primary.main} />
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.staffName}
                onChangeText={(text) => updateFormData('staffName', text)}
              />
            ) : (
              <Text style={styles.value}>{faculty.staffName}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Staff ID</Text>
            <Text style={styles.value}>{faculty.staffId}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => updateFormData('email', text)}
              />
            ) : (
              <Text style={styles.value}>{faculty.email}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Department</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.department}
                onChangeText={(text) => updateFormData('department', text)}
              />
            ) : (
              <Text style={styles.value}>{faculty.department}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Designation</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.designation}
                onChangeText={(text) => updateFormData('designation', text)}
              />
            ) : (
              <Text style={styles.value}>{faculty.designation}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Number</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.contactNumber}
                onChangeText={(text) => updateFormData('contactNumber', text)}
              />
            ) : (
              <Text style={styles.value}>{faculty.contactNumber}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio || ''}
                onChangeText={(text) => updateFormData('bio', text)}
                placeholder="Tell students about yourself..."
                multiline
                numberOfLines={3}
              />
            ) : (
              <Text style={styles.value}>
                {faculty.bio || 'No bio added yet'}
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subjects Handled</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.subjectsHandled || ''}
                onChangeText={(text) => updateFormData('subjectsHandled', text)}
                placeholder="e.g., Mathematics, Physics"
              />
            ) : (
              <Text style={styles.value}>
                {faculty.subjectsHandled || 'Not specified'}
              </Text>
            )}
          </View>
        </View>

        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  editButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  editButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  profileCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    padding: spacing.xl,
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
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  value: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
  },
  saveButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});