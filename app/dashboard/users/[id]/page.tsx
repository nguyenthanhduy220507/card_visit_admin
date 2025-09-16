// app/dashboard/users/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiService } from '@/lib/api';
import { User } from '@/types';
import { toast } from 'react-hot-toast';
import { formatDate, getInitials } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CalendarIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const userId = params.id as string;

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUser(userId);
      setUser(response);
    } catch (error: any) {
      console.error('Error loading user:', error);
      toast.error('Lỗi khi tải thông tin người dùng');
      if (error?.response?.status === 404) {
        router.push('/dashboard/users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }

    try {
      setDeleteLoading(true);
      await apiService.deleteUser(userId);
      toast.success('Xóa người dùng thành công');
      router.push('/dashboard/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Lỗi khi xóa người dùng');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
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

  if (!user) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy người dùng</h3>
          <p className="mt-1 text-sm text-gray-500">
            Người dùng có ID {userId} không tồn tại hoặc đã bị xóa.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/users"
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

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/dashboard/users" className="text-gray-400 hover:text-gray-500">
                    <ArrowLeftIcon className="h-5 w-5" />
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="text-gray-400 mx-2">/</span>
                    <span className="text-sm font-medium text-gray-500">Chi tiết người dùng</span>
                  </div>
                </li>
              </ol>
            </nav>

            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {user.fullName || user.username}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              @{user.username} • Tạo: {formatDate(user.createdAt)} • Cập nhật: {formatDate(user.updatedAt)}
            </p>
          </div>

          <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
            <Link
              href={`/dashboard/users/${user.id}/edit`}
              className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Link>

            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="inline-flex items-center px-3 py-2 rounded-md border border-red-300 text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
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
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Thông tin cơ bản
                </h3>
              </div>
              <div className="px-4 py-4">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Tên đăng nhập</dt>
                    <dd className="mt-1 text-sm text-gray-900">@{user.username}</dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">Họ và tên</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user.fullName || 'Chưa cập nhật'}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">Trạng thái</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">Ngày tạo</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {formatDate(user.createdAt)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* User Detail */}
            {user.detail && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    Thông tin chi tiết
                  </h3>
                </div>
                <div className="px-4 py-4">
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {user.detail.displayName && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Tên hiển thị</dt>
                        <dd className="mt-1 text-sm text-gray-900">{user.detail.displayName}</dd>
                      </div>
                    )}

                    {user.detail.firstName && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Tên</dt>
                        <dd className="mt-1 text-sm text-gray-900">{user.detail.firstName}</dd>
                      </div>
                    )}

                    {user.detail.lastName && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Họ</dt>
                        <dd className="mt-1 text-sm text-gray-900">{user.detail.lastName}</dd>
                      </div>
                    )}

                    {user.detail.phoneNumber && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Số điện thoại</dt>
                        <dd className="mt-1 text-sm text-gray-900 flex items-center">
                          <PhoneIcon className="h-4 w-4 mr-1" />
                          {user.detail.phoneNumber}
                        </dd>
                      </div>
                    )}

                    {user.detail.address && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Địa chỉ</dt>
                        <dd className="mt-1 text-sm text-gray-900 flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {user.detail.address}
                        </dd>
                      </div>
                    )}


                  </dl>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Avatar */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Ảnh đại diện</h3>
              </div>
              <div className="px-4 py-4 text-center">
                {user.detail?.avatarImage ? (
                  <Image
                    src={user.detail.avatarImage.secureUrl}
                    alt={user.fullName || user.username}
                    width={120}
                    height={120}
                    className="mx-auto rounded-full"
                  />
                ) : (
                  <div className="mx-auto w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-2xl font-medium">
                    {getInitials(user.fullName || user.username)}
                  </div>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  {user.fullName || user.username}
                </p>
              </div>
            </div>

            {/* Roles */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 mr-2" />
                  Vai trò ({user.roles?.length || 0})
                </h3>
              </div>
              <div className="px-4 py-4">
                {!user.roles || user.roles.length === 0 ? (
                  <div className="text-center py-4">
                    <UserGroupIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Chưa có vai trò nào</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {user.roles.map((role) => (
                      <div key={role.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-900">{role.name}</p>
                            {role.description && (
                              <p className="text-xs text-blue-700 mt-1">{role.description}</p>
                            )}
                            {role.isDefault && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <Link
                            href={`/dashboard/roles/${role.id}`}
                            className="text-blue-600 hover:text-blue-500 text-xs"
                          >
                            Xem chi tiết
                          </Link>
                        </div>

                        {/* Role permissions */}
                        {role.permissions && role.permissions.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-blue-900 mb-1">
                              Quyền hạn ({role.permissions.length}):
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {role.permissions.slice(0, 3).map((permission, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {permission.name}
                                </span>
                              ))}
                              {role.permissions.length > 3 && (
                                <span className="text-xs text-blue-700">
                                  +{role.permissions.length - 3} khác
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Thao tác nhanh</h3>
              </div>
              <div className="px-4 py-4 space-y-2">
                <Link
                  href={`/dashboard/users/${user.id}/edit`}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Chỉnh sửa thông tin
                </Link>

                <button
                  //   onClick={() => {
                  //     // Toggle user status
                  //     toast.info('Tính năng đang phát triển');
                  //   }}
                  className={`w-full inline-flex justify-center items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md ${user.isActive
                    ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                    : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                    }`}
                >
                  {user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}