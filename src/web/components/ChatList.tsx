import React, { useMemo, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export type Customer = {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
};

type ChatListProps = {
  title?: string;
  customers: Customer[];
  selectedId: string;
  onSelect: (id: string) => void;
};

const ChatList: React.FC<ChatListProps> = ({ title = 'Inbox', customers, selectedId, onSelect }) => {
  const [searchText, setSearchText] = useState('');

  const filtered = useMemo(
    () => customers.filter(c => c.name.toLowerCase().includes(searchText.toLowerCase())),
    [customers, searchText]
  );

  const renderItem = ({ item }: { item: Customer }) => (
    <TouchableOpacity
      style={[styles.listItem, selectedId === item.id && styles.listItemActive]}
      onPress={() => onSelect(item.id)}
    >
      <View style={styles.listAvatar}>
        <Text style={styles.listAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        {item.isOnline && <View style={styles.listOnlineDot} />}
      </View>
      <View style={styles.listInfo}>
        <View style={styles.listHeaderRow}>
          <Text style={styles.listName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.listTime}>{item.timestamp}</Text>
        </View>
        <Text style={styles.listLastMsg} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.listUnreadBadge}>
          <Text style={styles.listUnreadText}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.leftHeader}>
        <Text style={styles.leftHeaderTitle}>{title}</Text>
        <Ionicons name="settings-outline" size={18} color="#667085" />
      </View>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color="#98A2B3" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search user or messages"
          placeholderTextColor="#98A2B3"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  leftHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    height: 36,
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
    color: '#111827',
    fontSize: 13,
  },
  list: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F7',
    backgroundColor: '#fff',
  },
  listItemActive: {
    backgroundColor: '#F3F4F6',
  },
  listAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  listAvatarText: {
    color: '#fff',
    fontWeight: '700',
  },
  listOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  listInfo: { flex: 1 },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listName: { color: '#111827', fontSize: 14, fontWeight: '600', maxWidth: 150 },
  listTime: { color: '#6B7280', fontSize: 11 },
  listLastMsg: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  listUnreadBadge: {
    backgroundColor: '#111827',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  listUnreadText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});

export default ChatList;










