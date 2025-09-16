// app/dashboard/roles/create/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { Permission } from '@/types';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

interface CreateRoleForm {
  name: string;
  description: string;
  isDefault: boolean;
  permissionIds: string[];
}

export default function RoleCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [searchPermissions, setSearchPermissions] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateRoleForm>({
    name: '',
    description: '',
    isDefault: false,
    permissionIds: [],
  });

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setPermissionsLoading(true);
      const response = await apiService.getPermissions();
      setPermissions(response || []);
    } catch (error) {
      console.error('Error loading permissions:', error);
      toast.error('Lỗi khi tải danh sách quyền hạn');
    } finally {
      setPermissionsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({ ...prev, [name]: finalValue }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePermissionChange = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter(id => id !== permissionId)
        : [...prev.permissionIds, permissionId]
    }));
  };

  const handleSelectAllPermissions = () => {
    const filteredPermissions = getFilteredPermissions();
    const allSelected = filteredPermissions.every(p => formData.permissionIds.includes(p.id));

    if (allSelected) {
      // Deselect all filtered permissions
      setFormData(prev => ({
        ...prev,
        permissionIds: prev.permissionIds.filter(id =>
          !filteredPermissions.some(p => p.id === id)
        )
      }));
    } else {
      // Select all filtered permissions
      const newIds = [...formData.permissionIds];
      filteredPermissions.forEach(permission => {
        if (!newIds.includes(permission.id)) {
          newIds.push(permission.id);
        }
      });
      setFormData(prev => ({ ...prev, permissionIds: newIds }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên vai trò là bắt buộc';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Tên vai trò phải có ít nhất 3 ký tự';
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
      setLoading(true);
      const roleData = {
        name: formData.name,
        description: formData.description || undefined,
        isDefault: formData.isDefault,
        permissionIds: formData.permissionIds,
      };

      const result = await apiService.createRole(roleData);
      toast.success('Tạo vai trò thành công!');
      // router.push(`/dashboard/roles/${result.id}`);
      router.push('/dashboard/roles');
    } catch (error: any) {
      console.error('Error creating role:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi tạo vai trò');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPermissions = () => {
    return permissions.filter(permission => {
      const matchesSearch = !searchPermissions ||
        permission.name.toLowerCase().includes(searchPermissions.toLowerCase()) ||
        permission.resource.toLowerCase().includes(searchPermissions.toLowerCase()) ||
        permission.action.toLowerCase().includes(searchPermissions.toLowerCase());

      const matchesResource = !resourceFilter || permission.resource === resourceFilter;

      return matchesSearch && matchesResource;
    });
  };

  const getResourceColor = (resource: string) => {
    const colors: Record<string, string> = {
      'user': 'bg-blue-100 text-blue-800',
      'role': 'bg-green-100 text-green-800',
      'permission': 'bg-purple-100 text-purple-800',
      'card': 'bg-yellow-100 text-yellow-800',
      'meeting': 'bg-pink-100 text-pink-800',
      'department': 'bg-indigo-100 text-indigo-800',
    };
    return colors[resource.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      'create': 'bg-green-100 text-green-800',
      'read': 'bg-blue-100 text-blue-800',
      'update': 'bg-yellow-100 text-yellow-800',
      'delete': 'bg-red-100 text-red-800',
      'viewAll': 'bg-indigo-100 text-indigo-800',
      'viewOne': 'bg-cyan-100 text-cyan-800',
      'viewOfMe': 'bg-teal-100 text-teal-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const filteredPermissions = getFilteredPermissions();
  const availableResources = [...new Set(permissions.map(p => p.resource))];

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
                  <span className="text-sm font-medium text-gray-500">Tạo vai trò mới</span>
                </div>
              </li>
            </ol>
          </nav>

          <h1 className="text-2xl font-bold text-gray-900">Tạo vai trò mới</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tạo vai trò và phân quyền cho người dùng
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg border border-gray-300">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Thông tin cơ bản
              </h2>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-black">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Tên vai trò <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="mt-1 block w-full form-input p-4 border border-gray-300"
                    placeholder="VD: Admin, Editor, Viewer"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    id="isDefault"
                    name="isDefault"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                    Đặt làm vai trò mặc định
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  className="mt-1 block w-full form-textarea text-black p-4 border border-gray-300"
                  placeholder="Mô tả về vai trò và trách nhiệm"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-white shadow rounded-lg border border-gray-300">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <KeyIcon className="h-5 w-5 mr-2" />
                  Quyền hạn ({formData.permissionIds.length}/{permissions.length})
                </h2>
                <button
                  type="button"
                  onClick={handleSelectAllPermissions}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  {filteredPermissions.every(p => formData.permissionIds.includes(p.id))
                    ? 'Bỏ chọn tất cả'
                    : 'Chọn tất cả'
                  }
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              {/* Search and Filter */}
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-black">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm quyền hạn..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    value={searchPermissions}
                    onChange={(e) => setSearchPermissions(e.target.value)}
                  />
                </div>

                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={resourceFilter}
                  onChange={(e) => setResourceFilter(e.target.value)}
                >
                  <option value="">Tất cả tài nguyên</option>
                  {availableResources.map(resource => (
                    <option key={resource} value={resource}>{resource}</option>
                  ))}
                </select>
              </div>

              {permissionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : filteredPermissions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  {searchPermissions || resourceFilter
                    ? 'Không tìm thấy quyền hạn phù hợp'
                    : 'Không có quyền hạn nào'
                  }
                </p>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredPermissions.map((permission) => (
                    <div
                      key={permission.id}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${formData.permissionIds.includes(permission.id)
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                      onClick={() => handlePermissionChange(permission.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={formData.permissionIds.includes(permission.id)}
                          onChange={() => handlePermissionChange(permission.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {permission.name}
                          </p>
                          {permission.description && (
                            <p className="text-xs text-gray-500 mt-1">
                              {permission.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getResourceColor(permission.resource)}`}>
                          <TagIcon className="h-3 w-3 mr-1" />
                          {permission.resource}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getActionColor(permission.action)}`}>
                          {permission.action}
                        </span>
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
              disabled={loading}
              className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 text-sm font-medium bg-blue-400 text-gray-700 hover:bg-gray-50"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" color="white" />
                  Đang tạo...
                </>
              ) : (
                'Tạo vai trò'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}