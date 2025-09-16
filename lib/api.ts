// lib/api.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://103.157.218.98:8393',
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const response = await this.api.post('/auth/login', { username, password });
    return response.data;
  }

  async register(userData: { username: string; password: string; fullName: string }) {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getProfile() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Cards endpoints
  async getCards(params?: any) {
    const response = await this.api.get('/cards', { params });
    return response.data;
  }

  async getAllCards() {
    const response = await this.api.get('/cards/all');
    return response.data;
  }

  async getCard(id: number) {
    const response = await this.api.get(`/cards/${id}`);
    return response.data;
  }

  async uploadCard(formData: FormData) {
    const response = await this.api.post('/cards/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async scanCard(id: number) {
    const response = await this.api.post(`/cards/scan/${id}`);
    return response.data;
  }

  async updateCardMerge(id: number, data: any, files?: FormData) {
    const config: AxiosRequestConfig = {};
    if (files) {
      // Append merge data to FormData
      for (const key in data) {
        files.append(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
      }
      config.headers = { 'Content-Type': 'multipart/form-data' };
      const response = await this.api.patch(`/cards/${id}/merge`, files, config);
      return response.data;
    } else {
      const response = await this.api.patch(`/cards/${id}/merge`, data);
      return response.data;
    }
  }

  async deleteCard(id: number) {
    const response = await this.api.delete(`/cards/${id}`);
    return response.data;
  }

  async getCardStatus(id: number) {
    const response = await this.api.get(`/cards/${id}/status`);
    return response.data;
  }

  async getCardsCount() {
    const response = await this.api.get('/cards/count');
    return response.data;
  }

  async searchCards(params: any) {
    const response = await this.api.get('/cards', { params });
    return response.data;
  }

  // Meetings endpoints
  async getMeetings(params?: any) {
    const response = await this.api.get('/meetings/search', { params });
    return response.data;
  }

  async getAllMeetings() {
    const response = await this.api.get('/meetings/all');
    return response.data;
  }

  async getMeeting(id: number) {
    const response = await this.api.get(`/meetings/${id}`);
    return response.data;
  }

  async createMeeting(data: any) {
    const response = await this.api.post('/meetings/create', data);
    return response.data;
  }

  async updateMeeting(id: number, data: any) {
    const response = await this.api.patch(`/meetings/${id}`, data);
    return response.data;
  }

  async deleteMeeting(id: number) {
    const response = await this.api.delete(`/meetings/${id}`);
    return response.data;
  }

  async addMeetingParticipants(id: number, cardIds: number[]) {
    const response = await this.api.post(`/meetings/${id}/participants`, { cardIds });
    return response.data;
  }

  async removeMeetingParticipant(meetingId: number, cardId: number) {
    const response = await this.api.delete(`/meetings/${meetingId}/participants/${cardId}`);
    return response.data;
  }

  // Users endpoints
  async getUsers(params?: any) {
  try {
    const response = await this.api.get('/users', { params });
    return response.data;
  } catch (error: any) {
    return []; // trả về rỗng để UI vẫn chạy
  }
}


  async getUsersFilter(params?: any) {
    const response = await this.api.get('/users/filter', { params });
    return response.data;
  }

  async getUser(id: string) {
    const response = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async createUser(data: any) {
    const response = await this.api.post('/users', data);
    return response.data;
  }

  async updateUser(id: string, data: any) {
    const response = await this.api.patch(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string) {
    const response = await this.api.delete(`/users/${id}`);
    return response.data;
  }

  // Roles endpoints
  async getRoles(params?: any) {
    const response = await this.api.get('/roles', { params });
    return response.data;
  }

  async getRolesFilter(params?: any) {
    const response = await this.api.get('/roles/filter', { params });
    return response.data;
  }

  async getRole(id: string) {
    const response = await this.api.get(`/roles/${id}`);
    return response.data;
  }

  async createRole(data: any) {
    const response = await this.api.post('/roles', data);
    return response.data;
  }

  async updateRole(id: string, data: any) {
    const response = await this.api.patch(`/roles/${id}`, data);
    return response.data;
  }

  async deleteRole(id: string) {
    const response = await this.api.delete(`/roles/${id}`);
    return response.data;
  }

  // Permissions endpoints
  async getPermissions(params?: any) {
    const response = await this.api.get('/permissions', { params });
    return response.data;
  }

  async getPermissionsFilter(params?: any) {
    const response = await this.api.get('/permissions/filter', { params });
    return response.data;
  }

  async getPermission(id: string) {
    const response = await this.api.get(`/permissions/${id}`);
    return response.data;
  }

  async updatePermission(id: string, data: any) {
    const response = await this.api.patch(`/permissions/${id}`, data);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;