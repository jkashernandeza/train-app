import React from 'react';
import { Tabs } from 'expo-router';
import { Activity, Bot, Calendar } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#121212',
        },
        headerTitleStyle: {
          color: '#FFFFFF',
          fontWeight: 'bold',
          fontSize: 20,
        },
        headerTitleAlign: 'center',
        headerTintColor: '#FFFFFF',
        tabBarStyle: {
          backgroundColor: '#1C1C1E',
          borderTopColor: '#2C2C2E',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#0A84FF',
        tabBarInactiveTintColor: '#8E8E93',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerTitle: 'TrAIn',
          tabBarIcon: ({ color, size }) => <Activity size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Coach',
          headerTitle: 'TrAIn Coach AI',
          tabBarIcon: ({ color, size }) => <Bot size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historial',
          headerTitle: 'Historial de Actividades',
          tabBarIcon: ({ color, size }) => <Calendar size={size || 22} color={color} />,
        }}
      />
    </Tabs>
  );
}
