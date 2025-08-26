import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '@/constants/theme';
import { BookOpen, FileText, Image, Link, Download, Bookmark } from 'lucide-react-native';

interface Material {
  id: string;
  title: string;
  type: 'pdf' | 'image' | 'link';
  uri: string;
  uploadDate: string;
  facultyName: string;
  facultyId: string;
  category: 'notes' | 'pdf' | 'video';
  visibility: 'followers' | 'public' | 'custom';
  audience?: string[];
}

export default function StudentMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [bookmarkedMaterials, setBookmarkedMaterials] = useState<string[]>([]);

  useEffect(() => {
    loadMaterials();
    loadBookmarks();
  }, []);

  const loadMaterials = async () => {
    try {
      const currentUserData = await AsyncStorage.getItem('currentUser');
      if (currentUserData) {
        const student = JSON.parse(currentUserData);
        
        // Load materials from followed faculty
        const allMaterials = await AsyncStorage.getItem('faculty_materials');
        if (allMaterials) {
          const materialsData = JSON.parse(allMaterials);
          
          // Visibility: public OR followers AND following OR custom includes student
          const followedMaterials = materialsData.filter((material: any) => {
            const isFromFollowed = student.followedFaculty?.includes(material.facultyId);
            if (material.visibility === 'public') return true;
            if (material.visibility === 'followers') return isFromFollowed;
            if (material.visibility === 'custom') return Array.isArray(material.audience) && material.audience.includes(student.registerNumber);
            return false;
          });
          
          setMaterials(followedMaterials);
        }
      }
    } catch (error) {
      console.error('Failed to load materials:', error);
    }
  };

  const loadBookmarks = async () => {
    try {
      const bookmarks = await AsyncStorage.getItem('student_bookmarks');
      if (bookmarks) {
        setBookmarkedMaterials(JSON.parse(bookmarks));
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    }
  };

  const toggleBookmark = async (materialId: string) => {
    try {
      const isBookmarked = bookmarkedMaterials.includes(materialId);
      const updatedBookmarks = isBookmarked
        ? bookmarkedMaterials.filter(id => id !== materialId)
        : [...bookmarkedMaterials, materialId];

      await AsyncStorage.setItem('student_bookmarks', JSON.stringify(updatedBookmarks));
      setBookmarkedMaterials(updatedBookmarks);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText size={24} color={colors.error.main} />;
      case 'image':
        return <Image size={24} color={colors.success.main} />;
      default:
        return <Link size={24} color={colors.primary.main} />;
    }
  };

  const renderMaterial = ({ item }: { item: Material }) => {
    const isBookmarked = bookmarkedMaterials.includes(item.id);

    return (
      <View style={styles.materialCard}>
        <View style={styles.materialHeader}>
          {getIcon(item.type)}
          <View style={styles.materialInfo}>
            <Text style={styles.materialTitle}>{item.title}</Text>
            <Text style={styles.facultyName}>By: {item.facultyName}</Text>
            <Text style={styles.materialDate}>
              {new Date(item.uploadDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
        
        <View style={styles.materialActions}>
          <TouchableOpacity
            style={[styles.actionButton, isBookmarked && styles.bookmarkedButton]}
            onPress={() => toggleBookmark(item.id)}
          >
            <Bookmark size={16} color={isBookmarked ? colors.warning.main : colors.text.secondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Download size={16} color={colors.primary.main} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Study Materials</Text>
      </View>

      {materials.length === 0 ? (
        <View style={styles.emptyState}>
          <BookOpen size={48} color={colors.text.secondary} />
          <Text style={styles.emptyStateText}>No materials available</Text>
          <Text style={styles.emptyStateSubtext}>
            Follow faculty to access their study materials
          </Text>
        </View>
      ) : (
        <FlatList
          data={materials}
          renderItem={renderMaterial}
          keyExtractor={(item) => item.id}
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
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  materialCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  materialHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  materialInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  materialTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  facultyName: {
    fontSize: typography.fontSize.sm,
    color: colors.secondary.main,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  materialDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  materialActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
  bookmarkedButton: {
    backgroundColor: colors.warning.light,
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