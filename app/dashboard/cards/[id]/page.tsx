// app/dashboard/cards/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { apiService } from '@/lib/api';
import { Card } from '@/types';
import { toast } from 'react-hot-toast';
import { formatDate, getStatusColor } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  EyeIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  CreditCardIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

export default function CardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);

  const cardId = params.id as string;

  useEffect(() => {
    if (cardId) {
      loadCard();
    }
  }, [cardId]);

  const loadCard = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCard(parseInt(cardId));
      setCard(response);
    } catch (error: any) {
      console.error('Error loading card:', error);
      toast.error('Lỗi khi tải thông tin thẻ');
      if (error?.response?.status === 404) {
        router.push('/dashboard/cards');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thẻ này?')) {
      return;
    }

    try {
      setDeleteLoading(true);
      await apiService.deleteCard(parseInt(cardId));
      toast.success('Xóa thẻ thành công');
      router.push('/dashboard/cards');
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Lỗi khi xóa thẻ');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleScan = async () => {
    try {
      setScanLoading(true);
      toast.loading('Đang quét thẻ...', { id: 'scan' });
      const result = await apiService.scanCard(parseInt(cardId));
      setCard(prev => prev ? { ...prev, ...result } : null);
      toast.success('Quét thẻ thành công', { id: 'scan' });
    } catch (error) {
      console.error('Error scanning card:', error);
      toast.error('Lỗi khi quét thẻ', { id: 'scan' });
    } finally {
      setScanLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center py-12">
          <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy thẻ</h3>
          <p className="mt-1 text-sm text-gray-500">
            Thẻ có ID {cardId} không tồn tại hoặc đã bị xóa.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/cards"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/dashboard/cards" className="text-gray-400 hover:text-gray-500">
                    <ArrowLeftIcon className="h-5 w-5" />
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="text-gray-400 mx-2">/</span>
                    <span className="text-sm font-medium text-gray-500">Chi tiết thẻ</span>
                  </div>
                </li>
              </ol>
            </nav>
            
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate py-3">
              {card.holderName || `Thẻ #${card.id}`}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              ID: {card.id} • Tạo: {formatDate(card.createdAt)} • Cập nhật: {formatDate(card.updatedAt)}
            </p>
          </div>
          
          <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
            <button
              onClick={handleScan}
              disabled={scanLoading}
              className="inline-flex items-center px-4 py-2 border border-indigo-300 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50"
            >
              {scanLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <EyeIcon className="h-4 w-4 mr-2" />
              )}
              Quét lại
            </button>
            
            <Link
              href={`/dashboard/cards/${card.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Link>
            
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50"
            >
              {deleteLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <TrashIcon className="h-4 w-4 mr-2" />
              )}
              Xóa
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-6">
            {/* Front Image */}
            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-300">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Mặt trước</h3>
              </div>
              <div className="p-4">
                {card.frontImageUrl ? (
                  <div className="aspect-w-16 aspect-h-10">
                    <Image
                      src={card.frontImageUrl}
                      alt="Card front"
                      width={600}
                      height={400}
                      className="w-full h-auto object-contain rounded-lg border"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Back Image */}
            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-300">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Mặt sau</h3>
              </div>
              <div className="p-4">
                {card.backImageUrl ? (
                  <div className="aspect-w-16 aspect-h-10">
                    <Image
                      src={card.backImageUrl}
                      alt="Card back"
                      width={600}
                      height={400}
                      className="w-full h-auto object-contain rounded-lg border"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Avatar */}
            {card.avatar && (
              <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-300">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Ảnh đại diện</h3>
                </div>
                <div className="p-4">
                  <div className="aspect-w-1 aspect-h-1 max-w-xs mx-auto">
                    <Image
                      src={card.avatar}
                      alt="Avatar"
                      width={300}
                      height={300}
                      className="w-full h-auto object-cover rounded-lg border"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Information */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Thông tin cơ bản
                </h3>
              </div>
              <div className="px-4 py-4">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Tên chủ thẻ</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {card.holderName || 'Chưa xác định'}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Trạng thái</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(card.status || '')}`}>
                        {card.status || 'Không xác định'}
                      </span>
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Ngày tạo</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {formatDate(card.createdAt)}
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Cập nhật lần cuối</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {formatDate(card.updatedAt)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Extracted Data */}
            {card.extractedData && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Dữ liệu trích xuất
                  </h3>
                </div>
                <div className="px-4 py-4">
                  <pre className="text-xs text-gray-700 bg-gray-50 rounded-lg p-4 overflow-auto max-h-64">
                    {JSON.stringify(card.extractedData, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Merge Data */}
            {card.merge && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Dữ liệu đã merge
                  </h3>
                </div>
                <div className="px-4 py-4">
                  <pre className="text-xs text-gray-700 bg-gray-50 rounded-lg p-4 overflow-auto max-h-64">
                    {JSON.stringify(card.merge, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}