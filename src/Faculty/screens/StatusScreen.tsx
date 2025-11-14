import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const BackIcon = () => <Text style={styles.iconText}>{'<'}</Text>;
const ChevronRightIcon = () => <Text style={styles.iconText}>{'>'}</Text>;
const CheckIcon = () => <Text style={styles.checkText}>{'✓'}</Text>;
const RadioFilledIcon = () => <Text style={styles.radioText}>●</Text>;
const RadioEmptyIcon = () => <Text style={styles.radioEmptyText}>○</Text>;

// Type Definitions
type ColorTheme = string;
type NightMode = 'always' | 'scheduled' | 'device' | 'disable';
type BackgroundType = 'color' | 'wallpaper' | 'gallery';

interface ChatBackground {
  type: BackgroundType;
  value: string;
}

interface AppSettings {
  colorTheme: ColorTheme;
  nightMode: NightMode;
  chatBackground: ChatBackground;
}

// Data Constants
const THEME_COLORS = [
  { id: 'blue', color: '#4A5AC7', label: 'Blue' },
  { id: 'pink', color: '#E91E8C', label: 'Pink' },
  { id: 'green', color: '#1B9B6F', label: 'Green' },
  { id: 'cyan', color: '#0099D8', label: 'Cyan' },
  { id: 'orange', color: '#FF8C00', label: 'Orange' },
  { id: 'teal', color: '#0B7285', label: 'Teal' },
];

const NIGHT_MODE_OPTIONS = [
  { id: 'always', label: 'Enable always' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'device', label: 'Sync with device setting' },
  { id: 'disable', label: 'Disable' },
];

const BACKGROUND_COLORS = [
  { id: 'cream', color: '#FEF5E7', label: 'Cream' },
  { id: 'light-gray', color: '#ECEDEE', label: 'Light Gray' },
  { id: 'light-blue', color: '#B3E5FC', label: 'Light Blue' },
  { id: 'light-pink', color: '#F8BBD0', label: 'Light Pink' },
  { id: 'light-coral', color: '#FFCCBC', label: 'Light Coral' },
  { id: 'periwinkle', color: '#C5CAE9', label: 'Periwinkle' },
];

const WALLPAPER_IMAGES = [
  { id: 'green-leaf', color: '#2d5016', label: 'Green Leaf' },
  { id: 'bokeh', color: '#8B6914', label: 'Golden Bokeh' },
  { id: 'ocean', color: '#4A90A4', label: 'Ocean' },
  { id: 'sand', color: '#C9B89F', label: 'Sandy Beach' },
  { id: 'fire', color: '#CC3300', label: 'Fire' },
];

const GALLERY_ITEMS = [
  { id: 'color-themes', colors: ['#4A5AC7', '#E91E8C', '#1B9B6F'], label: 'Color Themes' },
  { id: 'web-world', color: '#0066CC', label: 'Web World' },
  { id: 'hindi-post', color: '#FDD835', label: 'Hindi Post' },
];

// Main Component
const StatusScreen = () => {
  const [currentScreen, setCurrentScreen] = useState<'appearance' | 'chatBackground'>('appearance');
  const [appSettings, setAppSettings] = useState<AppSettings>({
    colorTheme: THEME_COLORS[0].color,
    nightMode: 'device',
    chatBackground: { type: 'color', value: BACKGROUND_COLORS[0].color },
  });

  const updateSettings = (updates: Partial<AppSettings>) => {
    setAppSettings(prev => ({ ...prev, ...updates }));
  };

  const isColorSelected = (color: string): boolean => {
    return appSettings.colorTheme === color;
  };

  const isNightModeSelected = (mode: NightMode): boolean => {
    return appSettings.nightMode === mode;
  };

  const isChatBackgroundSelected = (type: BackgroundType, value: string): boolean => {
    return appSettings.chatBackground.type === type && appSettings.chatBackground.value === value;
  };

  // ===== APPEARANCE SCREEN =====
  const renderAppearanceScreen = () => (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appearance</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Color Themes Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Color themes</Text>
          <View style={styles.colorGrid}>
            {THEME_COLORS.map(({ id, color }) => (
              <TouchableOpacity
                key={id}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  isColorSelected(color) && styles.colorButtonSelected,
                ]}
                onPress={() => updateSettings({ colorTheme: color })}
              >
                {isColorSelected(color) && <CheckIcon />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Night Mode Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Night mode</Text>
          {NIGHT_MODE_OPTIONS.map(({ id, label }) => (
            <TouchableOpacity
              key={id}
              style={styles.listItem}
              onPress={() => updateSettings({ nightMode: id as NightMode })}
            >
              <Text style={styles.listItemText}>{label}</Text>
              <View style={styles.radioContainer}>
                {isNightModeSelected(id as NightMode) ? <RadioFilledIcon /> : <RadioEmptyIcon />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chat Background Section */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => setCurrentScreen('chatBackground')}
        >
          <View style={styles.chatBackgroundHeader}>
            <View>
              <Text style={styles.listItemText}>Chat background</Text>
              <Text style={styles.subtitleText}>Change the background for your chat screen.</Text>
            </View>
            <ChevronRightIcon />
          </View>
          <View
            style={[
              styles.chatPreview,
              { backgroundColor: appSettings.chatBackground.value },
            ]}
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

  // ===== CHAT BACKGROUND SCREEN =====
  const renderChatBackgroundScreen = () => (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('appearance')}
        >
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat background</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Colors Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleLarge}>Colors</Text>
            <ChevronRightIcon />
          </View>
          <View style={styles.colorGrid}>
            {BACKGROUND_COLORS.map(({ id, color }) => (
              <TouchableOpacity
                key={id}
                style={[
                  styles.colorTile,
                  { backgroundColor: color },
                  isChatBackgroundSelected('color', color) && styles.tileSelected,
                ]}
                onPress={() => updateSettings({ chatBackground: { type: 'color', value: color } })}
              >
                {isChatBackgroundSelected('color', color) && <CheckIcon />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Wallpapers Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleLarge}>Wallpapers</Text>
            <ChevronRightIcon />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wallpaperScroll}>
            {WALLPAPER_IMAGES.map(({ id, color, label }) => (
              <TouchableOpacity
                key={id}
                style={[
                  styles.wallpaperTile,
                  { backgroundColor: color },
                  isChatBackgroundSelected('wallpaper', id) && styles.tileSelected,
                ]}
                onPress={() => updateSettings({ chatBackground: { type: 'wallpaper', value: id } })}
              >
                <Text style={styles.wallpaperLabel}>{label}</Text>
                {isChatBackgroundSelected('wallpaper', id) && (
                  <View style={styles.checkBadge}>
                    <CheckIcon />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Gallery Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleLarge}>Gallery</Text>
            <ChevronRightIcon />
          </View>
          <View style={styles.galleryGrid}>
            {GALLERY_ITEMS.map(({ id, color, colors, label }) => (
              <TouchableOpacity
                key={id}
                style={[
                  styles.galleryTile,
                  colors ? { backgroundColor: colors[0] } : { backgroundColor: color },
                  isChatBackgroundSelected('gallery', id) && styles.tileSelected,
                ]}
                onPress={() => updateSettings({ chatBackground: { type: 'gallery', value: id } })}
              >
                <Text style={styles.galleryLabel}>{label}</Text>
                {isChatBackgroundSelected('gallery', id) && (
                  <View style={styles.checkBadge}>
                    <CheckIcon />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Set Default Background */}
        <TouchableOpacity style={styles.card}>
          <View style={styles.chatBackgroundHeader}>
            <Text style={styles.sectionTitleLarge}>Set default background</Text>
            <ChevronRightIcon />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

  return currentScreen === 'appearance' ? renderAppearanceScreen() : renderChatBackgroundScreen();
};

export default StatusScreen;

// ===== STYLESHEET =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  sectionTitleLarge: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  listItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  subtitleText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  radioContainer: {
    paddingLeft: 8,
  },
  chatBackgroundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chatPreview: {
    height: 64,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  colorTile: {
    width: '16%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  wallpaperScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  wallpaperTile: {
    width: 80,
    height: 128,
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'flex-end',
    paddingBottom: 8,
    paddingLeft: 8,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  wallpaperLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  galleryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  galleryTile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'flex-end',
    paddingBottom: 8,
    paddingLeft: 8,
    borderWidth: 3,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  galleryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tileSelected: {
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
  },
  iconText: {
    fontSize: 24,
    color: '#4B5563',
    fontWeight: 'bold',
  },
  checkText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  radioText: {
    fontSize: 24,
    color: '#4A5AC7',
  },
  radioEmptyText: {
    fontSize: 24,
    color: '#D1D5DB',
  },
});
