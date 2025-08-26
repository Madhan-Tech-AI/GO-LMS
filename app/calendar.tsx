import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/constants/theme';
import { ArrowLeft, Calendar, Plus, Clock, MapPin } from 'lucide-react-native';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'exam' | 'assignment' | 'class' | 'event';
  description?: string;
}

export default function CalendarScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    type: 'class' as 'exam' | 'assignment' | 'class' | 'event',
    description: '',
  });
  const router = useRouter();

  useEffect(() => {
    loadCurrentUser();
    loadEvents();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const eventsData = await AsyncStorage.getItem('calendar_events');
      if (eventsData) {
        setEvents(JSON.parse(eventsData));
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const addEvent = async () => {
    if (!formData.title || !formData.date || !formData.time) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const newEvent: Event = {
      id: Date.now().toString(),
      ...formData,
    };

    const updatedEvents = [...events, newEvent].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    try {
      await AsyncStorage.setItem('calendar_events', JSON.stringify(updatedEvents));
      setEvents(updatedEvents);
      setFormData({ title: '', date: '', time: '', type: 'class', description: '' });
      setShowAddForm(false);
      Alert.alert('Success', 'Event added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add event');
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return colors.error.main;
      case 'assignment': return colors.warning.main;
      case 'class': return colors.primary.main;
      default: return colors.secondary.main;
    }
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <View style={styles.eventCard}>
      <View style={[styles.eventType, { backgroundColor: getEventTypeColor(item.type) }]}>
        <Text style={styles.eventTypeText}>{item.type.toUpperCase()}</Text>
      </View>
      
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        
        <View style={styles.eventDetails}>
          <View style={styles.eventDetail}>
            <Calendar size={16} color={colors.text.secondary} />
            <Text style={styles.eventDetailText}>{item.date}</Text>
          </View>
          
          <View style={styles.eventDetail}>
            <Clock size={16} color={colors.text.secondary} />
            <Text style={styles.eventDetailText}>{item.time}</Text>
          </View>
        </View>
        
        {item.description && (
          <Text style={styles.eventDescription}>{item.description}</Text>
        )}
      </View>
    </View>
  );

  const isFaculty = currentUser?.userType === 'faculty';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.primary.main} />
        </TouchableOpacity>
        <Text style={styles.title}>Calendar</Text>
        {isFaculty && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={20} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>

      {showAddForm && isFaculty && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Event Title"
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Date (DD/MM/YYYY)"
            value={formData.date}
            onChangeText={(text) => setFormData(prev => ({ ...prev, date: text }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Time (HH:MM AM/PM)"
            value={formData.time}
            onChangeText={(text) => setFormData(prev => ({ ...prev, time: text }))}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description (optional)"
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            multiline
            numberOfLines={2}
          />
          
          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={addEvent}>
              <Text style={styles.createButtonText}>Add Event</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {events.length === 0 ? (
        <View style={styles.emptyState}>
          <Calendar size={48} color={colors.text.secondary} />
          <Text style={styles.emptyStateText}>No events scheduled</Text>
          <Text style={styles.emptyStateSubtext}>
            {isFaculty 
              ? 'Add your first event to get started'
              : 'Check back for updates from your faculty'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 20,
    padding: spacing.sm,
  },
  form: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.md,
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  createButton: {
    flex: 1,
    backgroundColor: colors.primary.main,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  eventCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  eventType: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  eventTypeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
  },
  eventContent: {
    padding: spacing.lg,
  },
  eventTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDetailText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  eventDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontStyle: 'italic',
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