// import { Tabs } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { usePathname } from 'expo-router';
// import { View, ActivityIndicator, StyleSheet } from 'react-native';
// import { AuthProvider, useAuth } from '@/services/auth-context';
// import LoginScreen from '@/components/LoginScreen';
// import HelpThink from '@/components/HelpThink';
// import { AlertProvider } from '@/components/AlertProvider';
// import { AlertNotification } from '@/components/AlertNotification';

// function TabsLayout() {
//   const { isAuthenticated, isLoading } = useAuth();
//   const pathname = usePathname();

//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#10B981" />
//       </View>
//     );
//   }

//   if (!isAuthenticated) {
//     return <LoginScreen />;
//   }

//   const showHelpButton = pathname !== '/help';
  
//   return (
//     <>
//       <Tabs
//         screenOptions={{
//           tabBarActiveTintColor: '#10B981',
//           tabBarInactiveTintColor: '#8B9DB5',
//           headerShown: false,
//           tabBarStyle: {
//             backgroundColor: '#1F2937',
//             borderTopWidth: 0,
//             paddingBottom: 8,
//             paddingTop: 8,
//             height: 70,
//             display: pathname === '/help' ? 'none' : 'flex', 
//           },
//         }}
//       >
//         <Tabs.Screen
//           name="index"
//           options={{
//             title: 'Inicio',
//             tabBarIcon: ({ color, size }) => (
//               <Ionicons name="home" size={size} color={color} />
//             ),
//           }}
//         />
//         <Tabs.Screen
//           name="history"
//           options={{
//             title: 'Histórico',
//             tabBarIcon: ({ color, size }) => (
//               <Ionicons name="time" size={size} color={color} />
//             ),
//           }}
//         />
//         <Tabs.Screen
//           name="grafics"
//           options={{
//             title: 'Gráficas',
//             tabBarIcon: ({ color, size }) => (
//               <Ionicons name="stats-chart" size={size} color={color} />
//             ),
//           }}
//         />
//         <Tabs.Screen
//           name="settings"
//           options={{
//             title: 'Ajustes',
//             tabBarIcon: ({ color, size }) => (
//               <Ionicons name="settings" size={size} color={color} />
//             ),
//           }}
//         />
//         <Tabs.Screen
//           name="help"
//           options={{
//             href: null, 
//           }}
//         />
//       </Tabs>
//       {showHelpButton && <HelpThink />}
//     </>
//   );
// }

// export default function TabLayout() {
//   return (
//     <AuthProvider>
//       <AlertProvider>
//         <TabsLayout />
//       </AlertProvider>
//     </AuthProvider>
//   );
// }

// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: '#000000',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '@/services/auth-context';
import LoginScreen from '@/components/LoginScreen';
import HelpThink from '@/components/HelpThink';
import { AlertProvider } from '@/components/AlertProvider';
import { AlertNotification } from '@/components/AlertNotification';

function TabsLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  console.log('🏠 TabsLayout - Estado:', { isAuthenticated, isLoading, pathname });

  if (isLoading) {
    console.log('⏳ Cargando autenticación...');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!isAuthenticated) {
    console.log('🔒 Usuario no autenticado - Mostrando LoginScreen');
    return <LoginScreen />;
  }

  console.log('✅ Usuario autenticado - Renderizando tabs con AlertNotification');
  const showHelpButton = pathname !== '/help';
  
  return (
    <>
      <AlertNotification />
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
            display: pathname === '/help' ? 'none' : 'flex', 
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
        <Tabs.Screen
          name="help"
          options={{
            href: null, 
          }}
        />
      </Tabs>
      {showHelpButton && <HelpThink />}
    </>
  );
}

export default function TabLayout() {
  console.log('🚀 Inicializando TabLayout con providers');
  return (
    <AuthProvider>
      <AlertProvider>
        <TabsLayout />
      </AlertProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});