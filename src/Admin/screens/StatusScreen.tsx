import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Modal, Dimensions 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const THEME_BOX_WIDTH = (width - 60) / 3;

type ThemeOption = 'System default' | 'Light' | 'Dark';
type AppScreen = 'Chats' | 'ChatThemeSelection';

interface ThemeDialogProps {
  isVisible: boolean;
  onClose: () => void;
  currentTheme: ThemeOption;
  onThemeSelect: (theme: ThemeOption) => void;
}

const ThemeDialog: React.FC<ThemeDialogProps> = ({ isVisible, onClose, currentTheme, onThemeSelect }) => {
  const [selected, setSelected] = useState<ThemeOption>(currentTheme);
  const handleOK = () => { onThemeSelect(selected); onClose(); };

  return (
    <Modal transparent visible={isVisible} onRequestClose={onClose} animationType="fade">
      <View style={dialogStyles.overlay}>
        <View style={dialogStyles.dialogContainer}>
          <Text style={dialogStyles.title}>Choose theme</Text>
          {['System default', 'Light', 'Dark'].map((themeName) => (
            <TouchableOpacity
              key={themeName}
              style={dialogStyles.optionRow}
              onPress={() => setSelected(themeName as ThemeOption)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={selected === themeName ? 'radiobox-marked' : 'radiobox-blank'}
                size={24}
                color={selected === themeName ? '#075E54' : '#888'}
              />
              <Text style={dialogStyles.optionText}>{themeName}</Text>
            </TouchableOpacity>
          ))}
          <View style={dialogStyles.buttonContainer}>
            <TouchableOpacity onPress={onClose}><Text style={dialogStyles.buttonText}>CANCEL</Text></TouchableOpacity>
            <TouchableOpacity onPress={handleOK}><Text style={dialogStyles.buttonText}>OK</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface SettingsItemProps {
  iconName: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  iconName, title, subtitle, onPress, isToggle = false, toggleValue, onToggleChange,
}) => (
  <TouchableOpacity
    style={styles.itemContainer}
    onPress={onPress}
    disabled={isToggle && !onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <MaterialCommunityIcons name={iconName as any} size={24} color="#555" style={styles.icon} /> 
    <View style={styles.textContainer}>
      <Text style={styles.titleText}>{title}</Text>
      {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
    </View>
    {isToggle && onToggleChange && (
      <Switch
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={toggleValue ? '#075E54' : '#f4f3f4'}
        onValueChange={onToggleChange}
        value={toggleValue}
      />
    )}
  </TouchableOpacity>
);

const DUMMY_THEMES = [
  { id: '1', label: 'Default', isSelected: true, backgroundColor: '#f0fff0', borderColor: '#075E54' },
  { id: '2', label: 'Create with AI', isSelected: false, backgroundColor: '#f4f7fc', borderColor: '#eee' },
  { id: '3', label: 'Green', isSelected: false, backgroundColor: '#e8f5e9', borderColor: '#eee' },
  { id: '4', label: 'Pink/Purple', isSelected: false, backgroundColor: '#f0e0ff', borderColor: '#eee' },
  { id: '5', label: 'Coral/Pink', isSelected: false, backgroundColor: '#ffefe0', borderColor: '#eee' },
  { id: '6', label: 'Orange/Yellow', isSelected: false, backgroundColor: '#fff5e0', borderColor: '#eee' },
  { id: '7', label: 'Ocean', isSelected: false, backgroundColor: '#e0f0ff', borderColor: '#eee' },
];

interface ChatThemeSelectionProps {
  onBack: () => void;
}

const ChatThemeSelectionScreen: React.FC<ChatThemeSelectionProps> = ({ onBack }) => {
  const [themes, setThemes] = useState(DUMMY_THEMES);

  const handleThemeSelect = (id: string) => {
    setThemes(themes.map(theme => ({
      ...theme,
      isSelected: theme.id === id,
    })));
  };

  return (
    <View style={themeStyles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={themeStyles.headerTitle}>Chat theme</Text>
        <MaterialCommunityIcons name="dots-vertical" size={24} color="#333" style={themeStyles.headerMenu} />
      </View>

      <ScrollView contentContainerStyle={themeStyles.scrollContent}>
        <Text style={themeStyles.sectionHeader}>Themes</Text>
        <View style={themeStyles.themeGrid}>
          {themes.map((theme) => (
            <TouchableOpacity 
              key={theme.id} 
              style={[
                themeStyles.themeBox, 
                { backgroundColor: theme.backgroundColor, borderColor: theme.isSelected ? themeStyles.selectedThemeBox.borderColor : themeStyles.themeBox.borderColor, borderWidth: theme.isSelected ? themeStyles.selectedThemeBox.borderWidth : themeStyles.themeBox.borderWidth }
              ]}
              onPress={() => handleThemeSelect(theme.id)}
            >
              <View style={themeStyles.chatBubbleContainer}>
                <View style={[themeStyles.chatBubble, themeStyles.outgoingBubble]} />
                <View style={[themeStyles.chatBubble, themeStyles.incomingBubble]} />
              </View>
              {theme.label === 'Create with AI' && (
                <View style={themeStyles.aiContainer}>
                  <MaterialCommunityIcons name="star-four-points-outline" size={16} color="#333" />
                  <Text style={themeStyles.aiText}>Create with AI</Text>
                </View>
              )}
              {theme.isSelected && (
                <View style={themeStyles.checkmarkContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#075E54" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default function StatusScreen() {
  const navigation = useNavigation(); // ✅ Move inside component

  const [currentScreen, setCurrentScreen] = useState<AppScreen>('Chats');
  const [isThemeDialogVisible, setIsThemeDialogVisible] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeOption>('System default');
  const [isMediaVisible, setIsMediaVisible] = useState(true);
  const [isEnterSend, setIsEnterSend] = useState(false);
  const [keepChatsArchived, setKeepChatsArchived] = useState(true);

  const handleThemeSelect = (theme: ThemeOption) => {
    setCurrentTheme(theme);
  };

  const renderChatsScreen = () => (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theme Screen</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.sectionHeader}>Display</Text>
        <SettingsItem
          iconName="theme-light-dark"
          title="Theme"
          subtitle={currentTheme}
          onPress={() => setIsThemeDialogVisible(true)}
        />
        <SettingsItem
          iconName="wallpaper"
          title="Default chat theme"
          subtitle="System default"
          onPress={() => setCurrentScreen('ChatThemeSelection')}
        />
      </ScrollView>

      <ThemeDialog
        isVisible={isThemeDialogVisible}
        onClose={() => setIsThemeDialogVisible(false)}
        currentTheme={currentTheme}
        onThemeSelect={handleThemeSelect}
      />
    </View>
  );

  if (currentScreen === 'ChatThemeSelection') {
    return <ChatThemeSelectionScreen onBack={() => setCurrentScreen('Chats')} />;
  }

  return renderChatsScreen();
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  screen: { flex: 1, backgroundColor: '#fff', paddingTop: 35 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 20, color: '#333' },
  scrollContainer: { flex: 1 },
  sectionHeader: { fontSize: 14, fontWeight: 'bold', color: '#075E54', paddingHorizontal: 15, paddingTop: 20, paddingBottom: 5, textTransform: 'uppercase' },
  itemContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12 },
  icon: { width: 40 },
  textContainer: { flex: 1, marginLeft: 10 },
  titleText: { fontSize: 16, color: '#333' },
  subtitleText: { fontSize: 14, color: '#777', marginTop: 2 },
});

const themeStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', paddingTop: 35 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 20, color: '#333', flex: 1 },
  headerMenu: { marginRight: 10 },
  scrollContent: { padding: 15 },
  sectionHeader: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10, marginTop: 15 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  themeBox: { width: THEME_BOX_WIDTH, height: THEME_BOX_WIDTH * 1.5, borderRadius: 15, borderWidth: 2, borderColor: '#eee', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  selectedThemeBox: { borderWidth: 3, borderColor: '#075E54' },
  chatBubbleContainer: { position: 'absolute', top: 15, left: 5, right: 5, height: '80%', justifyContent: 'space-between', alignItems: 'flex-start' },
  chatBubble: { height: 25, borderRadius: 12, paddingHorizontal: 10, justifyContent: 'center', position: 'absolute' },
  outgoingBubble: { width: '60%', backgroundColor: '#00e676', alignSelf: 'flex-end', top: 10 },
  incomingBubble: { width: '50%', backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc', alignSelf: 'flex-start', bottom: 5 },
  aiContainer: { position: 'absolute', top: 5, left: 5, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  aiText: { fontSize: 10, fontWeight: 'bold', color: '#333', marginLeft: 3 },
  checkmarkContainer: { position: 'absolute', bottom: 5, right: 5, backgroundColor: 'white', borderRadius: 15, zIndex: 10 },
});

const dialogStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  dialogContainer: { width: '80%', backgroundColor: 'white', borderRadius: 10, padding: 20, elevation: 5 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 20, color: '#333' },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  optionText: { marginLeft: 15, fontSize: 16, color: '#333' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, paddingTop: 10 },
  buttonText: { fontSize: 14, fontWeight: '600', color: '#075E54', marginLeft: 25, paddingVertical: 5 },
});
