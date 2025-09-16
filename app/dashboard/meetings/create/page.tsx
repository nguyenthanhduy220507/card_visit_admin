// app/dashboard/meetings/create/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { Card } from '@/types';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface CreateMeetingForm {
  title: string;
  description: string;
  date: string;
  note: string;
  locationType: 'online' | 'office' | '';
  locationDetail: string;
  participantIds: number[];
}

export default function MeetingCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [searchCards, setSearchCards] = useState('');
  const [showCardSelector, setShowCardSelector] = useState(false);
  const [formData, setFormData] = useState<CreateMeetingForm>({
    title: '',
    description: '',
    date: '',
    note: '',
    locationType: '',
    locationDetail: '',
    participantIds: [],
  });

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const response = await apiService.getAllCards();
      setCards(response.cards || []);
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddParticipant = (cardId: number) => {
    if (!formData.participantIds.includes(cardId)) {
      setFormData(prev => ({
        ...prev,
        participantIds: [...prev.participantIds, cardId]
      }));
    }
  };

  const handleRemoveParticipant = (cardId: number) => {
    setFormData(prev => ({
      ...prev,
      participantIds: prev.participantIds.filter(id => id !== cardId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề cuộc họp');
      return;
    }

    try {
      setLoading(true);
      const meetingData = {
        ...formData,
        date: formData.date || null,
        locationType: formData.locationType || null,
        participantIds: formData.participantIds,
      };

      const result = await apiService.createMeeting(meetingData);
      toast.success('Tạo cuộc họp thành công!');
      // router.push(`/dashboard/meetings/${result.id}`);
      router.push('/dashboard/meetings');
    } catch (error: any) {
      console.error('Error creating meeting:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi tạo cuộc họp');
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = cards.filter(card =>
    card.holderName?.toLowerCase().includes(searchCards.toLowerCase()) ||
    card.id.toString().includes(searchCards)
  );

  const selectedCards = cards.filter(card => formData.participantIds.includes(card.id));

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
                  <span className="text-sm font-medium text-gray-500">Tạo cuộc họp mới</span>
                </div>
              </li>
            </ol>
          </nav>
          
          <h1 className="text-2xl font-bold text-gray-900">Tạo cuộc họp mới</h1>
          <p className="mt-1 text-sm text-gray-500">
            Điền thông tin để tạo cuộc họp và thêm người tham gia
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg text-black border border-gray-300">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Thông tin cuộc họp</h2>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Tiêu đề cuộc họp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  className="mt-1 block w-full form-input text-black p-4 border border-gray-300"
                  placeholder="Nhập tiêu đề cuộc họp"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  className="mt-1 block w-full form-textarea text-black p-4 border border-gray-300"
                  placeholder="Mô tả chi tiết về cuộc họp"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Ngày và giờ
                </label>
                <div className="mt-1 relative">
                  <input
                    type="datetime-local"
                    name="date"
                    id="date"
                    className="block w-full form-input pl-10 text-black p-4 border border-gray-300"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Location Type */}
              <div>
                <label htmlFor="locationType" className="block text-sm font-medium text-gray-700">
                  Loại địa điểm
                </label>
                <select
                  name="locationType"
                  id="locationType"
                  className="mt-1 block w-full form-select text-black p-4 border border-gray-300"
                  value={formData.locationType}
                  onChange={handleInputChange}
                >
                  <option value="">Chọn loại địa điểm</option>
                  <option value="online">Online</option>
                  <option value="office">Office</option>
                </select>
              </div>

              {/* Location Detail */}
              <div>
                <label htmlFor="locationDetail" className="block text-sm font-medium text-gray-700">
                  Chi tiết địa điểm
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    name="locationDetail"
                    id="locationDetail"
                    className="block w-full form-input pl-10 py-4 border border-gray-300"
                    placeholder={formData.locationType === 'online' ? 'Link Google Meet, Zoom...' : 'Địa chỉ văn phòng'}
                    value={formData.locationDetail}
                    onChange={handleInputChange}
                  />
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Note */}
              <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                  Ghi chú
                </label>
                <textarea
                  name="note"
                  id="note"
                  rows={2}
                  className="mt-1 block w-full form-textarea p-4 border border-gray-300"
                  placeholder="Ghi chú thêm về cuộc họp"
                  value={formData.note}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="bg-white shadow rounded-lg border border-gray-300">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2" />
                  Người tham gia ({selectedCards.length})
                </h2>
                <button
                  type="button"
                  onClick={() => setShowCardSelector(!showCardSelector)}
                  className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
                >
                  {showCardSelector ? 'Ẩn' : 'Thêm người tham gia'}
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              {/* Selected Participants */}
              {selectedCards.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Đã chọn:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCards.map((card) => (
                      <div
                        key={card.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                      >
                        <span>{card.holderName || `Thẻ #${card.id}`}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveParticipant(card.id)}
                          className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Card Selector */}
              {showCardSelector && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="mb-3">
                    <div className="relative">
                      <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm thẻ..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        value={searchCards}
                        onChange={(e) => setSearchCards(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {filteredCards.map((card) => {
                      const isSelected = formData.participantIds.includes(card.id);
                      return (
                        <div
                          key={card.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-200'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => 
                            isSelected 
                              ? handleRemoveParticipant(card.id)
                              : handleAddParticipant(card.id)
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {card.holderName || `Thẻ #${card.id}`}
                              </p>
                              <p className="text-sm text-gray-500">ID: {card.id}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-600'
                                : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-white ml-0.5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
              disabled={loading}
              className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 text-sm font-medium bg-blue-400 text-gray-700 hover:bg-gray-50"
            >
              {loading ? 'Đang tạo...' : 'Tạo cuộc họp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}