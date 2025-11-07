import type { RootState } from '@/src/Redux/Store/store';
import axios from 'axios';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';

const API_BASE_URL = "http://localhost:5200/web";

interface Channel {
  id: string; // yahan id = member id (mId)
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
  onDelete: (mId: string) => void; // member id delete hone ke baad callback
}

const ChannelItemWithLongPress: React.FC<ChannelItemWithLongPressProps> = ({
  channel,
  onPress,
  onUpdate,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false);

  // ✅ Redux se token & facultyId nikal rahe hain
  const token = useSelector((state: RootState) => state.facultyStore.token);
  const facultyId = useSelector((state: RootState) => state.facultyStore.user?.id);

  const handleLongPress = () => setShowActions(true);

  const handlePin = async () => {
    try {
      setShowActions(false);
      onUpdate();
      Alert.alert('Success', `Chat ${channel.isPinned ? 'unpinned' : 'pinned'}`);
    } catch {
      Alert.alert('Error', 'Failed to pin/unpin chat');
    }
  };

  // ✅ Backend ke accoding fix kiya gaya function
  const handleDelete = async (mId: string) => {

    const { data } = await axios.post(
      `${API_BASE_URL}/main-admin/remove-member/${mId}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(data)

    // try {
    //   if (!token) {
    //     Alert.alert('Error', 'Authentication token not found.');
    //     return;
    //   }
    //   if (!facultyId) {
    //     Alert.alert('Error', 'Faculty ID not found.');
    //     return;
    //   }

    //   const { data } = await axios.post(
    //     `${API_BASE_URL}/faculty/remove-member/${mId}`,
    //     {},
    //     {
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: `Bearer ${token}`,
    //       },
    //     }
    //   );

    //   console.log("Delete API response:", data);

    //   if (data.status === 1) {
    //     onDelete(mId);
    //     console.log("Delete clicked, mId sfsadf");

    //     Alert.alert('Success', 'Member removed successfully');
    //   } else {
    //     Alert.alert('Error', data.msg || 'Failed to remove member');
    //   }
    // } catch (error) {
    //   console.error("Error deleting member:", error);
    //   Alert.alert('Error', 'An error occurred while removing the member');
    // } finally {
    //   setShowActions(false);
    // }
  };


  return (
    <>
      <TouchableOpacity
        style={[styles.channelItem, channel.isPinned && styles.pinnedChannel]}
        onPress={onPress}
        onLongPress={handleLongPress}
      >
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

      <Modal
        visible={showActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActions(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setShowActions(false)}
          />

          <View style={styles.actionsMenu}>
            <TouchableOpacity style={styles.actionItem} onPress={handlePin}>
              <Ionicons
                name={channel.isPinned ? 'pin' : 'pin-outline'}
                size={20}
                color="#075E54"
              />
              <Text style={styles.actionText}>
                {channel.isPinned ? 'Unpin' : 'Pin'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                // console.log('Deleting member ID:', channel.id);
                handleDelete(channel.id);
              }}
            >
              <Ionicons name="trash" size={20} color="#FF3B30" />
              <Text style={[styles.actionText, { color: '#FF3B30' }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  },
  pinnedChannel: { backgroundColor: '#f8f9fa' },
  pinIndicator: { position: 'absolute', top: 8, right: 8 },
  avatarContainer: { position: 'relative', marginRight: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#075E54',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
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
  channelInfo: { flex: 1, marginRight: 12 },
  channelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  channelName: { fontSize: 16, fontWeight: '600', color: '#000', flex: 1 },
  timestamp: { fontSize: 12, color: '#999' },
  lastMessage: { fontSize: 14, color: '#666' },
  unreadBadge: {
    backgroundColor: '#075E54',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: { fontSize: 11, fontWeight: 'bold', color: '#fff' },
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
    elevation: 5,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionText: { marginLeft: 12, fontSize: 16, color: '#000' },
});

export default ChannelItemWithLongPress;
