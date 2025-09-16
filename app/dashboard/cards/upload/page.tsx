// app/dashboard/cards/upload/page.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
  PhotoIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface FileWithPreview extends File {
  preview?: string;
}

export default function CardUploadPage() {
  const [files, setFiles] = useState<{
    front?: FileWithPreview;
    back?: FileWithPreview;
    avatar?: FileWithPreview;
  }>({});
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState<string | null>(null);
  const router = useRouter();

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

  const handleDrag = useCallback((e: React.DragEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(type);
    } else if (e.type === "dragleave") {
      setDragActive(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: 'front' | 'back' | 'avatar') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0], type);
    }
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back' | 'avatar') => {
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

  const handleUpload = async () => {
    if (!files.front || !files.back) {
      toast.error('Vui lòng chọn ảnh mặt trước và mặt sau của thẻ');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      
      formData.append('front', files.front);
      formData.append('back', files.back);
      if (files.avatar) {
        formData.append('avatar', files.avatar);
      }

      const result = await apiService.uploadCard(formData);
      
      toast.success('Tải lên thẻ thành công!');
      router.push(`/dashboard/cards/${result.id}`);
      // router.push('/dashboard/cards');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi tải lên thẻ');
    } finally {
      setUploading(false);
    }
  };

  const FileUploadZone = ({ 
    type, 
    title, 
    description 
  }: { 
    type: 'front' | 'back' | 'avatar';
    title: string;
    description: string;
  }) => {
    const file = files[type];
    const isRequired = type !== 'avatar';

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {title} {isRequired && <span className="text-red-500">*</span>}
        </label>
        
        {file ? (
          <div className="relative">
            <img
              src={file.preview}
              alt={title}
              className="w-full h-48 object-cover rounded-lg border"
            />
            <button
              onClick={() => removeFile(type)}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
              dragActive === type
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={(e) => handleDrag(e, type)}
            onDragLeave={(e) => handleDrag(e, type)}
            onDragOver={(e) => handleDrag(e, type)}
            onDrop={(e) => handleDrop(e, type)}
          >
            <div className="space-y-1 text-center">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor={`file-upload-${type}`}
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Chọn file</span>
                  <input
                    id={`file-upload-${type}`}
                    name={`file-upload-${type}`}
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={(e) => handleInputChange(e, type)}
                  />
                </label>
                <p className="pl-1">hoặc kéo thả vào đây</p>
              </div>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Tải lên thẻ danh thiếp</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tải lên ảnh mặt trước và mặt sau của thẻ danh thiếp để hệ thống xử lý tự động
          </p>
        </div>

        <div className="bg-white shadow rounded-lg border border-gray-300">
          <div className="px-6 py-4">
            <div className="space-y-6">
              <FileUploadZone
                type="front"
                title="Ảnh mặt trước"
                description="PNG, JPG, GIF up to 10MB"
              />

              <FileUploadZone
                type="back"
                title="Ảnh mặt sau"
                description="PNG, JPG, GIF up to 10MB"
              />

              <FileUploadZone
                type="avatar"
                title="Ảnh đại diện (tùy chọn)"
                description="PNG, JPG, GIF up to 10MB"
              />
            </div>

            {/* Upload Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ArrowUpTrayIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Hướng dẫn tải lên
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Chọn ảnh mặt trước và mặt sau của thẻ danh thiếp</li>
                      <li>Đảm bảo ảnh có độ phân giải cao và rõ ràng</li>
                      <li>Hệ thống sẽ tự động nhận diện và trích xuất thông tin</li>
                      <li>Bạn có thể bổ sung ảnh đại diện nếu muốn</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || !files.front || !files.back}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang tải lên...
                  </div>
                ) : (
                  'Tải lên'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}