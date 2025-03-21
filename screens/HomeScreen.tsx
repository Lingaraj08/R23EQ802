import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type User = {
  id: string;
  username: string;
  postCount: number;
  avatar: string;
}

const mockTopUsers: User[] = [
  { id: '1', username: 'tech_enthusiast', postCount: 156, avatar: 'https://api.a0.dev/assets/image?text=professional%20tech%20person%20profile%20picture&seed=1' },
  { id: '2', username: 'digital_nomad', postCount: 143, avatar: 'https://api.a0.dev/assets/image?text=digital%20nomad%20profile%20picture&seed=2' },
  { id: '3', username: 'code_master', postCount: 132, avatar: 'https://api.a0.dev/assets/image?text=programmer%20profile%20picture&seed=3' },
  { id: '4', username: 'design_guru', postCount: 128, avatar: 'https://api.a0.dev/assets/image?text=designer%20profile%20picture&seed=4' },
  { id: '5', username: 'social_butterfly', postCount: 124, avatar: 'https://api.a0.dev/assets/image?text=social%20media%20influencer%20profile&seed=5' },
];

const UserCard = ({ user, rank }: { user: User; rank: number }) => (
  <View style={styles.userCard}>
    <View style={styles.rankContainer}>
      <Text style={styles.rankText}>#{rank}</Text>
    </View>
    <View style={styles.avatarContainer}>
      <img src={user.avatar} style={styles.avatar} alt={user.username} />
    </View>
    <View style={styles.userInfo}>
      <Text style={styles.username}>{user.username}</Text>
      <Text style={styles.postCount}>{user.postCount} posts</Text>
    </View>
    <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
  </View>
);

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Top Users</Text>
        <Text style={styles.headerSubtitle}>Based on post count</Text>
      </View>
      <FlatList
        data={mockTopUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <UserCard user={item} rank={index + 1} />
        )}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rankContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  postCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});