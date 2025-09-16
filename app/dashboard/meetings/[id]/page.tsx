// app/dashboard/meetings/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiService } from '@/lib/api';
import { Meeting } from '@/types';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    CalendarIcon,
    MapPinIcon,
    UserGroupIcon,
    DocumentTextIcon,
    EyeIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

export default function MeetingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [meeting, setMeeting] = useState<Meeting | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [removeParticipantLoading, setRemoveParticipantLoading] = useState<number | null>(null);

    const meetingId = parseInt(params.id as string);

    useEffect(() => {
        if (meetingId) {
            loadMeeting();
        }
    }, [meetingId]);

    const loadMeeting = async () => {
        try {
            setLoading(true);
            const response = await apiService.getMeeting(meetingId);
            setMeeting(response);
        } catch (error: any) {
            console.error('Error loading meeting:', error);
            toast.error('Lỗi khi tải thông tin cuộc họp');
            if (error?.response?.status === 404) {
                router.push('/dashboard/meetings');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa cuộc họp này?')) {
            return;
        }

        try {
            setDeleteLoading(true);
            await apiService.deleteMeeting(meetingId);
            toast.success('Xóa cuộc họp thành công');
            router.push('/dashboard/meetings');
        } catch (error) {
            console.error('Error deleting meeting:', error);
            toast.error('Lỗi khi xóa cuộc họp');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleRemoveParticipant = async (cardId: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa người tham gia này?')) {
            return;
        }

        try {
            setRemoveParticipantLoading(cardId);
            await apiService.removeMeetingParticipant(meetingId, cardId);

            // Update local state
            setMeeting(prev => prev ? {
                ...prev,
                participants: prev.participants.filter(p => p.id !== cardId)
            } : null);

            toast.success('Xóa người tham gia thành công');
        } catch (error) {
            console.error('Error removing participant:', error);
            toast.error('Lỗi khi xóa người tham gia');
        } finally {
            setRemoveParticipantLoading(null);
        }
    };

    const getLocationIcon = (locationType?: string) => {
        switch (locationType) {
            case 'online':
                return '🌐';
            case 'office':
                return '🏢';
            default:
                return '📍';
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
                                <div className="h-32 bg-gray-200 rounded-lg"></div>
                                <div className="h-48 bg-gray-200 rounded-lg"></div>
                            </div>
                            <div className="h-64 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!meeting) {
        return (
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto text-center py-12">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy cuộc họp</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Cuộc họp có ID {meetingId} không tồn tại hoặc đã bị xóa.
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/dashboard/meetings"
                            className="btn-primary"
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
                                    <Link href="/dashboard/meetings" className="text-gray-400 hover:text-gray-500">
                                        <ArrowLeftIcon className="h-5 w-5" />
                                    </Link>
                                </li>
                                <li>
                                    <div className="flex items-center">
                                        <span className="text-gray-400 mx-2">/</span>
                                        <span className="text-sm font-medium text-gray-500">Chi tiết cuộc họp</span>
                                    </div>
                                </li>
                            </ol>
                        </nav>

                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate py-3">
                            {meeting.title || `Cuộc họp #${meeting.id}`}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            ID: {meeting.id} • Tạo: {formatDate(meeting.createdAt)} • Cập nhật: {formatDate(meeting.updatedAt)}
                        </p>
                    </div>

                    <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4 text-black">

                        <Link
                            href={`/dashboard/meetings/${meeting.id}/edit`}
                            className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
                        >
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                        </Link>

                        <button
                            onClick={handleDelete}
                            disabled={deleteLoading}
                            className="inline-flex items-center px-3 py-2 rounded-md border border-red-300 text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                            {deleteLoading ? (
                                <LoadingSpinner size="sm" className="mr-2" color="white" />
                            ) : (
                                <TrashIcon className="h-4 w-4 mr-2" />
                            )}
                            Xóa
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Meeting Information */}
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-4 py-3 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <CalendarIcon className="h-5 w-5 mr-2" />
                                    Thông tin cuộc họp
                                </h3>
                            </div>
                            <div className="px-4 py-4">
                                <dl className="space-y-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Tiêu đề</dt>
                                        <dd className="mt-1 text-sm text-gray-900 px-4">
                                            {meeting.title || 'Chưa có tiêu đề'}
                                        </dd>
                                    </div>

                                    {meeting.description && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Mô tả</dt>
                                            <dd className="mt-1 text-sm text-gray-900 px-4">
                                                {meeting.description}
                                            </dd>
                                        </div>
                                    )}

                                    {meeting.date && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Ngày và giờ</dt>
                                            <dd className="mt-1 text-sm text-gray-900 flex items-center px-4">
                                                <CalendarIcon className="h-4 w-4 mr-1" />
                                                {formatDate(meeting.date)}
                                            </dd>
                                        </div>
                                    )}

                                    {meeting.locationType && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Địa điểm</dt>
                                            <dd className="mt-1 text-sm text-gray-900 flex items-center px-4">
                                                <MapPinIcon className="h-4 w-4 mr-1" />
                                                <span className="mr-2">{getLocationIcon(meeting.locationType)}</span>
                                                {meeting.locationDetail || meeting.locationType}
                                            </dd>
                                        </div>
                                    )}

                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Người tham gia</dt>
                                        <dd className="mt-1 text-sm text-gray-900 flex items-center px-4">
                                            <UserGroupIcon className="h-4 w-4 mr-1" />
                                            {meeting.participants?.length || 0} người
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Note */}
                        {meeting.note && (
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-4 py-3 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                        <DocumentTextIcon className="h-5 w-5 mr-2" />
                                        Ghi chú
                                    </h3>
                                </div>
                                <div className="px-4 py-4">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap px-4">{meeting.note}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Participants */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-4 py-3 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <UserGroupIcon className="h-5 w-5 mr-2" />
                                    Người tham gia ({meeting.participants?.length || 0})
                                </h3>
                                <Link
                                    href={`/dashboard/meetings/${meeting.id}/edit`}
                                    className="text-sm text-indigo-600 hover:text-indigo-500"
                                >
                                    Chỉnh sửa
                                </Link>
                            </div>
                        </div>

                        <div className="px-4 py-4">
                            {!meeting.participants || meeting.participants.length === 0 ? (
                                <div className="text-center py-8">
                                    <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có người tham gia</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Thêm người tham gia để bắt đầu cuộc họp
                                    </p>
                                    <div className="mt-6">
                                        <Link
                                            href={`/dashboard/meetings/${meeting.id}/edit`}
                                            className="btn-primary"
                                        >
                                            Thêm người tham gia
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {meeting.participants.map((participant) => (
                                        <div key={participant.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                {participant.frontImageUrl ? (
                                                    <Image
                                                        src={participant.frontImageUrl}
                                                        alt="Card"
                                                        width={48}
                                                        height={32}
                                                        className="w-12 h-8 object-cover rounded border"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                                                        <span className="text-xs text-gray-500">#{participant.id}</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {participant.holderName || `Thẻ #${participant.id}`}
                                                    </p>
                                                    <p className="text-xs text-gray-500">ID: {participant.id}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Link
                                                    href={`/dashboard/cards/${participant.id}`}
                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                                >
                                                    <EyeIcon className="h-3 w-3 mr-1" />
                                                    Xem
                                                </Link>

                                                <button
                                                    onClick={() => handleRemoveParticipant(participant.id)}
                                                    disabled={removeParticipantLoading === participant.id}
                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 disabled:opacity-50"
                                                >
                                                    {removeParticipantLoading === participant.id ? (
                                                        <LoadingSpinner size="sm" className="w-3 h-3" />
                                                    ) : (
                                                        <XMarkIcon className="h-3 w-3" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}