import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/constants/theme';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react-native';

interface Message {
  id: string;
  text: string;
  sender: string;
  senderType: 'faculty' | 'student';
  timestamp: string;
  threadId: string;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [recipientId, setRecipientId] = useState<string>('');
  const [availableRecipients, setAvailableRecipients] = useState<{ id: string; name: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadCurrentUser();
    loadMessages();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        const u = JSON.parse(userData);
        setCurrentUser(u);
        await loadRecipients(u);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const loadRecipients = async (u: any) => {
    // Students can message followed faculty; faculty can message followers
    if (u.userType === 'student') {
      const followed: string[] = Array.isArray(u.followedFaculty) ? u.followedFaculty : [];
      const keys = followed.map((fid) => `faculty_${fid}`);
      const pairs = await AsyncStorage.multiGet(keys);
      const recips = pairs
        .map(([k, v]) => (v ? JSON.parse(v) : null))
        .filter(Boolean)
        .map((f: any) => ({ id: f.staffId, name: f.staffName }));
      setAvailableRecipients(recips);
      if (recips[0]) setRecipientId(recips[0].id);
    } else if (u.userType === 'faculty') {
      const followerIds: string[] = Array.isArray(u.followers) ? u.followers : [];
      const keys = followerIds.map((rn) => `student_${rn}`);
      const pairs = await AsyncStorage.multiGet(keys);
      const recips = pairs
        .map(([k, v]) => (v ? JSON.parse(v) : null))
        .filter(Boolean)
        .map((s: any) => ({ id: s.registerNumber, name: s.studentName }));
      setAvailableRecipients(recips);
      if (recips[0]) setRecipientId(recips[0].id);
    }
  };

  const loadMessages = async () => {
    try {
      const messagesData = await AsyncStorage.getItem('chat_messages');
      if (messagesData) {
        setMessages(JSON.parse(messagesData));
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const makeThreadId = (aType: string, aId: string, bType: string, bId: string) => {
    const one = `${aType}:${aId}`;
    const two = `${bType}:${bId}`;
    return [one, two].sort().join('|');
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !recipientId) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: currentUser.userType === 'faculty' ? currentUser.staffName : currentUser.studentName,
      senderType: currentUser.userType,
      timestamp: new Date().toISOString(),
      threadId: currentUser.userType === 'student'
        ? makeThreadId('student', currentUser.registerNumber, 'faculty', recipientId)
        : makeThreadId('faculty', currentUser.staffId, 'student', recipientId),
    };

    const updatedMessages = [...messages, message];
    
    try {
      await AsyncStorage.setItem('chat_messages', JSON.stringify(updatedMessages));
      setMessages(updatedMessages);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = (
      (currentUser.userType === 'faculty' && item.senderType === 'faculty' && item.sender === currentUser.staffName) ||
      (currentUser.userType === 'student' && item.senderType === 'student' && item.sender === currentUser.studentName)
    );

    return (
      <View style={[styles.messageContainer, isCurrentUser && styles.currentUserMessage]}>
        <View style={[styles.messageBubble, isCurrentUser && styles.currentUserBubble]}>
          <Text style={styles.senderName}>
            {item.sender} ({item.senderType})
          </Text>
          <Text style={[styles.messageText, isCurrentUser && styles.currentUserText]}>
            {item.text}
          </Text>
          <Text style={[styles.timestamp, isCurrentUser && styles.currentUserTimestamp]}>
            {new Date(item.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    );
  };

  const threadId = currentUser
    ? (currentUser.userType === 'student'
        ? makeThreadId('student', currentUser.registerNumber, 'faculty', recipientId)
        : makeThreadId('faculty', currentUser.staffId, 'student', recipientId))
    : '';
  const visibleMessages = threadId ? messages.filter((m) => m.threadId === threadId) : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.primary.main} />
        </TouchableOpacity>
        <Text style={styles.title}>Messages</Text>
      </View>

      {visibleMessages.length === 0 ? (
        <View style={styles.emptyState}>
          <MessageCircle size={48} color={colors.text.secondary} />
          <Text style={styles.emptyStateText}>No messages yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Start a conversation with your colleagues
          </Text>
        </View>
      ) : (
        <FlatList
          data={visibleMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.inputContainer}>
        <View style={styles.recipientBar}>
          <Text style={styles.recipientLabel}>To:</Text>
          <FlatList
            data={availableRecipients}
            horizontal
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.recipientChip, recipientId === item.id && styles.recipientChipActive]}
                onPress={() => setRecipientId(item.id)}
              >
                <Text style={[styles.recipientChipText, recipientId === item.id && styles.recipientChipTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingRight: spacing.md }}
            showsHorizontalScrollIndicator={false}
          />
        </View>
        <TextInput
          style={styles.messageInput}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Send size={20} color={colors.white} />
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
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
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
  messagesList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  messageContainer: {
    marginBottom: spacing.md,
  },
  currentUserMessage: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    maxWidth: '80%',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentUserBubble: {
    backgroundColor: colors.primary.main,
  },
  senderName: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  messageText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    lineHeight: 20,
  },
  currentUserText: {
    color: colors.white,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  currentUserTimestamp: {
    color: colors.white,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    alignItems: 'flex-end',
  },
  recipientBar: {
    position: 'absolute',
    top: -48,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  recipientLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  recipientChip: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
  },
  recipientChipActive: {
    backgroundColor: colors.primary.main,
  },
  recipientChipText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
  },
  recipientChipTextActive: {
    color: colors.white,
  },
  messageInput: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 20,
    padding: spacing.md,
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
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