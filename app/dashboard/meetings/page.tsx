// app/dashboard/meetings/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiService } from '@/lib/api';
import { Meeting } from '@/types';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async (search?: { q?: string; dateFrom?: string; dateTo?: string }) => {
    try {
      setLoading(true);
      const response = await apiService.getMeetings(search);
      setMeetings(response || []);
    } catch (error) {
      console.error('Error loading meetings:', error);
      toast.error('Lỗi khi tải danh sách cuộc họp');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa cuộc họp này?')) {
      return;
    }

    try {
      setDeleteLoading(id);
      await apiService.deleteMeeting(id);
      setMeetings(meetings.filter(meeting => meeting.id !== id));
      toast.success('Xóa cuộc họp thành công');
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast.error('Lỗi khi xóa cuộc họp');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSearch = () => {
    loadMeetings({
      q: searchTerm,
      dateFrom: dateFrom,
      dateTo: dateTo,
    });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    loadMeetings();
  };

  const getLocationIcon = (locationType: string) => {
    switch (locationType) {
      case 'online':
        return '🌐';
      case 'office':
        return '🏢';
      default:
        return '📍';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return dateString;
    }
  };

  if (loading && meetings.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white shadow rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate py-4">
            Quản lý cuộc họp
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Tổng số: {meetings.length} cuộc họp
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            href="/dashboard/meetings/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Tạo cuộc họp mới
          </Link>
        </div>
      </div>

      {/* Search Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow text-black border border-gray-300">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tiêu đề..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Từ ngày
            </label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đến ngày
            </label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={handleSearch}
              className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Tìm kiếm
            </button>
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>

      {/* Meetings List */}
      {meetings.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có cuộc họp nào</h3>
          <p className="mt-1 text-sm text-gray-500">
            Bắt đầu bằng cách tạo cuộc họp đầu tiên.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/meetings/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Tạo cuộc họp mới
            </Link>
          </div>
        </div>
      ) : (
        // ⬇️ Grid responsive giống cards
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {meetings.map((meeting) => (
            // ⬇️ Card chuẩn, cao đều, nội dung co giãn
            <div key={meeting.id} className="bg-white shadow rounded-lg overflow-hidden flex flex-col border border-gray-300">
              <div className="px-6 py-4 flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* FIX: template string */}
                    <h3 className="text-lg font-medium text-gray-900">
                      {meeting.title || `Cuộc họp #${meeting.id}`}
                    </h3>

                    {meeting.description && (
                      <p className="mt-1 text-sm text-gray-600">{meeting.description}</p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      {meeting.date && (
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {formatDate(meeting.date)}
                        </div>
                      )}

                      {meeting.locationType && (
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          <span className="mr-1">{getLocationIcon(meeting.locationType)}</span>
                          {meeting.locationDetail || meeting.locationType}
                        </div>
                      )}

                      <div className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        {meeting.participants?.length || 0} người tham gia
                      </div>
                    </div>

                    {meeting.note && (
                      <div className="mt-3 p-3 bg-green-50 rounded-md">
                        <p className="text-sm text-black">{meeting.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ⬇️ Thanh action nằm cuối card */}
              <div className="px-6 pb-4">
                <div className="flex items-center flex-wrap gap-2">
                  {/* FIX: template string cho href */}
                  <Link
                    href={`/dashboard/meetings/${meeting.id}`}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Xem
                  </Link>

                  <Link
                    href={`/dashboard/meetings/${meeting.id}/edit`}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Sửa
                  </Link>

                  <button
                    onClick={() => handleDelete(meeting.id)}
                    disabled={deleteLoading === meeting.id}
                    className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                  >
                    {deleteLoading === meeting.id ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600" />
                    ) : (
                      <>
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Xóa
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
      }
    </div>
  );
}