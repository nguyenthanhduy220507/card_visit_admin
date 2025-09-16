// app/dashboard/roles/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiService } from '@/lib/api';
import { Role } from '@/types';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import DataTable from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/DataTable';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDefaultFilter, setIsDefaultFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadRoles();
  }, [currentPage, itemsPerPage]);

  const loadRoles = async (search?: { 
    search?: string; 
    isDefault?: string; 
    page?: number; 
    limit?: number; 
  }) => {
    try {
      setLoading(true);
      const params = {
        page: search?.page || currentPage,
        limit: search?.limit || itemsPerPage,
        search: search?.search || searchTerm,
        isDefault: search?.isDefault || (isDefaultFilter !== 'all' ? isDefaultFilter : undefined),
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key as keyof typeof params]) {
          delete params[key as keyof typeof params];
        }
      });

      const response = await apiService.getRolesFilter(params);
      
      if (response.data) {
        setRoles(response.data);
        setTotalItems(response.total || 0);
        setTotalPages(response.totalPages || 0);
      } else {
        // Fallback to regular roles endpoint
        const fallbackResponse = await apiService.getRoles(params);
        setRoles(fallbackResponse || []);
        setTotalItems(fallbackResponse?.length || 0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Lỗi khi tải danh sách vai trò');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vai trò này?')) {
      return;
    }

    try {
      setDeleteLoading(id);
      await apiService.deleteRole(id);
      setRoles(roles.filter(role => role.id !== id));
      setTotalItems(prev => prev - 1);
      toast.success('Xóa vai trò thành công');
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Lỗi khi xóa vai trò');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadRoles({ search: searchTerm, isDefault: isDefaultFilter, page: 1 });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setIsDefaultFilter('all');
    setCurrentPage(1);
    loadRoles({ page: 1 });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const columns = [
    {
      key: 'name',
      title: 'Tên vai trò',
      render: (value: string, record: Role) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{record.name}</p>
            {record.isDefault && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Mặc định
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      title: 'Mô tả',
      render: (value: string) => (
        <span className="text-sm text-gray-900">
          {value || 'Chưa có mô tả'}
        </span>
      ),
    },
    {
      key: 'permissions',
      title: 'Quyền hạn',
      render: (value: any, record: Role) => (
        <div className="flex items-center space-x-2">
          <KeyIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            {record.permissions?.length || 0} quyền
          </span>
        </div>
      ),
      sortable: false,
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
      render: (value: any, record: Role) => (
        <div className="flex items-center space-x-2">
          <Link
            href={`/dashboard/roles/${record.id}`}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            <EyeIcon className="h-3 w-3 mr-1" />
            Xem
          </Link>
          
          <Link
            href={`/dashboard/roles/${record.id}/edit`}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded hover:bg-indigo-200"
          >
            <PencilIcon className="h-3 w-3 mr-1" />
            Sửa
          </Link>

          <button
            onClick={() => handleDelete(record.id)}
            disabled={deleteLoading === record.id || record.isDefault}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={record.isDefault ? 'Không thể xóa vai trò mặc định' : 'Xóa vai trò'}
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
            Quản lý vai trò
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Tổng số: {totalItems} vai trò
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            href="/dashboard/roles/create"
              className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 text-sm font-medium bg-blue-400 text-gray-700 hover:bg-gray-50"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Thêm vai trò
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow text-black">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên vai trò..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại vai trò
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={isDefaultFilter}
              onChange={(e) => setIsDefaultFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="true">Vai trò mặc định</option>
              <option value="false">Vai trò tùy chỉnh</option>
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
          data={roles}
          loading={loading}
          emptyText={
            searchTerm || isDefaultFilter !== 'all'
              ? 'Không tìm thấy vai trò phù hợp'
              : 'Chưa có vai trò nào'
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
      {!loading && roles.length === 0 && !searchTerm && isDefaultFilter === 'all' && (
        <div className="text-center py-12">
          <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có vai trò</h3>
          <p className="mt-1 text-sm text-gray-500">
            Bắt đầu bằng cách thêm vai trò đầu tiên.
          </p>
          <div className="mt-6 text-black">
            <Link
              href="/dashboard/roles/create"
              className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 text-sm font-medium bg-green-400 text-gray-700 hover:bg-gray-50"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Thêm vai trò đầu tiên
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}