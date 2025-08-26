import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/constants/theme';
import { ArrowLeft, Send, Bot, User } from 'lucide-react-native';

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: string;
}

const FAQ_RESPONSES = {
  'timetable': 'Your timetable is available in the Calendar section. Faculty members regularly update class schedules and exam dates there.',
  'subjects': 'You can find all your subjects by checking the materials uploaded by faculty you follow. Each faculty typically handles specific subjects.',
  'deadlines': 'Assignment deadlines are shown in the Assignments section. You can also check the Calendar for all upcoming deadlines.',
  'grades': 'Grades and quiz results are available in your Profile section under the Analytics tab.',
  'contact': 'You can contact faculty directly through the Messages section or check their contact details on their profile.',
  'help': 'I can help you with questions about timetables, subjects, deadlines, grades, and how to use the app. What would you like to know?',
};

export default function AIChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: '1',
      text: 'Hello! I\'m your LMS assistant. I can help you with questions about timetables, subjects, deadlines, grades, and more. How can I help you today?',
      isBot: true,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      isBot: false,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Generate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(newMessage.toLowerCase());
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isBot: true,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);

    setNewMessage('');
  };

  const getBotResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    for (const [key, response] of Object.entries(FAQ_RESPONSES)) {
      if (lowerInput.includes(key)) {
        return response;
      }
    }
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return 'Hello! How can I assist you with your studies today?';
    }
    
    if (lowerInput.includes('thank')) {
      return 'You\'re welcome! Is there anything else I can help you with?';
    }
    
    return 'I understand you\'re asking about "' + userInput + '". Could you try asking about timetables, subjects, deadlines, grades, or contact information? I\'m here to help!';
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.messageContainer, !item.isBot && styles.userMessageContainer]}>
      <View style={[styles.messageBubble, !item.isBot && styles.userBubble]}>
        <View style={styles.messageHeader}>
          {item.isBot ? (
            <Bot size={16} color={colors.primary.main} />
          ) : (
            <User size={16} color={colors.white} />
          )}
          <Text style={[styles.senderText, !item.isBot && styles.userSenderText]}>
            {item.isBot ? 'AI Assistant' : 'You'}
          </Text>
        </View>
        <Text style={[styles.messageText, !item.isBot && styles.userMessageText]}>
          {item.text}
        </Text>
        <Text style={[styles.timestamp, !item.isBot && styles.userTimestamp]}>
          {new Date(item.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.primary.main} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Bot size={24} color={colors.primary.main} />
          <Text style={styles.title}>AI Assistant</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        showsVerticalScrollIndicator={false}
        inverted
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Ask me anything..."
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
    backgroundColor: colors.white,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
    marginLeft: spacing.md,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    transform: [{ scaleY: -1 }],
  },
  messageContainer: {
    marginBottom: spacing.md,
    transform: [{ scaleY: -1 }],
  },
  userMessageContainer: {
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
  userBubble: {
    backgroundColor: colors.secondary.main,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  senderText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.xs,
  },
  userSenderText: {
    color: colors.white,
    opacity: 0.9,
  },
  messageText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    lineHeight: 20,
  },
  userMessageText: {
    color: colors.white,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
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
});