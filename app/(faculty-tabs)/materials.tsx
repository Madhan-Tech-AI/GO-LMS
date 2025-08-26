import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { colors, spacing, typography } from '@/constants/theme';
import { Upload, FileText, Image, Link, Trash2 } from 'lucide-react-native';

interface Material {
  id: string;
  title: string;
  type: 'pdf' | 'image' | 'link';
  uri: string;
  uploadDate: string;
}

export default function Materials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [currentFaculty, setCurrentFaculty] = useState<any>(null);

  useEffect(() => {
    loadMaterials();
    loadCurrentFaculty();
  }, []);

  const loadCurrentFaculty = async () => {
    try {
      const currentUserData = await AsyncStorage.getItem('currentUser');
      if (currentUserData) {
        setCurrentFaculty(JSON.parse(currentUserData));
      }
    } catch (error) {
      console.error('Failed to load faculty data:', error);
    }
  };

  const loadMaterials = async () => {
    try {
      const materialsData = await AsyncStorage.getItem('faculty_materials');
      if (materialsData) {
        setMaterials(JSON.parse(materialsData));
      }
    } catch (error) {
      console.error('Failed to load materials:', error);
    }
  };

  const saveMaterials = async (newMaterials: Material[]) => {
    try {
      await AsyncStorage.setItem('faculty_materials', JSON.stringify(newMaterials));
      setMaterials(newMaterials);
    } catch (error) {
      console.error('Failed to save materials:', error);
    }
  };

  const uploadFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const newMaterial: Material = {
          id: Date.now().toString(),
          title: file.name,
          type: file.mimeType?.includes('pdf') ? 'pdf' : 'image',
          uri: file.uri,
          uploadDate: new Date().toISOString(),
        };

        const updatedMaterials = [...materials, newMaterial];
        await saveMaterials(updatedMaterials);
        Alert.alert('Success', 'Material uploaded successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload file');
    }
  };

  const deleteMaterial = async (materialId: string) => {
    const updatedMaterials = materials.filter(m => m.id !== materialId);
    await saveMaterials(updatedMaterials);
    Alert.alert('Success', 'Material deleted successfully!');
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

  const renderMaterial = ({ item }: { item: Material }) => (
    <View style={styles.materialCard}>
      <View style={styles.materialHeader}>
        {getIcon(item.type)}
        <View style={styles.materialInfo}>
          <Text style={styles.materialTitle}>{item.title}</Text>
          <Text style={styles.materialDate}>
            {new Date(item.uploadDate).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => deleteMaterial(item.id)}
          style={styles.deleteButton}
        >
          <Trash2 size={20} color={colors.error.main} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Study Materials</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={uploadFile}>
          <Upload size={20} color={colors.white} />
          <Text style={styles.uploadButtonText}>Upload</Text>
        </TouchableOpacity>
      </View>

      {materials.length === 0 ? (
        <View style={styles.emptyState}>
          <Upload size={48} color={colors.text.secondary} />
          <Text style={styles.emptyStateText}>No materials uploaded yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Start uploading PDFs, images, or add links
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
  uploadButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  uploadButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
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
    alignItems: 'center',
  },
  materialInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  materialTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  materialDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  deleteButton: {
    padding: spacing.sm,
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