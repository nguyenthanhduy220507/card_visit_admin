// app/dashboard/permissions/[id]/edit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { Permission } from '@/types';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  ArrowLeftIcon,
  KeyIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

interface UpdatePermissionForm {
  description: string;
}

export default function PermissionEditPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permission, setPermission] = useState<Permission | null>(null);
  const [formData, setFormData] = useState<UpdatePermissionForm>({
    description: '',
  });

  const permissionId = params.id as string;

  useEffect(() => {
    if (permissionId) {
      loadPermission();
    }
  }, [permissionId]);

  const loadPermission = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPermission(permissionId);
      setPermission(response);
      
      // Populate form with existing data
      setFormData({
        description: response.description || '',
      });
    } catch (error: any) {
      console.error('Error loading permission:', error);
      toast.error('Lỗi khi tải thông tin quyền hạn');
      if (error?.response?.status === 404) {
        router.push('/dashboard/permissions');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      await apiService.updatePermission(permissionId, {
        description: formData.description || undefined,
      });
      
      toast.success('Cập nhật quyền hạn thành công!');
      // router.push(`/dashboard/permissions/${permissionId}`);
      router.push('/dashboard/permissions');
    } catch (error: any) {
      console.error('Error updating permission:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi cập nhật quyền hạn');
    } finally {
      setSaving(false);
    }
  };

  const getResourceColor = (resource: string) => {
    const colors: Record<string, string> = {
      'user': 'bg-blue-100 text-blue-800 border-blue-200',
      'role': 'bg-green-100 text-green-800 border-green-200',
      'permission': 'bg-purple-100 text-purple-800 border-purple-200',
      'card': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'meeting': 'bg-pink-100 text-pink-800 border-pink-200',
      'department': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };
    return colors[resource.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      'create': 'bg-green-100 text-green-800 border-green-200',
      'read': 'bg-blue-100 text-blue-800 border-blue-200',
      'update': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'delete': 'bg-red-100 text-red-800 border-red-200',
      'viewAll': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'viewOne': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'viewOfMe': 'bg-teal-100 text-teal-800 border-teal-200',
    };
    return colors[action] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!permission) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy quyền hạn</h3>
          <p className="mt-1 text-sm text-gray-500">
            Quyền hạn có ID {permissionId.substring(0, 8)}... không tồn tại hoặc đã bị xóa.
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
                  <span className="text-sm font-medium text-gray-500">Chỉnh sửa quyền hạn</span>
                </div>
              </li>
            </ol>
          </nav>
          
          <h1 className="text-2xl font-bold text-gray-900">
            Chỉnh sửa: {permission.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Cập nhật mô tả cho quyền hạn này
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Permission Overview */}
          <div className="bg-white shadow rounded-lg border border-gray-300">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <KeyIcon className="h-5 w-5 mr-2" />
                Thông tin quyền hạn
              </h2>
            </div>
            
            <div className="px-6 py-4">
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <KeyIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {permission.name}
                  </h3>
                  <div className="flex items-center justify-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getResourceColor(permission.resource)}`}>
                      <TagIcon className="h-4 w-4 mr-1" />
                      {permission.resource}
                    </span>
                    <span className="text-gray-300">→</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getActionColor(permission.action)}`}>
                      {permission.action}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tài nguyên
                  </label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-900">{permission.resource}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Hành động
                  </label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-md">
                    <span className="text-sm text-gray-900">{permission.action}</span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Mô tả
                </label>
                <p className="mt-1 text-xs text-gray-500 mb-2">
                  Cung cấp mô tả chi tiết về quyền hạn này để giúp quản trị viên hiểu rõ chức năng.
                </p>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  className="mt-1 block w-full form-textarea text-black p-4 border border-gray-300"
                  placeholder="VD: Cho phép xem tất cả thông tin người dùng trong hệ thống"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <KeyIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Lưu ý quan trọng
                </h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Chỉ có thể chỉnh sửa mô tả của quyền hạn</li>
                    <li>Tên quyền hạn, tài nguyên và hành động được quản lý tự động bởi hệ thống</li>
                    <li>Mô tả rõ ràng sẽ giúp quản trị viên phân quyền chính xác hơn</li>
                  </ul>
                </div>
              </div>
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