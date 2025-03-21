import React from 'react';
import { View, Text, Image } from 'react-native';

const UserCard = ({ user }) => {
  return (
    <View>
      <Image source={{ uri: user.image }} style={{ width: 100, height: 100 }} />
      <Text>{user.name}</Text>
    </View>
  );
};

export default UserCard;