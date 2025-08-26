import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="landing" />
        <Stack.Screen name="faculty-auth" />
        <Stack.Screen name="student-auth" />
        <Stack.Screen name="(faculty-tabs)" />
        <Stack.Screen name="(student-tabs)" />
        <Stack.Screen name="faculty-profile" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="calendar" />
        <Stack.Screen name="ai-chatbot" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}