import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { toast } from 'sonner-native';

type Post = {
  id: string;
  username: string;
  content: string;
  likes: number;
  comments: number;
  timestamp: string;
  userAvatar: string;
}

// Websocket connection
const WS_URL = 'ws://localhost:8080';
let ws: WebSocket | null = null;

const PostCard = ({ post, animationValue = new Animated.Value(1) }: { post: Post, animationValue?: Animated.Value }) => {
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.likes);

  const handleLike = () => {
    Animated.sequence([
      Animated.spring(animationValue, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.spring(animationValue, {
        toValue: 1,
        useNativeDriver: true,
      })
    ]).start();

    setLiked(!liked);
    setLocalLikes(liked ? localLikes - 1 : localLikes + 1);
  };

  return (
    <Animated.View style={[styles.postCard, { transform: [{ scale: animationValue }] }]}>
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
      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={handleLike}>
          <MaterialCommunityIcons 
            name={liked ? "heart" : "heart-outline"} 
            size={24} 
            color={liked ? "#ff6b6b" : "#666"} 
          />
          <Text style={[styles.actionText, liked && styles.likedText]}>{localLikes}</Text>
        </Pressable>
        <View style={styles.actionButton}>
          <MaterialCommunityIcons name="comment-outline" size={24} color="#666" />
          <Text style={styles.actionText}>{post.comments}</Text>
        </View>
        <View style={styles.actionButton}>
          <MaterialCommunityIcons name="share-outline" size={24} color="#666" />
        </View>
      </View>
    </Animated.View>
  );
};

const LoadingSkeleton = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonHeader}>
      <View style={styles.skeletonAvatar} />
      <View style={styles.skeletonText} />
    </View>
    <View style={styles.skeletonContent} />
    <View style={styles.skeletonActions} />
  </View>
);

export default function FeedScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const newPostAnimation = useRef(new Animated.Value(0)).current;

  const connectWebSocket = () => {
    ws = new WebSocket(WS_URL);
    
    ws.onmessage = (event) => {
      const newPost = JSON.parse(event.data);
      setPosts(prev => [newPost, ...prev]);
      
      // Animate new post entry
      Animated.sequence([
        Animated.timing(newPostAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(newPostAnimation, {
          toValue: 1,
          tension: 20,
          useNativeDriver: true,
        })
      ]).start();
    };

    ws.onerror = () => {
      toast.error('WebSocket connection error');
    };
  };

  const fetchPosts = async (pageNum: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/posts?page=${pageNum}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      
      const data = await response.json();
      setPosts(prev => pageNum === 1 ? data : [...prev, ...data]);
      setError(null);
    } catch (err) {
      setError('Failed to load posts');
      toast.error('Error loading posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
    connectWebSocket();

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchPosts(1);
  }, []);

  const loadMore = () => {
    if (!loading) {
      setPage(prev => prev + 1);
      fetchPosts(page + 1);
    }
  };

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feed</Text>
        <MaterialCommunityIcons name="plus" size={24} color="#333" />
      </View>
      
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <PostCard 
            post={item} 
            animationValue={index === 0 ? newPostAnimation : undefined}
          />
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={loading ? Array(3).fill(null).map((_, i) => (
          <LoadingSkeleton key={i} />
        )) : null}
        ListFooterComponent={loading && posts.length > 0 ? (
          <ActivityIndicator style={styles.loader} color="#ff6b6b" />
        ) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  actions: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    marginLeft: 6,
    color: '#666',
    fontSize: 14,
  },
  likedText: {
    color: '#ff6b6b',
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  retryButton: {
    padding: 12,
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  skeletonCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  skeletonText: {
    width: 150,
    height: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  skeletonContent: {
    height: 60,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 16,
  },
  skeletonActions: {
    height: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    width: '50%',
  },
});