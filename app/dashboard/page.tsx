// app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiService } from '@/lib/api';
import {
  CreditCardIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalCards: number;
  totalMeetings: number;
  totalUsers: number;
  cardsByStatus: Record<string, number>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCards: 0,
    totalMeetings: 0,
    totalUsers: 0,
    cardsByStatus: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [cardsResponse, cardsCountResponse, meetingsResponse, usersResponse] = await Promise.all([
        apiService.getAllCards(),
        apiService.getCardsCount(),
        apiService.getAllMeetings(),
        apiService.getUsers(),
      ]);

      setStats({
        totalCards: cardsResponse.count || 0,
        totalMeetings: meetingsResponse?.length || 0,
        totalUsers: usersResponse?.length || 0,
        cardsByStatus: cardsCountResponse || {},
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Tổng số thẻ',
      stat: stats.totalCards,
      icon: CreditCardIcon,
      color: 'bg-blue-500',
      href: '/dashboard/cards',
    },
    {
      name: 'Cuộc họp',
      stat: stats.totalMeetings,
      icon: CalendarIcon,
      color: 'bg-green-500',
      href: '/dashboard/meetings',
    },
    {
      name: 'Người dùng',
      stat: stats.totalUsers,
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      href: '/dashboard/users',
    },
    {
      name: 'Thống kê',
      stat: Object.keys(stats.cardsByStatus).length,
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      href: '#',
    },
  ];

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Tổng quan hệ thống quản lý thẻ danh thiếp
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${item.color} p-3 rounded-md`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {item.stat.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Cards by status */}
      {Object.keys(stats.cardsByStatus).length > 0 && (
        <div className="bg-white shadow rounded-lg mb-8 border border-gray-400">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Thẻ theo trạng thái
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ">
              {Object.entries(stats.cardsByStatus).map(([status, count]) => (
                <div
                  key={status}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {status || 'Không xác định'}
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {count}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <CreditCardIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="bg-white shadow rounded-lg border border-gray-300">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Thao tác nhanh
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/dashboard/cards/upload"
              className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 hover:bg-indigo-100 transition-colors"
            >
              <div className="flex items-center">
                <CreditCardIcon className="h-6 w-6 text-indigo-600 mr-3" />
                <span className="text-sm font-medium text-indigo-900">
                  Tải lên thẻ mới
                </span>
              </div>
            </Link>
            
            <Link
              href="/dashboard/meetings/create"
              className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center">
                <CalendarIcon className="h-6 w-6 text-green-600 mr-3" />
                <span className="text-sm font-medium text-green-900">
                  Tạo cuộc họp
                </span>
              </div>
            </Link>

            <Link
              href="/dashboard/users/create"
              className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors"
            >
              <div className="flex items-center">
                <UserGroupIcon className="h-6 w-6 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-purple-900">
                  Thêm người dùng
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}