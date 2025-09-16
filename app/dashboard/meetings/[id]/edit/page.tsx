// app/dashboard/meetings/[id]/edit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { Card, Meeting } from '@/types';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface UpdateMeetingForm {
  title: string;
  description: string;
  date: string;
  note: string;
  locationType: 'online' | 'office' | '';
  locationDetail: string;
  participantIds: number[];
}

export default function MeetingEditPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [searchCards, setSearchCards] = useState('');
  const [showCardSelector, setShowCardSelector] = useState(false);
  const [formData, setFormData] = useState<UpdateMeetingForm>({
    title: '',
    description: '',
    date: '',
    note: '',
    locationType: '',
    locationDetail: '',
    participantIds: [],
  });

  const meetingId = parseInt(params.id as string);

  useEffect(() => {
    if (meetingId) {
      loadData();
    }
  }, [meetingId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [meetingResponse, cardsResponse] = await Promise.all([
        apiService.getMeeting(meetingId),
        apiService.getAllCards(),
      ]);

      setMeeting(meetingResponse);
      setCards(cardsResponse.cards || []);

      // Populate form with existing data
      setFormData({
        title: meetingResponse.title || '',
        description: meetingResponse.description || '',
        date: meetingResponse.date ? new Date(meetingResponse.date).toISOString().slice(0, 16) : '',
        note: meetingResponse.note || '',
        locationType: meetingResponse.locationType || '',
        locationDetail: meetingResponse.locationDetail || '',
        participantIds: meetingResponse.participants?.map((p: { id: number })  => p.id) || [],
      });
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Lỗi khi tải dữ liệu');
      if (error?.response?.status === 404) {
        router.push('/dashboard/meetings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddParticipant = async (cardId: number) => {
    if (formData.participantIds.includes(cardId)) return;

    try {
      await apiService.addMeetingParticipants(meetingId, [cardId]);
      setFormData(prev => ({
        ...prev,
        participantIds: [...prev.participantIds, cardId]
      }));
      toast.success('Thêm người tham gia thành công');
    } catch (error) {
      console.error('Error adding participant:', error);
      toast.error('Lỗi khi thêm người tham gia');
    }
  };

  const handleRemoveParticipant = async (cardId: number) => {
    try {
      await apiService.removeMeetingParticipant(meetingId, cardId);
      setFormData(prev => ({
        ...prev,
        participantIds: prev.participantIds.filter(id => id !== cardId)
      }));
      toast.success('Xóa người tham gia thành công');
    } catch (error) {
      console.error('Error removing participant:', error);
      toast.error('Lỗi khi xóa người tham gia');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề cuộc họp');
      return;
    }

    try {
      setSaving(true);
      const updateData = {
        title: formData.title,
        description: formData.description || null,
        date: formData.date || null,
        note: formData.note || null,
        locationType: formData.locationType || null,
        locationDetail: formData.locationDetail || null,
      };

      await apiService.updateMeeting(meetingId, updateData);
      toast.success('Cập nhật cuộc họp thành công!');
      router.push(`/dashboard/meetings/${meetingId}`);
    } catch (error: any) {
      console.error('Error updating meeting:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi cập nhật cuộc họp');
    } finally {
      setSaving(false);
    }
  };

  const filteredCards = cards.filter(card =>
    card.holderName?.toLowerCase().includes(searchCards.toLowerCase()) ||
    card.id.toString().includes(searchCards)
  );

  const selectedCards = cards.filter(card => formData.participantIds.includes(card.id));
  const availableCards = filteredCards.filter(card => !formData.participantIds.includes(card.id));

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy cuộc họp</h3>
          <p className="mt-1 text-sm text-gray-500">
            Cuộc họp có ID {meetingId} không tồn tại hoặc đã bị xóa.
          </p>
        </div>
      </div>
    );
  }

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
                  <span className="text-sm font-medium text-gray-500">Chỉnh sửa cuộc họp</span>
                </div>
              </li>
            </ol>
          </nav>
          
          <h1 className="text-2xl font-bold text-gray-900">
            Chỉnh sửa: {meeting.title || `Cuộc họp #${meeting.id}`}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Cập nhật thông tin cuộc họp và quản lý người tham gia
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Thông tin cuộc họp</h2>
            </div>
            
            <div className="px-6 py-4 space-y-4 text-black">
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
                  className="mt-1 block w-full form-input p-4 border border-gray-300"
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
                  className="mt-1 block w-full form-textarea p-4 border border-gray-300"
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
                    className="block w-full form-input pl-10 p-4 border border-gray-300"
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
                  className="mt-1 block w-full form-select p-4 border border-gray-300"
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
                    className="block w-full form-input pl-10 p-4 border border-gray-300"
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
                  className="mt-1 block w-full form-textarea p-4  border border-gray-300"
                  placeholder="Ghi chú thêm về cuộc họp"
                  value={formData.note}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="bg-white shadow rounded-lg border border-gray-200">
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
              {/* Current Participants */}
              {selectedCards.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Người tham gia hiện tại:</h3>
                  <div className="space-y-2">
                    {selectedCards.map((card) => (
                      <div
                        key={card.id}
                        className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-full text-xs font-medium text-white">
                              {card.holderName ? card.holderName.charAt(0).toUpperCase() : '#'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {card.holderName || `Thẻ #${card.id}`}
                            </p>
                            <p className="text-xs text-gray-500">ID: {card.id}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveParticipant(card.id)}
                          className="inline-flex items-center justify-center w-6 h-6 text-red-400 hover:bg-red-100 hover:text-red-500 rounded-full"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Participants */}
              {showCardSelector && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="mb-3">
                    <div className="relative">
                      <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm thẻ để thêm..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        value={searchCards}
                        onChange={(e) => setSearchCards(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto">
                    {availableCards.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        {searchCards ? 'Không tìm thấy thẻ phù hợp' : 'Tất cả thẻ đã được thêm vào cuộc họp'}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {availableCards.map((card) => (
                          <div
                            key={card.id}
                            className="p-3 border border-gray-200 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => handleAddParticipant(card.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-600 rounded-full text-xs font-medium text-white">
                                    {card.holderName ? card.holderName.charAt(0).toUpperCase() : '#'}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {card.holderName || `Thẻ #${card.id}`}
                                  </p>
                                  <p className="text-xs text-gray-500">ID: {card.id}</p>
                                </div>
                              </div>
                              <div className="text-sm text-indigo-600">Thêm +</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
              disabled={saving}
              className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 text-sm font-medium bg-blue-400 text-gray-700 hover:bg-gray-50"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" color="white" />
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}