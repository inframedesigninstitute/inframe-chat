"use client"

import { useState } from "react"
import {
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"

interface Contact {
  id: string
  name: string
  phone: string
  avatar?: string
  status?: string
  initials?: string
  bgColor?: string
}

interface AddMemberModalProps {
  visible: boolean
  onClose: () => void
  onGroupCreated?: (group: {
    id: string
    name: string
    type: "group"
    lastMessage: string
    time: string
    unread: number
    isStarred: boolean
    isPinned: boolean
  }) => void
}

const ACTION_BUTTONS = [
  {
    id: "group",
    label: "New group",
    icon: "people",
    color: "#25D366",
  },
  {
    id: "contact",
    label: "New contact",
    icon: "person-add",
    color: "#25D366",
  },
]

const INITIAL_CONTACTS: Contact[] = [
  {
    id: "1",
    name: "Vikram Choudhary (You)",
    phone: "Message yourself",
    avatar: "🏔️",
    status: "Message yourself",
  },
  {
    id: "2",
    name: "+91 76074 65743",
    phone: "SI VIS PACEM, PARA BELLUM",
    avatar: "👨",
    bgColor: "#8B7355",
  },
  {
    id: "3",
    name: "+91 79755 45970",
    phone: "",
    avatar: "👨",
    bgColor: "#A0826D",
  },
  {
    id: "4",
    name: "+91 81569 86000",
    phone: "Hey there! I am using WhatsApp.",
    avatar: "SOXO",
    initials: "SOXO",
    bgColor: "#25D366",
  },
  {
    id: "5",
    name: "+91 83609 97713",
    phone: "Hey there! I am using WhatsApp.",
    avatar: "📱",
    bgColor: "#E8E8E8",
  },
  {
    id: "6",
    name: "+91 84080 08606",
    phone: "",
    avatar: "👤",
    bgColor: "#D3D3D3",
  },
]

const COUNTRIES = [
  { code: "IN", dial: "+91" },
  { code: "US", dial: "+1" },
  { code: "UK", dial: "+44" },
  { code: "AU", dial: "+61" },
]

export default function AddMemberModal({ visible, onClose, onGroupCreated }: AddMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeModal, setActiveModal] = useState<"main" | "newContact" | "newGroup">("main")
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("IN")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)

  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set())
  const [groupSearchQuery, setGroupSearchQuery] = useState("")

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredGroupContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) ||
      contact.phone.toLowerCase().includes(groupSearchQuery.toLowerCase()),
  )

  const handleActionButtonPress = (buttonId: string) => {
    if (buttonId === "contact") {
      setActiveModal("newContact")
    } else if (buttonId === "group") {
      setActiveModal("newGroup")
    }
  }

  const handleAddContact = () => {
    if (!firstName.trim() || !phoneNumber.trim()) {
      alert("Please fill in all required fields")
      return
    }

    const country = COUNTRIES.find((c) => c.code === selectedCountry)
    const fullPhone = `${country?.dial} ${phoneNumber}`
    const fullName = `${firstName}${lastName ? " " + lastName : ""}`

    const newContact: Contact = {
      id: String(contacts.length + 1),
      name: fullName,
      phone: "",
      avatar: firstName.charAt(0).toUpperCase(),
      bgColor: "#25D366",
    }

    setContacts([...contacts, newContact])
    setFirstName("")
    setLastName("")
    setPhoneNumber("")
    setSelectedCountry("IN")
    setActiveModal("main")
  }

  const toggleMemberSelection = (contactId: string) => {
    const newSelected = new Set(selectedMembers)
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId)
    } else {
      newSelected.add(contactId)
    }
    setSelectedMembers(newSelected)
  }

  const handleCreateGroup = () => {
    if (selectedMembers.size === 0) {
      alert("Please select at least one member")
      return
    }

    const selectedMembersList = Array.from(selectedMembers)
      .map((id) => contacts.find((c) => c.id === id)?.name)
      .filter(Boolean)

    const groupName = `Group (${selectedMembers.size})`
    const newGroup = {
      id: `group-${Date.now()}`,
      name: groupName,
      type: "group" as const,
      lastMessage: `${selectedMembersList.length} members added`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      unread: 0,
      isStarred: false,
      isPinned: false,
    }

    if (onGroupCreated) {
      onGroupCreated(newGroup)
    }

    setSelectedMembers(new Set())
    setGroupSearchQuery("")
    setActiveModal("main")
    onClose()
  }

  const renderActionButton = (button: (typeof ACTION_BUTTONS)[0]) => (
    <TouchableOpacity key={button.id} style={styles.actionButton} onPress={() => handleActionButtonPress(button.id)}>
      <View style={[styles.actionIcon, { backgroundColor: button.color }]}>
        <Ionicons name={button.icon as any} size={24} color="#fff" />
      </View>
      <Text style={styles.actionLabel}>{button.label}</Text>
    </TouchableOpacity>
  )

  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity style={styles.contactItem}>
      <View style={[styles.contactAvatar, { backgroundColor: item.bgColor || "#E8E8E8" }]}>
        {item.initials ? (
          <Text style={styles.initialsText}>{item.initials}</Text>
        ) : (
          <Text style={styles.avatarEmoji}>{item.avatar}</Text>
        )}
      </View>
      <View style={styles.contactDetails}>
        <Text style={styles.contactName}>{item.name}</Text>
        {item.phone && <Text style={styles.contactStatus}>{item.phone}</Text>}
      </View>
    </TouchableOpacity>
  )

  const renderGroupMemberItem = ({ item }: { item: Contact }) => {
    const isSelected = selectedMembers.has(item.id)
    return (
      <TouchableOpacity style={styles.groupMemberItem} onPress={() => toggleMemberSelection(item.id)}>
        <View style={[styles.contactAvatar, { backgroundColor: item.bgColor || "#E8E8E8" }]}>
          {item.initials ? (
            <Text style={styles.initialsText}>{item.initials}</Text>
          ) : (
            <Text style={styles.avatarEmoji}>{item.avatar}</Text>
          )}
        </View>
        <View style={styles.contactDetails}>
          <Text style={styles.contactName}>{item.name}</Text>
          {item.phone && <Text style={styles.contactStatus}>{item.phone}</Text>}
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
      </TouchableOpacity>
    )
  }

  const renderMainScreen = () => (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New chat</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search name or number"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.actionButtonsContainer}>{ACTION_BUTTONS.map(renderActionButton)}</View>

          <View style={styles.contactsSection}>
            <Text style={styles.sectionTitle}>Contacts on WhatsApp</Text>
            <View style={styles.divider} />
            <FlatList
              data={filteredContacts}
              keyExtractor={(item) => item.id}
              renderItem={renderContactItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )

  const renderNewContactScreen = () => (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setActiveModal("main")}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New contact</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            {/* First Name */}
            <View style={styles.formGroup}>
              <View style={styles.inputWithIcon}>
                <Ionicons name="person" size={20} color="#999" style={styles.formIcon} />
                <TextInput
                  style={styles.formInput}
                  placeholder="First name"
                  placeholderTextColor="#999"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
            </View>

            {/* Last Name */}
            <View style={styles.formGroup}>
              <TextInput
                style={styles.formInput}
                placeholder="Last name"
                placeholderTextColor="#999"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            {/* Country and Phone */}
            <View style={styles.countryPhoneRow}>
              <View style={styles.countrySection}>
                <View style={styles.inputWithIcon}>
                  <Ionicons name="call" size={20} color="#999" style={styles.formIcon} />
                  <TouchableOpacity
                    style={styles.countryDropdown}
                    onPress={() => setShowCountryDropdown(!showCountryDropdown)}
                  >
                    <Text style={styles.countryText}>
                      {COUNTRIES.find((c) => c.code === selectedCountry)?.code}{" "}
                      {COUNTRIES.find((c) => c.code === selectedCountry)?.dial}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#999" />
                  </TouchableOpacity>
                </View>

                {/* Country Dropdown */}
                {showCountryDropdown && (
                  <View style={styles.dropdownMenu}>
                    {COUNTRIES.map((country) => (
                      <TouchableOpacity
                        key={country.code}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedCountry(country.code)
                          setShowCountryDropdown(false)
                        }}
                      >
                        <Text style={styles.dropdownItemText}>
                          {country.code} {country.dial}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Phone Number */}
              <View style={styles.phoneSection}>
                <TextInput
                  style={styles.formInput}
                  placeholder="Phone"
                  placeholderTextColor="#999"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Add Button */}
            <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
              <Text style={styles.addButtonText}>Add Contact</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )

  const renderAddGroupScreen = () => (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setActiveModal("main")}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add group members</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search name or number"
              placeholderTextColor="#999"
              value={groupSearchQuery}
              onChangeText={setGroupSearchQuery}
            />
          </View>

          {/* Members List */}
          <View style={styles.contactsSection}>
            <FlatList
              data={filteredGroupContacts}
              keyExtractor={(item) => item.id}
              renderItem={renderGroupMemberItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </ScrollView>

        {/* Create Group Button */}
        {selectedMembers.size > 0 && (
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity style={styles.createGroupButton} onPress={handleCreateGroup}>
              <Text style={styles.createGroupButtonText}>Create Group ({selectedMembers.size})</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  )

  if (activeModal === "newContact") {
    return renderNewContactScreen()
  }

  if (activeModal === "newGroup") {
    return renderAddGroupScreen()
  }

  return renderMainScreen()
}

const styles = StyleSheet.create({
  container: {
    width: 500,
    backgroundColor: "#fff",
    alignSelf: "center",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#f3f3f3",
    borderRadius: 24,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#000",
    padding: 0,
  },
  actionButtonsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  contactsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  groupMemberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  initialsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
  },
  contactStatus: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#25D366",
    borderColor: "#25D366",
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 8,
  },
  formIcon: {
    marginRight: 12,
  },
  formInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    padding: 0,
  },
  countryPhoneRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  countrySection: {
    flex: 0.4,
  },
  phoneSection: {
    flex: 0.6,
  },
  countryDropdown: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  countryText: {
    fontSize: 14,
    color: "#000",
  },
  dropdownMenu: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#000",
  },
  addButton: {
    backgroundColor: "#25D366",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  createGroupButton: {
    backgroundColor: "#25D366",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  createGroupButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})
