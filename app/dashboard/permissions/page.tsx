// app/dashboard/permissions/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiService } from '@/lib/api';
import { Permission } from '@/types';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import DataTable from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/DataTable';
import {
  EyeIcon,
  PencilIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadPermissions();
  }, [currentPage, itemsPerPage]);

  const loadPermissions = async (search?: { 
    search?: string; 
    resource?: string; 
    action?: string;
    page?: number; 
    limit?: number; 
  }) => {
    try {
      setLoading(true);
      const params = {
        page: search?.page || currentPage,
        limit: search?.limit || itemsPerPage,
        search: search?.search || searchTerm,
        resource: search?.resource || resourceFilter,
        action: search?.action || actionFilter,
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key as keyof typeof params]) {
          delete params[key as keyof typeof params];
        }
      });

      const response = await apiService.getPermissionsFilter(params);
      
      if (response.data) {
        setPermissions(response.data);
        setTotalItems(response.total || 0);
        setTotalPages(response.totalPages || 0);
      } else {
        // Fallback to regular permissions endpoint
        const fallbackResponse = await apiService.getPermissions(params);
        setPermissions(fallbackResponse || []);
        setTotalItems(fallbackResponse?.length || 0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      toast.error('Lỗi khi tải danh sách quyền hạn');
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadPermissions({ 
      search: searchTerm, 
      resource: resourceFilter, 
      action: actionFilter, 
      page: 1 
    });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setResourceFilter('');
    setActionFilter('');
    setCurrentPage(1);
    loadPermissions({ page: 1 });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  // Get unique resources and actions for filters
  const availableResources = [...new Set(permissions.map(p => p.resource))];
  const availableActions = [...new Set(permissions.map(p => p.action))];

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

  const columns = [
    {
      key: 'name',
      title: 'Tên quyền',
      render: (value: string, record: Permission) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <KeyIcon className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{record.name}</p>
            <p className="text-xs text-gray-500">ID: {record.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'resource',
      title: 'Tài nguyên',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getResourceColor(value)}`}>
          <TagIcon className="h-3 w-3 mr-1" />
          {value}
        </span>
      ),
    },
    {
      key: 'action',
      title: 'Hành động',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(value)}`}>
          {value}
        </span>
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
      render: (value: any, record: Permission) => (
        <div className="flex items-center space-x-2">
          <Link
            href={`/dashboard/permissions/${record.id}`}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            <EyeIcon className="h-3 w-3 mr-1" />
            Xem
          </Link>
          
          <Link
            href={`/dashboard/permissions/${record.id}/edit`}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded hover:bg-indigo-200"
          >
            <PencilIcon className="h-3 w-3 mr-1" />
            Sửa
          </Link>
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
            Quản lý quyền hạn
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Tổng số: {totalItems} quyền hạn
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow text-black border border-gray-300">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên quyền..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tài nguyên
            </label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hành động
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="">Tất cả hành động</option>
              {availableActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
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

      {/* Info Banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <KeyIcon className="h-5 w-5 text-blue-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Thông tin về quyền hạn
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              Quyền hạn được tự động tạo bởi hệ thống dựa trên các tài nguyên và hành động có sẵn. 
              Bạn chỉ có thể chỉnh sửa mô tả của quyền hạn.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5 border border-gray-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <KeyIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tổng quyền hạn
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {totalItems}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5 border border-gray-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TagIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tài nguyên
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {availableResources.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5 border border-gray-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Hành động
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {availableActions.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5 border border-gray-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">%</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Có mô tả
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {Math.round((permissions.filter(p => p.description).length / Math.max(permissions.length, 1)) * 100)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={permissions}
          loading={loading}
          emptyText={
            searchTerm || resourceFilter || actionFilter
              ? 'Không tìm thấy quyền hạn phù hợp'
              : 'Chưa có quyền hạn nào'
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

      {/* Resources & Actions Overview */}
      {!loading && permissions.length > 0 && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resources */}
          <div className="bg-white shadow rounded-lg border border-gray-300">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <TagIcon className="h-5 w-5 mr-2" />
                Tài nguyên ({availableResources.length})
              </h3>
            </div>
            <div className="px-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                {availableResources.map(resource => {
                  const count = permissions.filter(p => p.resource === resource).length;
                  return (
                    <div key={resource} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getResourceColor(resource)}`}>
                        {resource}
                      </span>
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white shadow rounded-lg border border-gray-300">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Hành động ({availableActions.length})
              </h3>
            </div>
            <div className="px-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                {availableActions.map(action => {
                  const count = permissions.filter(p => p.action === action).length;
                  return (
                    <div key={action} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getActionColor(action)}`}>
                        {action}
                      </span>
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && permissions.length === 0 && !searchTerm && !resourceFilter && !actionFilter && (
        <div className="text-center py-12">
          <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có quyền hạn</h3>
          <p className="mt-1 text-sm text-gray-500">
            Quyền hạn sẽ được tự động tạo khi hệ thống khởi tạo.
          </p>
        </div>
      )}
    </div>
  );
}