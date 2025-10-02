import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  channelId: string;
  type: 'text' | 'image' | 'file' | 'video';
  fileUri?: string;
  isStarred: boolean;
  isPinned: boolean;
  replyTo?: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  isGroup: boolean;
  members: string[];
  avatar?: string;
  isPinned: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  avatar?: string;
  isApproved: boolean;
  otpPin?: string;
}

export interface GalleryImage {
  id: string;
  uri: string;
  timestamp: Date;
  name: string;
  size: number;
}

class LocalDatabase {
  private static readonly KEYS = {
    MESSAGES: 'local_messages',
    CHANNELS: 'local_channels', 
    USERS: 'local_users',
    CURRENT_USER: 'current_user',
    GALLERY: 'local_gallery',
    STARRED_MESSAGES: 'starred_messages',
  };

  // Messages
  static async saveMessage(message: ChatMessage): Promise<void> {
    try {
      const messages = await this.getMessages();
      messages.push(message);
      await AsyncStorage.setItem(this.KEYS.MESSAGES, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  static async getMessages(channelId?: string): Promise<ChatMessage[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.MESSAGES);
      let messages: ChatMessage[] = data ? JSON.parse(data) : [];
      
      if (channelId) {
        messages = messages.filter(msg => msg.channelId === channelId);
      }
      
      return messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  static async deleteMessage(messageId: string): Promise<void> {
    try {
      const messages = await this.getMessages();
      const filteredMessages = messages.filter(msg => msg.id !== messageId);
      await AsyncStorage.setItem(this.KEYS.MESSAGES, JSON.stringify(filteredMessages));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }

  static async starMessage(messageId: string, isStarred: boolean): Promise<void> {
    try {
      const messages = await this.getMessages();
      const messageIndex = messages.findIndex(msg => msg.id === messageId);
      if (messageIndex !== -1) {
        messages[messageIndex].isStarred = isStarred;
        await AsyncStorage.setItem(this.KEYS.MESSAGES, JSON.stringify(messages));
      }
    } catch (error) {
      console.error('Error starring message:', error);
    }
  }

  static async pinMessage(messageId: string, isPinned: boolean): Promise<void> {
    try {
      const messages = await this.getMessages();
      const messageIndex = messages.findIndex(msg => msg.id === messageId);
      if (messageIndex !== -1) {
        messages[messageIndex].isPinned = isPinned;
        await AsyncStorage.setItem(this.KEYS.MESSAGES, JSON.stringify(messages));
      }
    } catch (error) {
      console.error('Error pinning message:', error);
    }
  }

  // Channels
  static async saveChannel(channel: ChatChannel): Promise<void> {
    try {
      const channels = await this.getChannels();
      const existingIndex = channels.findIndex(ch => ch.id === channel.id);
      
      if (existingIndex !== -1) {
        channels[existingIndex] = channel;
      } else {
        channels.push(channel);
      }
      
      await AsyncStorage.setItem(this.KEYS.CHANNELS, JSON.stringify(channels));
    } catch (error) {
      console.error('Error saving channel:', error);
    }
  }

  static async getChannels(): Promise<ChatChannel[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.CHANNELS);
      const channels: ChatChannel[] = data ? JSON.parse(data) : [];
      
      return channels.map(channel => ({
        ...channel,
        timestamp: new Date(channel.timestamp)
      }));
    } catch (error) {
      console.error('Error getting channels:', error);
      return [];
    }
  }

  static async deleteChannel(channelId: string): Promise<void> {
    try {
      const channels = await this.getChannels();
      const filteredChannels = channels.filter(ch => ch.id !== channelId);
      await AsyncStorage.setItem(this.KEYS.CHANNELS, JSON.stringify(filteredChannels));
    } catch (error) {
      console.error('Error deleting channel:', error);
    }
  }

  static async pinChannel(channelId: string, isPinned: boolean): Promise<void> {
    try {
      const channels = await this.getChannels();
      const channelIndex = channels.findIndex(ch => ch.id === channelId);
      if (channelIndex !== -1) {
        channels[channelIndex].isPinned = isPinned;
        await AsyncStorage.setItem(this.KEYS.CHANNELS, JSON.stringify(channels));
      }
    } catch (error) {
      console.error('Error pinning channel:', error);
    }
  }

  // Users
  static async saveUser(user: User): Promise<void> {
    try {
      const users = await this.getUsers();
      const existingIndex = users.findIndex(u => u.id === user.id);
      
      if (existingIndex !== -1) {
        users[existingIndex] = user;
      } else {
        users.push(user);
      }
      
      await AsyncStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }

  static async getUsers(): Promise<User[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async setCurrentUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting current user:', error);
    }
  }

  static async saveOtpPin(email: string, pin: string): Promise<void> {
    try {
      const otpData = await AsyncStorage.getItem('otp_pins');
      const otps: Record<string, string> = otpData ? JSON.parse(otpData) : {};
      otps[email] = pin;
      await AsyncStorage.setItem('otp_pins', JSON.stringify(otps));
    } catch (error) {
      console.error('Error saving OTP pin:', error);
    }
  }

  static async getOtpPin(email: string): Promise<string | null> {
    try {
      const otpData = await AsyncStorage.getItem('otp_pins');
      const otps: Record<string, string> = otpData ? JSON.parse(otpData) : {};
      return otps[email] || null;
    } catch (error) {
      console.error('Error getting OTP pin:', error);
      return null;
    }
  }

  // Gallery
  static async saveGalleryImage(image: GalleryImage): Promise<void> {
    try {
      const gallery = await this.getGallery();
      gallery.unshift(image); // Add to beginning
      await AsyncStorage.setItem(this.KEYS.GALLERY, JSON.stringify(gallery));
    } catch (error) {
      console.error('Error saving gallery image:', error);
    }
  }

  static async getGallery(): Promise<GalleryImage[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.GALLERY);
      const gallery: GalleryImage[] = data ? JSON.parse(data) : [];
      
      return gallery.map(img => ({
        ...img,
        timestamp: new Date(img.timestamp)
      }));
    } catch (error) {
      console.error('Error getting gallery:', error);
      return [];
    }
  }

  static async deleteGalleryImage(imageId: string): Promise<void> {
    try {
      const gallery = await this.getGallery();
      const filteredGallery = gallery.filter(img => img.id !== imageId);
      await AsyncStorage.setItem(this.KEYS.GALLERY, JSON.stringify(filteredGallery));
    } catch (error) {
      console.error('Error deleting gallery image:', error);
    }
  }

  // Starred Messages
  static async getStarredMessages(): Promise<ChatMessage[]> {
    try {
      const messages = await this.getMessages();
      return messages.filter(msg => msg.isStarred);
    } catch (error) {
      console.error('Error getting starred messages:', error);
      return [];
    }
  }

  // Clear all data
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.KEYS.MESSAGES,
        this.KEYS.CHANNELS,
        this.KEYS.USERS,
        this.KEYS.CURRENT_USER,
        this.KEYS.GALLERY,
        'otp_pins'
      ]);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}

export default LocalDatabase;
