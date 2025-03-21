import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Post = {
  id: string;
  username: string;
  content: string;
  commentCount: number;
  timestamp: string;
  userAvatar: string;
}

const mockTrendingPosts: Post[] = [
  {
    id: '1',
    username: 'tech_enthusiast',
    content: 'Just launched my new AI project! Check it out and let me know what you think 🚀 #AI #Innovation',
    commentCount: 248,
    timestamp: '2h ago',
    userAvatar: 'https://api.a0.dev/assets/image?text=professional%20tech%20person%20profile%20picture&seed=1'
  },
  {
    id: '2',
    username: 'digital_nomad',
    content: 'Working from Bali today! The digital nomad life is truly amazing 🌴 #DigitalNomad #RemoteWork',
    commentCount: 248,
    timestamp: '3h ago',
    userAvatar: 'https://api.a0.dev/assets/image?text=digital%20nomad%20profile%20picture&seed=2'
  },
];

const PostCard = ({ post }: { post: Post }) => (
  <Pressable style={styles.postCard}>
    <View style={styles.postHeader}>
      <View style={styles.userInfo}>
        <img src={post.userAvatar} style={styles.avatar} alt={post.username} />
        <View>
          <Text style={styles.username}>{post.username}</Text>
          <Text style={styles.timestamp}>{post.timestamp}</Text>
        </View>
      </View>
      <MaterialCommunityIcons name="dots-vertical" size={24} color="#666" />
    </View>
    <Text style={styles.content}>{post.content}</Text>
    <View style={styles.stats}>
      <View style={styles.stat}>
        <MaterialCommunityIcons name="comment-outline" size={20} color="#666" />
        <Text style={styles.statText}>{post.commentCount} comments</Text>
      </View>
      <View style={styles.stat}>
        <MaterialCommunityIcons name="fire" size={20} color="#ff6b6b" />
        <Text style={styles.trendingText}>Trending</Text>
      </View>
    </View>
  </Pressable>
);

export default function TrendingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trending Posts</Text>
        <Text style={styles.headerSubtitle}>Most commented posts</Text>
      </View>
      <FlatList
        data={mockTrendingPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
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
  postCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  content: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  stats: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  statText: {
    marginLeft: 6,
    color: '#666',
  },
  trendingText: {
    marginLeft: 6,
    color: '#ff6b6b',
    fontWeight: '500',
  },
});