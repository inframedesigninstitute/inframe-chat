import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

const CreateGroupScreen = () => {
  const navigation = useNavigation();
  const [groupName, setGroupName] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');

  const contacts: Contact[] = [
    { id: '1', name: 'Andrew Jones', phone: '+1 234 567 8900' },
    { id: '2', name: 'Bryce Mosley', phone: '+1 234 567 8901' },
    { id: '3', name: 'Donald Lundee Jr.', phone: '+1 234 567 8902' },
    { id: '4', name: 'Sarah Wilson', phone: '+1 234 567 8903' },
    { id: '5', name: 'Mike Johnson', phone: '+1 234 567 8904' },
    { id: '6', name: 'Emma Davis', phone: '+1 234 567 8905' },
    { id: '7', name: 'John Smith', phone: '+1 234 567 8906' },
    { id: '8', name: 'Lisa Brown', phone: '+1 234 567 8907' },
  ];

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchText.toLowerCase()) ||
    contact.phone.includes(searchText)
  );

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedContacts.length > 0) {
      // TODO: Create group logic
      console.log('Creating group:', groupName, 'with contacts:', selectedContacts);
      navigation.goBack();
    }
  };

  const renderContact = ({ item }: { item: Contact }) => {
    const isSelected = selectedContacts.includes(item.id);
    
    return (
      <TouchableOpacity
        style={styles.contactItem}
        onPress={() => toggleContactSelection(item.id)}
      >
        <View style={styles.contactInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.contactDetails}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactPhone}>{item.phone}</Text>
          </View>
        </View>
        <View style={[
          styles.checkbox,
          isSelected && styles.checkboxSelected
        ]}>
          {isSelected && (
            <Ionicons name="checkmark" size={16} color="#fff" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Group</Text>
        <TouchableOpacity
          style={[
            styles.createButton,
            (!groupName.trim() || selectedContacts.length === 0) && styles.createButtonDisabled
          ]}
          onPress={handleCreateGroup}
          disabled={!groupName.trim() || selectedContacts.length === 0}
        >
          <Text style={[
            styles.createButtonText,
            (!groupName.trim() || selectedContacts.length === 0) && styles.createButtonTextDisabled
          ]}>
            Create
          </Text>
        </TouchableOpacity>
      </View>

      {/* Group Name Input */}
      <View style={styles.groupNameSection}>
        <View style={styles.groupAvatar}>
          <Text style={styles.groupAvatarText}>
            {groupName ? groupName.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <TextInput
          style={styles.groupNameInput}
          placeholder="Group name"
          value={groupName}
          onChangeText={setGroupName}
          maxLength={25}
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          placeholder="Search contacts"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
      </View>

      {/* Selected Contacts Count */}
      <View style={styles.selectedSection}>
        <Text style={styles.selectedText}>
          {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
        </Text>
      </View>

      {/* Contacts List */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContact}
        style={styles.contactsList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', marginBottom:40, marginTop:35
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  createButton: {
    backgroundColor: '#075E54',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  createButtonTextDisabled: {
    color: '#999',
  },
  groupNameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  groupAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#075E54',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  groupAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  groupNameInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  selectedSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selectedText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  contactsList: {
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#075E54',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#075E54',
    borderColor: '#075E54',
  },
});

export default CreateGroupScreen;

