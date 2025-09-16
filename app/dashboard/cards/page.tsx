// app/dashboard/cards/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { apiService } from '@/lib/api';
import { Card } from '@/types';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [scanningIds, setScanningIds] = useState<Set<number>>(new Set());


  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllCards();
      setCards(response.cards || []);
    } catch (error) {
      console.error('Error loading cards:', error);
      toast.error('Lỗi khi tải danh sách thẻ');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thẻ này?')) {
      return;
    }

    try {
      setDeleteLoading(id);
      await apiService.deleteCard(id);
      setCards(cards.filter(card => card.id !== id));
      toast.success('Xóa thẻ thành công');
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Lỗi khi xóa thẻ');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleScan = async (id: number) => {
    try {
      setScanningIds(prev => new Set(prev).add(id));
      toast.loading('Đang quét thẻ...', { id: 'scan' });
      const result = await apiService.scanCard(id);

      // Update card in list
      setCards(cards.map(card =>
        card.id === id ? { ...card, ...result } : card
      ));

      toast.success('Quét thẻ thành công', { id: 'scan' });
    } catch (error) {
      console.error('Error scanning card:', error);
      toast.error('Lỗi khi quét thẻ', { id: 'scan' });
    } finally {
      setScanningIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);          // xoá id đã xong
        return newSet;
      });
    }
  };

  const filteredCards = cards.filter(card => {
    const matchesSearch = !searchTerm ||
      card.holderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.id.toString().includes(searchTerm);

    const matchesStatus = selectedStatus === 'all' || card.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const uniqueStatuses = [...new Set(cards.map(card => card.status).filter(Boolean))];

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'uploaded': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'ready': 'bg-green-100 text-green-800',
      'error': 'bg-red-100 text-red-800',
    };

    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
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
      <div className="md:flex md:items-center md:justify-between mb-6 ">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate py-3">
            Quản lý thẻ danh thiếp
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Tổng số: {filteredCards.length} thẻ
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            href="/dashboard/cards/upload"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Tải lên thẻ mới
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 text-black">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc ID..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          {uniqueStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-12">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có thẻ nào</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Không tìm thấy thẻ phù hợp với tìm kiếm.' : 'Bắt đầu bằng cách tải lên thẻ đầu tiên.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Link
                href="/dashboard/cards/upload"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Tải lên thẻ mới
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {filteredCards.map((card) => {
            const isScanning = scanningIds.has(card.id);
            return (
              <div key={card.id} className="relative bg-white shadow rounded-lg overflow-hidden border border-gray-400">
              {/* Overlay loading */}
              {isScanning && (
                <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                  <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              {/* Card Image */}
              <div className="aspect-w-16 aspect-h-10 bg-gray-200">
                {card.frontImageUrl ? (
                  <Image
                    src={card.frontImageUrl}
                    alt={`Card ${card.id}`}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-48">
                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Card Info */}
              <div className="p-4">
                {/* Overlay loading */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {card.holderName || `Thẻ #${card.id}`}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {card.id}
                    </p>
                    {card.status && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getStatusBadge(card.status)}`}>
                        {card.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex space-x-2">
                  <Link
                    href={`/dashboard/cards/${card.id}`}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Xem
                  </Link>

                  <Link
                    href={`/dashboard/cards/${card.id}/edit`}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Sửa
                  </Link>

                  <button
                    onClick={() => handleScan(card.id)}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-indigo-300 shadow-sm text-xs font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                    disabled={isScanning} // <-- disable trong khi loading
                  >
                    Quét
                  </button>

                  <button
                    onClick={() => handleDelete(card.id)}
                    disabled={deleteLoading === card.id}
                    className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                  >
                    {deleteLoading === card.id ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                    ) : (
                      <TrashIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}