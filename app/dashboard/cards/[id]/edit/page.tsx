// app/dashboard/cards/[id]/edit/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { Card } from '@/types';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

interface FileWithPreview extends File {
  preview?: string;
}

interface EditCardForm {
  holderName: string;
  extractedData: any;
  merge: any;
  status: string;
}

export default function CardEditPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [card, setCard] = useState<Card | null>(null);
  const [files, setFiles] = useState<{
    front?: FileWithPreview;
    back?: FileWithPreview;
    avatar?: FileWithPreview;
  }>({});
  const [formData, setFormData] = useState<EditCardForm>({
    holderName: '',
    extractedData: {},
    merge: {},
    status: '',
  });

  const cardId = parseInt(params.id as string);

  useEffect(() => {
    if (cardId) {
      loadCard();
    }
  }, [cardId]);

  const loadCard = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCard(cardId);
      setCard(response);
      
      // Populate form with existing data
      setFormData({
        holderName: response.holderName || '',
        extractedData: response.extractedData || {},
        merge: response.merge || {},
        status: response.status || '',
      });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleJsonChange = (field: 'extractedData' | 'merge', value: string) => {
    try {
      const parsed = value ? JSON.parse(value) : {};
      setFormData(prev => ({ ...prev, [field]: parsed }));
    } catch (error) {
      // Keep the raw text for editing, will validate on submit
    }
  };

  const handleFile = useCallback((file: File, type: 'front' | 'back' | 'avatar') => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File không được lớn hơn 10MB');
      return;
    }

    const fileWithPreview = Object.assign(file, {
      preview: URL.createObjectURL(file)
    });

    setFiles(prev => ({ ...prev, [type]: fileWithPreview }));
  }, []);

  const handleInputFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back' | 'avatar') => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0], type);
    }
  }, [handleFile]);

  const removeFile = useCallback((type: 'front' | 'back' | 'avatar') => {
    setFiles(prev => {
      const newFiles = { ...prev };
      if (newFiles[type]?.preview) {
        URL.revokeObjectURL(newFiles[type]!.preview!);
      }
      delete newFiles[type];
      return newFiles;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Validate JSON fields
      let extractedData = formData.extractedData;
      let merge = formData.merge;
      
      if (typeof extractedData === 'string') {
        try {
          extractedData = JSON.parse(extractedData);
        } catch {
          toast.error('Dữ liệu trích xuất không phải JSON hợp lệ');
          return;
        }
      }

      if (typeof merge === 'string') {
        try {
          merge = JSON.parse(merge);
        } catch {
          toast.error('Dữ liệu merge không phải JSON hợp lệ');
          return;
        }
      }

      const updateData = {
        holderName: formData.holderName || null,
        extractedData,
        merge,
        status: formData.status || null,
      };

      // Create FormData if files are selected
      let payload: FormData | any = updateData;
      if (files.front || files.back || files.avatar) {
        const formData = new FormData();
        
        if (files.front) {
          formData.append('front', files.front);
        }
        if (files.back) {
          formData.append('back', files.back);
        }
        if (files.avatar) {
          formData.append('avatar', files.avatar);
        }
        
        payload = formData;
      }

      await apiService.updateCardMerge(cardId, updateData, payload instanceof FormData ? payload : undefined);
      toast.success('Cập nhật thẻ thành công!');
      router.push(`/dashboard/cards/${cardId}`);
    } catch (error: any) {
      console.error('Error updating card:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi cập nhật thẻ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
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
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy thẻ</h3>
          <p className="mt-1 text-sm text-gray-500">
            Thẻ có ID {cardId} không tồn tại hoặc đã bị xóa.
          </p>
        </div>
      </div>
    );
  }

  const FileUploadZone = ({ 
    type, 
    title, 
    currentImage 
  }: { 
    type: 'front' | 'back' | 'avatar';
    title: string;
    currentImage?: string;
  }) => {
    const file = files[type];
    const imageToShow = file ? file.preview : currentImage;

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {title}
        </label>
        
        {imageToShow ? (
          <div className="relative">
            <img
              src={imageToShow}
              alt={title}
              className="w-full h-48 object-cover rounded-lg border"
            />
            <div className="absolute top-2 right-2 flex space-x-1">
              <label className="bg-indigo-600 text-white rounded-full p-1 hover:bg-indigo-700 cursor-pointer">
                <PencilIcon className="h-4 w-4" />
                <input
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={(e) => handleInputFileChange(e, type)}
                />
              </label>
              {file && (
                <button
                  type="button"
                  onClick={() => removeFile(type)}
                  className="bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
            <div className="space-y-1 text-center">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                  <span>Chọn file mới</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={(e) => handleInputFileChange(e, type)}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
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
                  <span className="text-sm font-medium text-gray-500">Chỉnh sửa thẻ</span>
                </div>
              </li>
            </ol>
          </nav>
          
          <h1 className="text-2xl font-bold text-gray-900 py-3">
            Chỉnh sửa: {card.holderName || `Thẻ #${card.id}`}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Cập nhật thông tin thẻ và thay đổi hình ảnh
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images */}
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Hình ảnh</h2>
                </div>
                
                <div className="px-6 py-4 space-y-6">
                  <FileUploadZone
                    type="front"
                    title="Ảnh mặt trước"
                    currentImage={card.frontImageUrl}
                  />

                  <FileUploadZone
                    type="back"
                    title="Ảnh mặt sau"
                    currentImage={card.backImageUrl}
                  />

                  <FileUploadZone
                    type="avatar"
                    title="Ảnh đại diện"
                    currentImage={card.avatar || undefined}
                  />
                </div>
              </div>
            </div>

            {/* Form Data */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Thông tin cơ bản</h2>
                </div>
                
                <div className="px-6 py-4 space-y-4 text-black">
                  <div>
                    <label htmlFor="holderName" className="block text-sm font-medium text-gray-700">
                      Tên chủ thẻ
                    </label>
                    <input
                      type="text"
                      name="holderName"
                      id="holderName"
                      className="mt-1 block w-full form-input p-4 border"
                      placeholder="Nhập tên chủ thẻ"
                      value={formData.holderName}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Trạng thái
                    </label>
                    <select
                      name="status"
                      id="status"
                      className="mt-1 block w-full form-select"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="">Chọn trạng thái</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="error">Error</option>
                    </select>
                  </div> */}
                </div>
              </div>

              {/* Extracted Data */}
              <div className="bg-white shadow rounded-lg text-black">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Dữ liệu trích xuất</h2>
                </div>
                
                <div className="px-6 py-4">
                  <textarea
                    rows={8}
                    className="block w-full form-textarea font-mono text-sm"
                    placeholder="Nhập dữ liệu JSON"
                    value={typeof formData.extractedData === 'string' 
                      ? formData.extractedData 
                      : JSON.stringify(formData.extractedData, null, 2)}
                    onChange={(e) => handleJsonChange('extractedData', e.target.value)}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Dữ liệu JSON từ quá trình nhận dạng OCR
                  </p>
                </div>
              </div>

              {/* Merge Data */}
              <div className="bg-white shadow rounded-lg text-black">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Dữ liệu đã merge</h2>
                </div>
                
                <div className="px-6 py-4">
                  <textarea
                    rows={8}
                    className="block w-full form-textarea font-mono text-sm"
                    placeholder="Nhập dữ liệu JSON"
                    value={typeof formData.merge === 'string' 
                      ? formData.merge 
                      : JSON.stringify(formData.merge, null, 2)}
                    onChange={(e) => handleJsonChange('merge', e.target.value)}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Dữ liệu đã được xử lý và hợp nhất
                  </p>
                </div>
              </div>
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