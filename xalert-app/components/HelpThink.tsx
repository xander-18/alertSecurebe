import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const HelpThink: React.FC = () => {
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={() => router.push('/help')}
      accessibilityLabel="Abrir chatbot"
    >
      <Ionicons name="chatbubble-ellipses" size={32} color="#fff" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 90, // Ajusta para que no tape el tab bar
    right: 20,
    backgroundColor: '#10B981',
    borderRadius: 30,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 100,
  },
});

export default HelpThink;