import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LocalDatabase from '../services/LocalDatabase';

interface Channel {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  isGroup?: boolean;
  isPinned?: boolean;
  avatar?: string;
}

interface ChannelItemWithLongPressProps {
  channel: Channel;
  onPress: () => void;
  onUpdate: () => void;
}

const ChannelItemWithLongPress: React.FC<ChannelItemWithLongPressProps> = ({
  channel,
  onPress,
  onUpdate,
}) => {
  const [showActions, setShowActions] = useState(false);

  const handleLongPress = () => {
    setShowActions(true);
  };

  const handlePin = async () => {
    try {
      await LocalDatabase.pinChannel(channel.id, !channel.isPinned);
      setShowActions(false);
      onUpdate();
      Alert.alert('Success', `Chat ${channel.isPinned ? 'unpinned' : 'pinned'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to pin/unpin chat');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Chat',
      `Are you sure you want to delete "${channel.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await LocalDatabase.deleteChannel(channel.id);
              setShowActions(false);
              onUpdate();
              Alert.alert('Success', 'Chat deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete chat');
            }
          },
        },
      ]
    );
  };

  const handleStar = () => {
    Alert.alert('Star Chat', `Star "${channel.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Star', onPress: () => {
        setShowActions(false);
        Alert.alert('Success', 'Chat starred');
      }},
    ]);
  };

  const handleForward = () => {
    Alert.alert('Forward', `Forward "${channel.name}" info?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Forward', onPress: () => {
        setShowActions(false);
        Alert.alert('Success', 'Info forwarded');
      }},
    ]);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.channelItem, channel.isPinned && styles.pinnedChannel]}
        onPress={onPress}
        onLongPress={handleLongPress}
      >
        {/* Pin indicator */}
        {channel.isPinned && (
          <View style={styles.pinIndicator}>
            <Ionicons name="pin" size={12} color="#075E54" />
          </View>
        )}

        <View style={styles.avatarContainer}>
          {channel.avatar ? (
            <Image source={{ uri: channel.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.avatarText}>
                {channel.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {channel.isGroup && (
            <View style={styles.groupIndicator}>
              <Ionicons name="people" size={12} color="#fff" />
            </View>
          )}
        </View>

        <View style={styles.channelInfo}>
          <View style={styles.channelHeader}>
            <Text style={styles.channelName} numberOfLines={1}>
              {channel.name}
            </Text>
            <Text style={styles.timestamp}>{channel.timestamp}</Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {channel.lastMessage}
          </Text>
        </View>

        {channel.unread && channel.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {channel.unread > 99 ? '99+' : channel.unread}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Actions Modal */}
      <Modal
        visible={showActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowActions(false)}
        >
          <View style={styles.actionsMenu}>
            <TouchableOpacity style={styles.actionItem} onPress={handlePin}>
              <Ionicons 
                name={channel.isPinned ? "pin" : "pin-outline"} 
                size={20} 
                color="#075E54" 
              />
              <Text style={styles.actionText}>
                {channel.isPinned ? 'Unpin' : 'Pin'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleStar}>
              <Ionicons name="star-outline" size={20} color="#FFD700" />
              <Text style={styles.actionText}>Star</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleForward}>
              <Ionicons name="arrow-forward" size={20} color="#075E54" />
              <Text style={styles.actionText}>Forward</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleDelete}>
              <Ionicons name="trash" size={20} color="#FF3B30" />
              <Text style={[styles.actionText, { color: '#FF3B30' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    position: 'relative',
  },
  pinnedChannel: {
    backgroundColor: '#f8f9fa',
  },
  pinIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#075E54',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  groupIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#075E54',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelInfo: {
    flex: 1,
    marginRight: 12,
  },
  channelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  channelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  unreadBadge: {
    backgroundColor: '#075E54',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsMenu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#000',
  },
});

export default ChannelItemWithLongPress;
