import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from '@/services/auth-context';
import LoginScreen from '@/components/LoginScreen';

function TabsLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#8B9DB5',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1F2937',
          borderTopWidth: 0,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="grafics"
        options={{
          title: 'Gráficas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <AuthProvider>
      <TabsLayout />
    </AuthProvider>
  );
}