import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface SuggestedContact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  mutualContacts?: number;
}

const AddContactScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<SuggestedContact[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const suggestedContacts: SuggestedContact[] = [
    { id: '1', name: 'Alice Johnson', phone: '+1 234 567 8901', mutualContacts: 5 },
    { id: '2', name: 'Bob Smith', phone: '+1 234 567 8902', mutualContacts: 3 },
    { id: '3', name: 'Carol Davis', phone: '+1 234 567 8903', mutualContacts: 8 },
    { id: '4', name: 'David Wilson', phone: '+1 234 567 8904', mutualContacts: 2 },
    { id: '5', name: 'Eva Brown', phone: '+1 234 567 8905', mutualContacts: 6 },
  ];

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.length > 0) {
      setIsSearching(true);
      // Simulate search results
      setTimeout(() => {
        const results = suggestedContacts.filter(contact =>
          contact.name.toLowerCase().includes(text.toLowerCase()) ||
          contact.phone.includes(text)
        );
        setSearchResults(results);
        setIsSearching(false);
      }, 500);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const handleAddContact = (contact: SuggestedContact) => {
    Alert.alert(
      'Add Contact',
      `Add ${contact.name} to your contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add', 
          onPress: () => {
            Alert.alert('Success', `${contact.name} has been added to your contacts!`);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleInviteContact = (phone: string) => {
    Alert.alert(
      'Invite Contact',
      `Send an invitation to ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Invite', 
          onPress: () => {
            Alert.alert('Invitation Sent', `Invitation sent to ${phone}!`);
          }
        }
      ]
    );
  };

  const renderContact = ({ item }: { item: SuggestedContact }) => (
    <View style={styles.contactItem}>
      <View style={styles.contactInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.contactDetails}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactPhone}>{item.phone}</Text>
          {item.mutualContacts && (
            <Text style={styles.mutualContacts}>
              {item.mutualContacts} mutual contact{item.mutualContacts !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddContact(item)}
      >
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchResult = ({ item }: { item: SuggestedContact }) => (
    <View style={styles.contactItem}>
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
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddContact(item)}
      >
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No contacts found</Text>
      <Text style={styles.emptySubtitle}>
        Try searching with a different name or phone number
      </Text>
    </View>
  );

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
        <Text style={styles.headerTitle}>Add Friend</Text>
        <View style={styles.headerButton} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          placeholder="Search name or phone number"
          value={searchText}
          onChangeText={handleSearch}
          style={styles.searchInput}
          autoFocus
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {searchText.length === 0 ? (
        <>
          {/* Suggested Contacts */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Suggested for you</Text>
          </View>
          <FlatList
            data={suggestedContacts}
            keyExtractor={(item) => item.id}
            renderItem={renderContact}
            style={styles.contactsList}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <>
          {/* Search Results */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {isSearching ? 'Searching...' : 'Search Results'}
            </Text>
          </View>
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={renderSearchResult}
              style={styles.contactsList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySubtitle}>
                No contacts found for "{searchText}"
              </Text>
              <TouchableOpacity
                style={styles.inviteButton}
                onPress={() => handleInviteContact(searchText)}
              >
                <Text style={styles.inviteButtonText}>
                  Invite {searchText}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
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
    marginBottom: 2,
  },
  mutualContacts: {
    fontSize: 12,
    color: '#075E54',
  },
  addButton: {
    backgroundColor: '#075E54',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  inviteButton: {
    backgroundColor: '#075E54',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddContactScreen;

