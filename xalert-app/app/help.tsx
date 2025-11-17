import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  SafeAreaView,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { api } from '../services/api';

interface Message {
  text: string;
  from: 'user' | 'bot';
  timestamp: string;
  isLoading?: boolean;
}

export default function HelpScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      text: '¡Hola! Soy tu asistente inteligente de sensores y alertas. Puedo ayudarte con información sobre el estado de los sensores, mediciones, alertas y más. ¿En qué puedo ayudarte?', 
      from: 'bot',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = React.useRef<ScrollView>(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      text: input,
      from: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const loadingMessage: Message = {
      text: 'Analizando información...',
      from: 'bot',
      timestamp: new Date().toISOString(),
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await api.consultaIASensores(input);
      
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      const botMessage: Message = {
        text: response.respuesta,
        from: 'bot',
        timestamp: response.timestamp
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      const errorMessage: Message = {
        text: `Lo siento, hubo un error al procesar tu consulta: ${error.message || 'Error desconocido'}. Por favor, intenta nuevamente.`,
        from: 'bot',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const suggestions = [
    '¿Cuántos sensores activos hay?',
    '¿Hay alguna alerta crítica?',
    'Estado de las mediciones',
    'Sensores con problemas'
  ];

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  // Botones de análisis rápido
  const handleQuickAnalysis = async (tipo: string) => {
    setIsLoading(true);
    const loadingMessage: Message = {
      text: 'Generando análisis...',
      from: 'bot',
      timestamp: new Date().toISOString(),
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await api.analisisSensores(tipo as any);
      
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      const botMessage: Message = {
        text: response.respuesta,
        from: 'bot',
        timestamp: response.timestamp
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      const errorMessage: Message = {
        text: `Error al generar análisis: ${error.message}`,
        from: 'bot',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerText}>Asistente IA</Text>
            <Text style={styles.headerSubtext}>Sensores y Alertas</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>


        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, idx) => (
            <View
              key={idx}
              style={[
                styles.message,
                msg.from === 'user' ? styles.userMsg : styles.botMsg
              ]}
            >
              {msg.isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#10B981" />
                  <Text style={styles.messageText}> {msg.text}</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.messageText}>{msg.text}</Text>
                  <Text style={styles.timestamp}>
                    {new Date(msg.timestamp).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </>
              )}
            </View>
          ))}

          {messages.length === 1 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Preguntas sugeridas:</Text>
              {suggestions.map((suggestion, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.suggestionChip}
                  onPress={() => handleSuggestion(suggestion)}
                  disabled={isLoading}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Escribe tu pregunta..."
            placeholderTextColor="#8B9DB5"
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, (isLoading || !input.trim()) && styles.sendBtnDisabled]} 
            onPress={handleSend}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#10B981',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerSubtext: {
    color: '#D1FAE5',
    fontSize: 11,
    marginTop: 2,
  },
  quickAnalysis: {
    backgroundColor: '#1F2937',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  quickBtn: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  quickBtnText: {
    color: '#D1D5DB',
    fontSize: 13,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  message: {
    marginVertical: 4,
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  userMsg: {
    alignSelf: 'flex-end',
    backgroundColor: '#10B981',
  },
  botMsg: {
    alignSelf: 'flex-start',
    backgroundColor: '#374151',
  },
  messageText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 20,
  },
  timestamp: {
    color: '#D1D5DB',
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#1F2937',
    borderRadius: 12,
  },
  suggestionsTitle: {
    color: '#9CA3AF',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '600',
  },
  suggestionChip: {
    backgroundColor: '#374151',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  suggestionText: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#1F2937',
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  input: {
    flex: 1,
    backgroundColor: '#374151',
    color: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: '#10B981',
    borderRadius: 24,
    padding: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#6B7280',
  },
});