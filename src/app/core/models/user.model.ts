export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  photoURL: string | null;
}

export interface UserData {
  email: string;
  credits: number;
  subscriptionType?: 'free' | 'basic' | 'pro' | 'ultra';
  subscriptionExpiry?: number;
  lastLogin?: string; // ISO string для совместимости с оригиналом
  createdAt: number | string; // Может быть timestamp или ISO string
  updatedAt: number;
  photoBase64?: string; // Для аватара пользователя
}

