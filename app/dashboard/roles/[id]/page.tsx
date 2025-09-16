// app/dashboard/roles/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiService } from '@/lib/api';
import { Role } from '@/types';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  KeyIcon,
  CalendarIcon,
  TagIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

export default function RoleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const roleId = params.id as string;

  useEffect(() => {
    if (roleId) {
      loadRole();
    }
  }, [roleId]);

  const loadRole = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRole(roleId);
      setRole(response);
    } catch (error: any) {
      console.error('Error loading role:', error);
      toast.error('Lỗi khi tải thông tin vai trò');
      if (error?.response?.status === 404) {
        router.push('/dashboard/roles');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vai trò này?')) {
      return;
    }

    if (role?.isDefault) {
      toast.error('Không thể xóa vai trò mặc định');
      return;
    }

    try {
      setDeleteLoading(true);
      await apiService.deleteRole(roleId);
      toast.success('Xóa vai trò thành công');
      router.push('/dashboard/roles');
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Lỗi khi xóa vai trò');
    } finally {
      setDeleteLoading(false);
    }
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

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center py-12">
          <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy vai trò</h3>
          <p className="mt-1 text-sm text-gray-500">
            Vai trò có ID {roleId} không tồn tại hoặc đã bị xóa.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/roles"
              className="btn-primary"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Group permissions by resource
  const permissionsByResource = role.permissions?.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, typeof role.permissions>) || {};

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/dashboard/roles" className="text-gray-400 hover:text-gray-500">
                    <ArrowLeftIcon className="h-5 w-5" />
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="text-gray-400 mx-2">/</span>
                    <span className="text-sm font-medium text-gray-500">Chi tiết vai trò</span>
                  </div>
                </li>
              </ol>
            </nav>
            
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {role.name}
              </h2>
              {role.isDefault && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 py-3">
                  Vai trò mặc định
                </span>
              )}
            </div>
            {/* <p className="mt-1 text-sm text-gray-500">
              ID: {role.id.substring(0, 8)}... • Tạo: {formatDate(role.createdAt)} • Cập nhật: {formatDate(role.updatedAt)}
            </p> */}
          </div>
          
          <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
            <Link
              href={`/dashboard/roles/${role.id}/edit`}
              className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Link>
            
            <button
              onClick={handleDelete}
              disabled={deleteLoading || role.isDefault}
              className="inline-flex items-center px-3 py-2 rounded-md border border-red-300 text-sm font-medium bg-red-400 text-red-700 hover:bg-red-100 disabled:opacity-50"
              title={role.isDefault ? 'Không thể xóa vai trò mặc định' : 'Xóa vai trò'}
            >
              {deleteLoading ? (
                <LoadingSpinner size="sm" className="mr-2" color="white" />
              ) : (
                <TrashIcon className="h-4 w-4 mr-2" />
              )}
              Xóa
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white shadow rounded-lg border border-gray-300">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 mr-2" />
                  Thông tin cơ bản
                </h3>
              </div>
              <div className="px-4 py-4">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Tên vai trò</dt>
                    <dd className="mt-1 text-sm text-gray-900">{role.name}</dd>
                  </div>
                  
                  {role.description && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Mô tả</dt>
                      <dd className="mt-1 text-sm text-gray-900">{role.description}</dd>
                    </div>
                  )}
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Loại vai trò</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        role.isDefault 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {role.isDefault ? 'Vai trò mặc định' : 'Vai trò tùy chỉnh'}
                      </span>
                    </dd>
                  </div>
                  
                  
                </dl>
              </div>
            </div>

            {/* Permissions by Resource */}
            <div className="bg-white shadow rounded-lg border border-gray-300">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <KeyIcon className="h-5 w-5 mr-2" />
                  Quyền hạn theo tài nguyên ({role.permissions?.length || 0})
                </h3>
              </div>
              <div className="px-4 py-4">
                {!role.permissions || role.permissions.length === 0 ? (
                  <div className="text-center py-8">
                    <KeyIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Chưa có quyền hạn nào</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(permissionsByResource).map(([resource, permissions]) => (
                      <div key={resource} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getResourceColor(resource)}`}>
                            <TagIcon className="h-4 w-4 mr-1" />
                            {resource}
                          </span>
                          <span className="text-sm text-gray-500">
                            {permissions.length} quyền
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {permissions.map((permission) => (
                            <div key={permission.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-300">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {permission.name}
                                </p>
                                {permission.description && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {permission.description}
                                  </p>
                                )}
                              </div>
                              <span className={`ml-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getActionColor(permission.action)}`}>
                                {permission.action}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white shadow rounded-lg border border-gray-300">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Thống kê</h3>
              </div>
              <div className="px-4 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <KeyIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Tổng quyền hạn</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {role.permissions?.length || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TagIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Tài nguyên</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {Object.keys(permissionsByResource).length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Người dùng</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {/* This would need to be fetched separately */}
                    --
                  </span>
                </div>
              </div>
            </div>

            {/* Permissions Summary */}
            {Object.keys(permissionsByResource).length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Phân bố quyền hạn</h3>
                </div>
                <div className="px-4 py-4">
                  <div className="space-y-3">
                    {Object.entries(permissionsByResource).map(([resource, permissions]) => {
                      const percentage = Math.round((permissions.length / (role.permissions?.length || 1)) * 100);
                      return (
                        <div key={resource}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{resource}</span>
                            <span className="font-medium text-gray-900">
                              {permissions.length} ({percentage}%)
                            </span>
                          </div>
                          <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {/* <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Thao tác nhanh</h3>
              </div>
              <div className="px-4 py-4 space-y-2">
                <Link
                  href={`/dashboard/roles/${role.id}/edit`}
                  className="w-full btn-secondary justify-center"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Chỉnh sửa vai trò
                </Link>

                <button
                  onClick={() => {
                    // Future: Export role permissions
                    // toast.info('Tính năng đang phát triển');
                  }}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Xuất danh sách quyền
                </button>

                <button
                  onClick={() => {
                    // Future: View users with this role
                    // toast.info('Tính năng đang phát triển');
                  }}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  Xem người dùng có vai trò này
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}