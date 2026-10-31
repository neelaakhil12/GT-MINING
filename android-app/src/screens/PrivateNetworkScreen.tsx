import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, ShieldCheck, Lock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

interface ChatMessage {
  id: string;
  sender: 'me' | 'peer';
  text: string;
  time: string;
}

export const PrivateNetworkScreen: React.FC = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'peer',
      text: 'Welcome to the GT Private Encrypted Network. Peer link verified.',
      time: '14:20',
    },
    {
      id: 'm2',
      sender: 'me',
      text: 'Connected. What is the current block validation cycle status?',
      time: '14:22',
    },
    {
      id: 'm3',
      sender: 'peer',
      text: 'Epoch #42 is running smoothly. 18,452 nodes online.',
      time: '14:23',
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'me',
      text: inputText.trim(),
      time: timeStr,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>GT Encrypted Chat</Text>
          <View style={styles.secureBadge}>
            <Lock size={10} color="#86EFAC" style={{ marginRight: 4 }} />
            <Text style={styles.secureText}>End-to-end encrypted</Text>
          </View>
        </View>

        <View style={styles.shieldIcon}>
          <ShieldCheck size={20} color="#86EFAC" />
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Messages Feed */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.sender === 'me' ? styles.bubbleMe : styles.bubblePeer,
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  item.sender === 'me'
                    ? styles.bubbleTextMe
                    : styles.bubbleTextPeer,
                ]}
              >
                {item.text}
              </Text>
              <Text
                style={[
                  styles.timeText,
                  item.sender === 'me' ? styles.timeMe : styles.timePeer,
                ]}
              >
                {item.time}
              </Text>
            </View>
          )}
        />

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type encrypted message..."
            placeholderTextColor="#6B7280"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={styles.sendButton}
            activeOpacity={0.8}
          >
            <Send size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF8EE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A341B',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 6,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  secureText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#86EFAC',
  },
  shieldIcon: {
    padding: 4,
  },
  messagesList: {
    padding: 16,
    gap: 12,
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: '#0A341B',
    borderBottomRightRadius: 4,
  },
  bubblePeer: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#DCF2E4',
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 18,
  },
  bubbleTextMe: {
    color: '#FFFFFF',
  },
  bubbleTextPeer: {
    color: '#0A341B',
  },
  timeText: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeMe: {
    color: '#86EFAC',
  },
  timePeer: {
    color: '#6B7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#DCF2E4',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#F0FAF3',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 13,
    color: '#0A341B',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#15803D',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

