import { Alert } from 'react-native';

export interface FileData {
  id: string;
  name: string;
  size: number;
  type: string;
  uri: string;
  uploadDate: Date;
  expiryDate: Date;
  uploadedBy: string;
  messageId?: string;
}

export class FileService {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB in bytes
  private static readonly RETENTION_MONTHS = 3;

  static async pickDocument(): Promise<FileData | null> {
    try {
      // For now, simulate file picking - in real app use react-native-document-picker
      const simulatedFile = {
        name: 'document.pdf',
        size: 1024 * 1024, // 1MB
        type: 'application/pdf',
        uri: 'file://path/to/document.pdf',
      };

      if (simulatedFile.size > this.MAX_FILE_SIZE) {
        Alert.alert('File Too Large', 'Maximum file size is 10GB');
        return null;
      }

      const now = new Date();
      const expiryDate = new Date();
      expiryDate.setMonth(now.getMonth() + this.RETENTION_MONTHS);

      return {
        id: Date.now().toString(),
        name: simulatedFile.name,
        size: simulatedFile.size,
        type: simulatedFile.type,
        uri: simulatedFile.uri,
        uploadDate: now,
        expiryDate,
        uploadedBy: 'current_user',
      };
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file');
      return null;
    }
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getFileIcon(type: string): string {
    if (type.includes('pdf')) return 'document';
    if (type.includes('image')) return 'image';
    if (type.includes('video')) return 'videocam';
    if (type.includes('audio')) return 'musical-notes';
    if (type.includes('word') || type.includes('doc')) return 'document-text';
    if (type.includes('excel') || type.includes('sheet')) return 'grid';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'easel';
    if (type.includes('dwg')) return 'build';
    if (type.includes('psd')) return 'color-palette';
    return 'document';
  }

  static isFileExpired(file: FileData): boolean {
    return new Date() > file.expiryDate;
  }

  static getDaysUntilExpiry(file: FileData): number {
    const now = new Date();
    const diffTime = file.expiryDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static compressImage(uri: string, quality: number = 0.7): Promise<string> {
    // Simulate image compression
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(uri); // In real app, use image compression library
      }, 500);
    });
  }

  static scanDocument(uri: string): Promise<string> {
    // Simulate document scanning
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(uri); // In real app, use document scanning library
      }, 1000);
    });
  }
}
export default FileService;
