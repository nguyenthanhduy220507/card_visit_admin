// app/dashboard/users/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiService } from '@/lib/api';
import { User } from '@/types';
import { toast } from 'react-hot-toast';
import { formatDate, getStatusColor } from '@/lib/utils';
import DataTable from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/DataTable';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Pagination state
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadUsers();
  }, [currentPage, itemsPerPage]);

  const loadUsers = async (search?: {
    search?: string;
    role?: string;
    isActive?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      const params = {
        page: search?.page || currentPage,
        limit: search?.limit || itemsPerPage,
        search: search?.search || searchTerm,
        role: search?.role || roleFilter,
        isActive: search?.isActive || (activeFilter !== 'all' ? activeFilter : undefined),
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key as keyof typeof params]) {
          delete params[key as keyof typeof params];
        }
      });

      const response = await apiService.getUsersFilter(params);

      if (response.data) {
        setUsers(response.data);
        setTotalItems(response.total || 0);
        setTotalPages(response.totalPages || 0);
      } else {
        // Fallback to regular users endpoint
        const fallbackResponse = await apiService.getUsers(params);
        setUsers(fallbackResponse || []);
        setTotalItems(fallbackResponse?.length || 0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Lỗi khi tải danh sách người dùng');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }

    try {
      setDeleteLoading(id);
      await apiService.deleteUser(id);
      setUsers(users.filter(user => user.id !== id));
      setTotalItems(prev => prev - 1);
      toast.success('Xóa người dùng thành công');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Lỗi khi xóa người dùng');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadUsers({ search: searchTerm, role: roleFilter, isActive: activeFilter, page: 1 });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setRoleFilter('');
    setActiveFilter('all');
    setCurrentPage(1);
    loadUsers({ page: 1 });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  // Get unique roles for filter
  const availableRoles = [...new Set(users.flatMap(user => user.roles?.map(role => role.name) || []))];

  const columns = [
    {
      key: 'fullName',
      title: 'Họ và tên',
      render: (value: string, record: User) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
              {(record.fullName || record.username).charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {record.fullName || record.username}
            </p>
            <p className="text-sm text-gray-500">@{record.username}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'roles',
      title: 'Vai trò',
      render: (value: any, record: User) => (
        <div className="flex flex-wrap gap-1">
          {record.roles?.length ? (
            record.roles.map((role, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {role.name}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-400">Chưa có vai trò</span>
          )}
        </div>
      ),
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
          {value ? 'Hoạt động' : 'Không hoạt động'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      render: (value: string) => (
        <span className="text-sm text-gray-500">
          {formatDate(value)}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (value: any, record: User) => (
        <div className="flex items-center space-x-2">
          <Link
            href={`/dashboard/users/${record.id}`}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            <EyeIcon className="h-3 w-3 mr-1" />
            Xem
          </Link>

          <Link
            href={`/dashboard/users/${record.id}/edit`}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded hover:bg-indigo-200"
          >
            <PencilIcon className="h-3 w-3 mr-1" />
            Sửa
          </Link>

          <button
            onClick={() => handleDelete(record.id)}
            disabled={deleteLoading === record.id}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 disabled:opacity-50"
          >
            {deleteLoading === record.id ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
            ) : (
              <>
                <TrashIcon className="h-3 w-3 mr-1" />
                Xóa
              </>
            )}
          </button>
        </div>
      ),
      sortable: false,
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate py-3">
            Quản lý người dùng
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Tổng số: {totalItems} người dùng
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            href="/dashboard/users/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Thêm người dùng
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow text-black">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2 text-black">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, username..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vai trò
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">Tất cả vai trò</option>
              {availableRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="true">Hoạt động</option>
              <option value="false">Không hoạt động</option>
            </select>
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={handleSearch}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FunnelIcon className="h-4 w-4 mr-1" />
              Lọc
            </button>
            <button
              onClick={handleClearSearch}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyText={
            searchTerm || roleFilter || activeFilter !== 'all'
              ? 'Không tìm thấy người dùng phù hợp'
              : 'Chưa có người dùng nào'
          }
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>

      {/* Empty State */}
      {!loading && users.length === 0 && !searchTerm && !roleFilter && activeFilter === 'all' && (
        <div className="text-center py-12">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có người dùng</h3>
          <p className="mt-1 text-sm text-gray-500">
            Bắt đầu bằng cách thêm người dùng đầu tiên.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/users/create"
              className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 text-sm font-medium bg-green-400 text-gray-700 hover:bg-gray-50"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Thêm người dùng đầu tiên
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}