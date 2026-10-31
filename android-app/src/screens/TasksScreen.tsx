import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2, Circle, Gift, ExternalLink } from 'lucide-react-native';
import { OrbBackground } from '../components/OrbBackground';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

interface Task {
  id: string;
  title: string;
  reward: string;
  completed: boolean;
  category: string;
}

export const TasksScreen: React.FC = () => {
  const navigation = useNavigation();
  const { claimCommission } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 't1',
      title: 'Follow GT Network Official on X',
      reward: '+5.00 GT',
      completed: true,
      category: 'Social',
    },
    {
      id: 't2',
      title: 'Join Telegram Community Group',
      reward: '+5.00 GT',
      completed: false,
      category: 'Social',
    },
    {
      id: 't3',
      title: 'Complete 3 Consecutive Mining Cycles',
      reward: '+10.00 GT',
      completed: false,
      category: 'Protocol',
    },
    {
      id: 't4',
      title: 'Invite 3 Friends to Validator Network',
      reward: '+15.00 GT',
      completed: false,
      category: 'Referral',
    },
  ]);

  const handleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && !t.completed) {
          claimCommission(5.0);
          Alert.alert('Task Completed!', 'Reward of +5.00 GT credited to your wallet.');
          return { ...t, completed: true };
        }
        return t;
      })
    );
  };

  return (
    <View style={styles.container}>
      <OrbBackground />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color="#0A341B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>GT TASKS & BOUNTIES</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Banner */}
          <View style={styles.bannerCard}>
            <Gift size={24} color="#15803D" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.bannerTitle}>Earn Additional GT Coins</Text>
              <Text style={styles.bannerDesc}>
                Complete community bounties and social verifications.
              </Text>
            </View>
          </View>

          {/* Task list */}
          <View style={styles.taskListCard}>
            <Text style={styles.sectionTitle}>AVAILABLE BOUNTIES</Text>

            {tasks.map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <TouchableOpacity
                  onPress={() => handleComplete(task.id)}
                  style={{ marginRight: 12 }}
                >
                  {task.completed ? (
                    <CheckCircle2 size={22} color="#15803D" />
                  ) : (
                    <Circle size={22} color="#9CA3AF" />
                  )}
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.taskTitle,
                      task.completed && styles.taskTitleCompleted,
                    ]}
                  >
                    {task.title}
                  </Text>
                  <Text style={styles.taskCategory}>{task.category}</Text>
                </View>

                <View
                  style={[
                    styles.rewardBadge,
                    task.completed && styles.rewardBadgeCompleted,
                  ]}
                >
                  <Text
                    style={[
                      styles.rewardText,
                      task.completed && styles.rewardTextCompleted,
                    ]}
                  >
                    {task.reward}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF8EE',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0A341B',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  bannerCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0A341B',
  },
  bannerDesc: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 2,
  },
  taskListCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0A341B',
  },
  taskTitleCompleted: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  taskCategory: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  rewardBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rewardBadgeCompleted: {
    backgroundColor: '#F3F4F6',
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  rewardTextCompleted: {
    color: '#9CA3AF',
  },
});

