import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/constants/theme';
import { BookOpen, GraduationCap } from 'lucide-react-native';

export default function LandingPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=150' }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.collegeName}>
          Gojan School of Business and Technology
        </Text>
        <Text style={styles.tagline}>
          "Empowering Knowledge through Technology"
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.facultyButton]}
          onPress={() => router.push('/faculty-auth')}
        >
          <BookOpen size={32} color={colors.white} />
          <Text style={styles.buttonText}>Faculty</Text>
          <Text style={styles.buttonSubtext}>Teaching Portal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.studentButton]}
          onPress={() => router.push('/student-auth')}
        >
          <GraduationCap size={32} color={colors.white} />
          <Text style={styles.buttonText}>Student</Text>
          <Text style={styles.buttonSubtext}>Learning Portal</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Welcome to the Digital Learning Experience
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xxxl,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.lg,
  },
  collegeName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  tagline: {
    fontSize: typography.fontSize.md,
    fontStyle: 'italic',
    color: colors.text.secondary,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary.main,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  facultyButton: {
    backgroundColor: colors.primary.main,
  },
  studentButton: {
    backgroundColor: colors.secondary.main,
  },
  buttonText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginTop: spacing.md,
  },
  buttonSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});