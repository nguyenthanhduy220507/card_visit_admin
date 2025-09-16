// app/dashboard/users/[id]/edit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { User, Role } from '@/types';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  ArrowLeftIcon,
  UserIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

interface UpdateUserForm {
  username: string;
  password?: string;
  confirmPassword?: string;
  fullName: string;
  isActive: boolean;
  roleIds: string[];
}

export default function UserEditPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<UpdateUserForm>({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    isActive: true,
    roleIds: [],
  });

  const userId = params.id as string;

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userResponse, rolesResponse] = await Promise.all([
        apiService.getUser(userId),
        apiService.getRoles(),
      ]);

      setUser(userResponse);
      setRoles(rolesResponse || []);
      
      // Populate form with existing data
      setFormData({
        username: userResponse.username,
        fullName: userResponse.fullName || '',
        isActive: userResponse.isActive,
        roleIds: userResponse.roles?.map((role: { id: string }) => role.id) || [],
        password: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Lỗi khi tải dữ liệu');
      if (error?.response?.status === 404) {
        router.push('/dashboard/users');
      }
    } finally {
      setLoading(false);
      setRolesLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleChange = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập là bắt buộc';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên là bắt buộc';
    }

    if (changePassword) {
      if (!formData.password) {
        newErrors.password = 'Mật khẩu là bắt buộc';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu không khớp';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const updateData: any = {
        username: formData.username,
        fullName: formData.fullName,
        isActive: formData.isActive,
        roleIds: formData.roleIds,
      };

      if (changePassword && formData.password) {
        updateData.password = formData.password;
      }

      await apiService.updateUser(userId, updateData);
      toast.success('Cập nhật người dùng thành công!');
      // router.push(`/dashboard/users/${userId}`);
      router.push('/dashboard/users');
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi cập nhật người dùng');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy người dùng</h3>
          <p className="mt-1 text-sm text-gray-500">
            Người dùng có ID {userId} không tồn tại hoặc đã bị xóa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <button
                  onClick={() => router.back()}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  <span className="text-sm font-medium text-gray-500">Chỉnh sửa người dùng</span>
                </div>
              </li>
            </ol>
          </nav>
          
          <h1 className="text-2xl font-bold text-gray-900">
            Chỉnh sửa: {user.fullName || user.username}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Cập nhật thông tin tài khoản người dùng
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg border border-gray-300">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Thông tin đăng nhập
              </h2>
            </div>
            
            <div className="px-6 py-4 space-y-4 text-black">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Tên đăng nhập <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    required
                    className="mt-1 block w-full form-input p-4 border border-gray-300"
                    placeholder="Nhập tên đăng nhập"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    required
                    className="mt-1 block w-full form-input p-4 border border-gray-300"
                    placeholder="Nhập họ và tên đầy đủ"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Kích hoạt tài khoản
                  </label>
                </div>
              </div>

              {/* Password Change Option */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center">
                  <input
                    id="changePassword"
                    name="changePassword"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={changePassword}
                    onChange={(e) => setChangePassword(e.target.checked)}
                  />
                  <label htmlFor="changePassword" className="ml-2 block text-sm text-gray-900">
                    Đổi mật khẩu
                  </label>
                </div>
              </div>

              {changePassword && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Mật khẩu mới <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="password"
                        className="block w-full form-input pr-10 p-4 border border-gray-300"
                        placeholder="Nhập mật khẩu mới"
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Xác nhận mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        id="confirmPassword"
                        className="block w-full form-input pr-10 p-4 border border-gray-300"
                        placeholder="Nhập lại mật khẩu mới"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Roles */}
          <div className="bg-white shadow rounded-lg border border-gray-300">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Vai trò ({formData.roleIds.length})
              </h2>
            </div>
            
            <div className="px-6 py-4">
              {rolesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : roles.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Không có vai trò nào
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className={`relative rounded-lg border p-4 cursor-pointer transition-colors ${
                        formData.roleIds.includes(role.id)
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleRoleChange(role.id)}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={formData.roleIds.includes(role.id)}
                          onChange={() => handleRoleChange(role.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {role.name}
                            </p>
                            {role.isDefault && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Mặc định
                              </span>
                            )}
                          </div>
                          {role.description && (
                            <p className="text-xs text-gray-500 mt-1">
                              {role.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {role.permissions?.length || 0} quyền hạn
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 text-sm font-medium bg-red-400 text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 text-sm font-medium bg-blue-400 text-gray-700 hover:bg-gray-50"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" color="white" />
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}