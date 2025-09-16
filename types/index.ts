// API Response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status?: number;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth types
export interface User {
  id: string;
  username: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: Role[];
  detail?: UserDetail;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  name: string;
  description: string;
}

export interface UserDetail {
  id: string;
  userLogin: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  avatarImage?: Image;
}

export interface Image {
  id: string;
  secureUrl: string;
  publicId: string;
  format?: string;
  width?: number;
  height?: number;
}

// Card types
export interface Card {
  id: number;
  frontImageUrl: string;
  backImageUrl: string;
  avatar?: string;
  merge?: any;
  extractedData?: any;
  holderName?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Meeting types
export interface Meeting {
  id: number;
  title?: string;
  description?: string;
  date?: string;
  note?: string;
  locationType?: 'online' | 'office';
  locationDetail?: string;
  participants: Card[];
  createdAt: string;
  updatedAt: string;
}

// Form types
export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  password: string;
  fullName: string;
}