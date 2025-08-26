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
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    loadCurrentUser();
    loadMessages();
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

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: currentUser.userType === 'faculty' ? currentUser.staffName : currentUser.studentName,
      senderType: currentUser.userType,
      timestamp: new Date().toISOString(),
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.primary.main} />
        </TouchableOpacity>
        <Text style={styles.title}>Messages</Text>
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <MessageCircle size={48} color={colors.text.secondary} />
          <Text style={styles.emptyStateText}>No messages yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Start a conversation with your colleagues
          </Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.inputContainer}>
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