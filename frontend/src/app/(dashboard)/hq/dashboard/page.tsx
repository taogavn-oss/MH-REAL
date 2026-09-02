'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

type JobRequirementItem = {
  id: string;
  storeName: string;
  publishStatus: 'published' | 'unpublished';
  approvalStatus:
    | 'unset'
    | 'pending_am'
    | 'approved_am'
    | 'rejected_am'
    | 'pending_hq'
    | 'approved_hq'
    | 'pending_resubmit';
  block: string;
  area: string;
  prefecture: string;
  managers: string;
};

const INITIAL_MOCK_ROWS: JobRequirementItem[] = [
  {
    id: 'req-1',
    storeName: '渋谷店',
    publishStatus: 'unpublished',
    approvalStatus: 'unset',
    block: '北海道ブロック',
    area: '札幌エリア',
    prefecture: '北海道',
    managers: '山田 太郎（SM）\n佐藤 花子（副SM）',
  },
  {
    id: 'req-2',
    storeName: '渋谷店',
    publishStatus: 'unpublished',
    approvalStatus: 'approved_am',
    block: '北海道ブロック',
    area: '札幌エリア',
    prefecture: '北海道',
    managers: '山田 太郎（SM）\n佐藤 花子（副SM）',
  },
  {
    id: 'req-3',
    storeName: '渋谷店',
    publishStatus: 'published',
    approvalStatus: 'pending_am',
    block: '北海道ブロック',
    area: '札幌エリア',
    prefecture: '北海道',
    managers: '山田 太郎（SM）\n佐藤 花子（副SM）',
  },
  {
    id: 'req-4',
    storeName: '渋谷店',
    publishStatus: 'unpublished',
    approvalStatus: 'rejected_am',
    block: '北海道ブロック',
    area: '札幌エリア',
    prefecture: '北海道',
    managers: '山田 太郎（SM）\n佐藤 花子（副SM）',
  },
  {
    id: 'req-5',
    storeName: '渋谷店',
    publishStatus: 'published',
    approvalStatus: 'pending_resubmit',
    block: '北海道ブロック',
    area: '札幌エリア',
    prefecture: '北海道',
    managers: '山田 太郎（SM）\n佐藤 花子（副SM）',
  },
  {
    id: 'req-6',
    storeName: '渋谷店',
    publishStatus: 'published',
    approvalStatus: 'pending_hq',
    block: '北海道ブロック',
    area: '札幌エリア',
    prefecture: '北海道',
    managers: '山田 太郎（SM）\n佐藤 花子（副SM）',
  },
  {
    id: 'req-7',
    storeName: '渋谷店',
    publishStatus: 'unpublished',
    approvalStatus: 'approved_hq',
    block: '北海道ブロック',
    area: '札幌エリア',
    prefecture: '北海道',
    managers: '山田 太郎（SM）\n佐藤 花子（副SM）',
  },
  {
    id: 'req-8',
    storeName: '渋谷店',
    publishStatus: 'published',
    approvalStatus: 'rejected_am',
    block: '北海道ブロック',
    area: '札幌エリア',
    prefecture: '北海道',
    managers: '山田 太郎（SM）\n佐藤 花子（副SM）',
  },
  {
    id: 'req-9',
    storeName: '渋谷店',
    publishStatus: 'published',
    approvalStatus: 'approved_am',
    block: '北海道ブロック',
    area: '札幌エリア',
    prefecture: '北海道',
    managers: '山田 太郎（SM）\n佐藤 花子（副SM）',
  },
  {
    id: 'req-10',
    storeName: '渋谷店',
    publishStatus: 'published',
    approvalStatus: 'approved_am',
    block: '北海道ブロック',
    area: '札幌エリア',
    prefecture: '北海道',
    managers: '山田 太郎（SM）\n佐藤 花子（副SM）',
  },
];

export default function HQDashboardPage() {
  const { user, logout } = useAuth();

  // Sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Filters state
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedSm, setSelectedSm] = useState('');
  const [selectedSubSm, setSelectedSubSm] = useState('');
  const [selectedPublishStatus, setSelectedPublishStatus] = useState('');
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedPrefecture, setSelectedPrefecture] = useState('');
  const [onlyActive, setOnlyActive] = useState(false);

  // Selected item for modal
  const [detailItem, setDetailItem] = useState<JobRequirementItem | null>(null);

  // Fetch real API data with fallback to Figma mockup data
  const { data: apiData, isLoading } = useQuery({
    queryKey: ['job-requirements'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/job-requirements');
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          return res.data.data.map((item: any) => ({
            id: item.id,
            storeName: item.store?.name || '店舗',
            publishStatus: item.store?.publish_status === 'published' ? 'published' : 'unpublished',
            approvalStatus:
              item.status === 'draft'
                ? 'unset'
                : item.status === 'pending_am'
                ? 'pending_am'
                : item.status === 'pending_hq'
                ? 'pending_hq'
                : item.status === 'approved_hq'
                ? 'approved_hq'
                : item.status === 'rejected'
                ? 'rejected_am'
                : 'approved_am',
            block: item.store?.area?.block || '関東ブロック',
            area: item.store?.area?.name || '東京エリア',
            prefecture: item.store?.prefecture || '東京都',
            managers: '管理者（SM）',
          }));
        }
        return INITIAL_MOCK_ROWS;
      } catch {
        return INITIAL_MOCK_ROWS;
      }
    },
  });

  const tableRows: JobRequirementItem[] = apiData || INITIAL_MOCK_ROWS;

  // Filter application
  const filteredRows = useMemo(() => {
    return tableRows.filter((row) => {
      if (selectedStore && !row.storeName.includes(selectedStore)) return false;
      if (selectedPublishStatus && row.publishStatus !== selectedPublishStatus) return false;
      if (selectedApprovalStatus && row.approvalStatus !== selectedApprovalStatus) return false;
      if (selectedBlock && !row.block.includes(selectedBlock)) return false;
      if (selectedArea && !row.area.includes(selectedArea)) return false;
      if (selectedPrefecture && !row.prefecture.includes(selectedPrefecture)) return false;
      if (onlyActive && (row.publishStatus === 'unpublished' || row.approvalStatus === 'unset')) return false;
      return true;
    });
  }, [
    tableRows,
    selectedStore,
    selectedPublishStatus,
    selectedApprovalStatus,
    selectedBlock,
    selectedArea,
    selectedPrefecture,
    onlyActive,
  ]);

  const handleResetFilters = () => {
    setSelectedStore('');
    setSelectedSm('');
    setSelectedSubSm('');
    setSelectedPublishStatus('');
    setSelectedApprovalStatus('');
    setSelectedBlock('');
    setSelectedArea('');
    setSelectedPrefecture('');
    setOnlyActive(false);
  };

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['店舗名,掲載ステータ,承認状況,ブロック,エリア,都道府県,店長・副店長']
        .concat(
          filteredRows.map(
            (r) =>
              `"${r.storeName}","${r.publishStatus}","${r.approvalStatus}","${r.block}","${r.area}","${r.prefecture}","${r.managers.replace(/\n/g, ' ')}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'job_requirements_hq_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPublishBadge = (status: 'published' | 'unpublished') => {
    if (status === 'published') {
      return (
        <div className="inline-flex h-[28px] items-center justify-center rounded-[3px] bg-[#F0FBF1] px-[8px] py-[4px] outline outline-1 outline-[#6EC383] -outline-offset-1">
          <span className="w-[48px] text-center text-[12px] font-medium text-[#278F42]">
            掲載
          </span>
        </div>
      );
    }
    return (
      <div className="inline-flex h-[28px] items-center justify-center rounded-[3px] bg-[#F5F6F9] px-[8px] py-[4px] outline outline-1 outline-[#AEAEB2] -outline-offset-1">
        <span className="text-[12px] font-medium text-[#888888]">
          掲載終了
        </span>
      </div>
    );
  };

  const renderApprovalBadge = (status: JobRequirementItem['approvalStatus']) => {
    switch (status) {
      case 'unset':
        return (
          <div className="inline-flex h-[28px] min-w-[96px] items-center justify-center rounded-[3px] bg-white px-[8px] py-[4px] outline outline-1 outline-[#AEAEB2] -outline-offset-1">
            <span className="text-[12px] font-medium text-[#888888]">未設定</span>
          </div>
        );
      case 'approved_am':
        return (
          <div className="inline-flex h-[28px] min-w-[96px] items-center justify-center rounded-[3px] bg-[#E9F2FF] px-[8px] py-[4px] outline outline-1 outline-[#276CE4] -outline-offset-1">
            <span className="text-[12px] font-medium text-[#276CE4]">AM承認済み</span>
          </div>
        );
      case 'pending_am':
        return (
          <div className="inline-flex h-[28px] min-w-[96px] items-center justify-center rounded-[3px] bg-white px-[8px] py-[4px] outline outline-1 outline-[#276CE4] -outline-offset-1">
            <span className="text-[12px] font-medium text-[#276CE4]">AM承認待ち</span>
          </div>
        );
      case 'rejected_am':
        return (
          <div className="inline-flex h-[28px] min-w-[96px] items-center justify-center rounded-[3px] bg-white px-[8px] py-[4px] outline outline-1 outline-[#E4203B] -outline-offset-1">
            <span className="text-[12px] font-medium text-[#E4203B]">AM差し戻し</span>
          </div>
        );
      case 'pending_hq':
        return (
          <div className="inline-flex h-[28px] min-w-[96px] items-center justify-center rounded-[3px] bg-white px-[8px] py-[4px] outline outline-1 outline-[#FC8A29] -outline-offset-1">
            <span className="text-[12px] font-medium text-[#FC8A29]">本部確認待ち</span>
          </div>
        );
      case 'approved_hq':
        return (
          <div className="inline-flex h-[28px] min-w-[96px] items-center justify-center rounded-[3px] bg-[#F0FBF1] px-[8px] py-[4px] outline outline-1 outline-[#6EC383] -outline-offset-1">
            <span className="text-[12px] font-medium text-[#278F42]">本部確認済み</span>
          </div>
        );
      case 'pending_resubmit':
        return (
          <div className="inline-flex h-[28px] min-w-[96px] items-center justify-center rounded-[3px] bg-[#FEE8E8] px-[8px] py-[4px] outline outline-1 outline-[#E4203B] -outline-offset-1">
            <span className="text-[12px] font-medium text-[#E4203B]">差戻し回答待ち</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex h-[28px] min-w-[96px] items-center justify-center rounded-[3px] bg-white px-[8px] py-[4px] outline outline-1 outline-[#AEAEB2] -outline-offset-1">
            <span className="text-[12px] font-medium text-[#888888]">未設定</span>
          </div>
        );
    }
  };

  return (
    <div
      data-layer="本部_採用条件一覧【全店舗確認用】"
      className="relative min-h-screen w-full bg-[#F5F6F9] overflow-x-hidden flex"
      style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
    >
      {/* ================= SIDEBAR MENU ================= */}
      <aside
        data-layer="Menu_Style 3"
        className={`${
          sidebarOpen ? 'w-[260px]' : 'w-[80px]'
        } shrink-0 bg-white border-r border-[#E8E8E8] min-h-screen flex flex-col justify-between py-[20px] px-[16px] transition-all duration-300 z-20`}
      >
        <div className="flex flex-col gap-[20px]">
          {/* Logo */}
          <div className="h-[80px] px-[12px] flex items-center justify-between">
            <Link href="/hq/dashboard" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Rakusai Logo"
                width={56}
                height={56}
                className="object-contain"
                priority
              />
              {sidebarOpen && (
                <span className="text-[18px] font-bold text-[#F06800]">Rakusai HQ</span>
              )}
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-[8px]">
            {/* Menu 1: 採用条件一覧 (Active with Submenu) */}
            <div className="flex flex-col gap-[4px]">
              <div className="h-[48px] px-[12px] py-[4px] bg-[rgba(252,138,41,0.20)] rounded-[6px] flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-[16px]">
                  {/* file-user SVG */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 21.5C5.46957 21.5 4.96086 21.2893 4.58579 20.9142C4.21071 20.5391 4 20.0304 4 19.5V3.5C4 2.96957 4.21071 2.46086 4.58579 2.08579C4.96086 1.71072 5.46957 1.5 6 1.5H14C14.3166 1.49949 14.6301 1.56161 14.9225 1.68277C15.215 1.80394 15.4806 1.98176 15.704 2.206L19.292 5.794C19.5168 6.01751 19.6952 6.28335 19.8167 6.57616C19.9382 6.86898 20.0005 7.18297 20 7.5V19.5C20 20.0304 19.7893 20.5391 19.4142 20.9142C19.0391 21.2893 18.5304 21.5 18 21.5H6Z"
                      stroke="#F06800"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 1.5V6.5C14 6.76522 14.1054 7.01957 14.2929 7.20711C14.4804 7.39464 14.7348 7.5 15 7.5H20"
                      stroke="#F06800"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 21.5C16 20.4391 15.5786 19.4217 14.8284 18.6716C14.0783 17.9214 13.0609 17.5 12 17.5C10.9391 17.5 9.92172 17.9214 9.17157 18.6716C8.42143 19.4217 8 20.4391 8 21.5"
                      stroke="#F06800"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 17.5C13.6569 17.5 15 16.1569 15 14.5C15 12.8431 13.6569 11.5 12 11.5C10.3431 11.5 9 12.8431 9 14.5C9 16.1569 10.3431 17.5 12 17.5Z"
                      stroke="#F06800"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {sidebarOpen && (
                    <span className="text-[16px] font-medium text-[#F06800]">
                      採用条件一覧
                    </span>
                  )}
                </div>
                {sidebarOpen && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 9.5L12 14.5L17 9.5"
                      stroke="#F06800"
                      strokeWidth="1.66667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              {/* Sub-menu tree */}
              {sidebarOpen && (
                <div className="flex pl-[24px] pr-[12px] gap-[16px] pt-1">
                  <div className="w-[1px] bg-[#B7B7B7] self-stretch" />
                  <div className="flex-1 flex flex-col gap-[4px]">
                    <div className="h-[40px] px-[12px] rounded-[3px] flex items-center cursor-pointer bg-orange-50">
                      <span className="text-[15px] font-medium text-[#F06800]">
                        全店舗確認用
                      </span>
                    </div>
                    <div className="h-[40px] px-[12px] rounded-[3px] flex items-center cursor-pointer hover:bg-gray-100">
                      <span className="text-[15px] font-normal text-[#5C5C5C]">
                        新店設定用
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Menu 2: スケジュール (Schedule) */}
            <Link
              href="/store/calendar"
              className="h-[48px] px-[12px] py-[4px] rounded-[6px] flex items-center gap-[16px] hover:bg-gray-100 cursor-pointer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M8 2V5" stroke="#5C5C5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 2V5" stroke="#5C5C5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="#5C5C5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 9H21" stroke="#5C5C5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 13H8.01" stroke="#5C5C5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 13H12.01" stroke="#5C5C5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 13H16.01" stroke="#5C5C5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 17H8.01" stroke="#5C5C5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 17H12.01" stroke="#5C5C5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17H16.01" stroke="#5C5C5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {sidebarOpen && (
                <span className="text-[16px] font-medium text-[#333333]">
                  スケジュール
                </span>
              )}
            </Link>

            {/* Menu 3: ブラックリスト (Blacklist) */}
            <Link
              href="/hq/blacklist"
              className="h-[48px] px-[12px] py-[4px] rounded-[6px] flex items-center gap-[16px] hover:bg-gray-100 cursor-pointer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 21.5C17.5228 21.5 22 17.0228 22 11.5C22 5.97715 17.5228 1.5 12 1.5C6.47715 1.5 2 5.97715 2 11.5C2 17.0228 6.47715 21.5 12 21.5Z" stroke="#5C5C5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.92902 4.42896L19.07 18.571" stroke="#5C5C5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {sidebarOpen && (
                <span className="text-[16px] font-medium text-[#333333]">
                  ブラックリスト
                </span>
              )}
            </Link>

            {/* Menu 4: 紐づけ管理 (Assignment Management) */}
            <Link
              href="/hq/dashboard"
              className="h-[48px] px-[12px] py-[4px] rounded-[6px] flex items-center gap-[16px] hover:bg-gray-100 cursor-pointer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 18.5C16.6739 18.5 15.4021 17.9732 14.4645 17.0355C13.5268 16.0979 13 14.8261 13 13.5V21.5" stroke="#5C5C5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 19.5001H4C3.46957 19.5001 2.96086 19.2894 2.58579 18.9143C2.21071 18.5392 2 18.0305 2 17.5001V4.5001C2 3.96966 2.21071 3.46096 2.58579 3.08588C2.96086 2.71081 3.46957 2.5001 4 2.5001H7.9C8.23449 2.49682 8.56445 2.57748 8.8597 2.73472C9.15495 2.89195 9.40604 3.12072 9.59 3.4001L10.4 4.6001C10.5821 4.87663 10.83 5.10362 11.1215 5.2607C11.413 5.41778 11.7389 5.50004 12.07 5.5001H20C20.5304 5.5001 21.0391 5.71081 21.4142 6.08588C21.7893 6.46096 22 6.96966 22 7.5001V12.5001" stroke="#5C5C5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13 13.5C14.1046 13.5 15 12.6046 15 11.5C15 10.3954 14.1046 9.5 13 9.5C11.8954 9.5 11 10.3954 11 11.5C11 12.6046 11.8954 13.5 13 13.5Z" stroke="#5C5C5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 20.5C21.1046 20.5 22 19.6046 22 18.5C22 17.3954 21.1046 16.5 20 16.5C18.8954 16.5 18 17.3954 18 18.5C18 19.6046 18.8954 20.5 20 20.5Z" stroke="#5C5C5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {sidebarOpen && (
                <span className="text-[16px] font-medium text-[#333333]">
                  紐づけ管理
                </span>
              )}
            </Link>
          </nav>
        </div>
      </aside>

      {/* ================= MAIN CONTAINER ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header
          data-layer="Header"
          className="h-[85px] bg-white border-b border-[#E8E8E8] px-[24px] flex items-center justify-between sticky top-0 z-10"
        >
          {/* Left: Menu Toggle + Title */}
          <div className="flex items-center gap-[20px]">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-[32px] h-[32px] p-[5px] rounded-[3px] border border-[#E8E8E8] flex items-center justify-center hover:bg-gray-50 cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M17.5 4.16675V15.8334" stroke="#434343" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2.50002 10H14.1667" stroke="#434343" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7.5 15L2.5 10L7.5 5" stroke="#434343" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1
              data-layer="Rakusai"
              className="text-[22px] sm:text-[24px] font-bold text-black"
            >
              採用条件一覧【全店舗確認用】
            </h1>
          </div>

          {/* Right: Notifications + User Profile */}
          <div className="flex items-center gap-[20px]">
            {/* Notification Bell */}
            <div className="relative w-[44px] h-[44px] rounded-full border border-[#E8E8E8] flex items-center justify-center hover:bg-gray-50 cursor-pointer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M10.2681 20.5C10.4436 20.804 10.6961 21.0565 11.0001 21.232C11.3041 21.4075 11.649 21.4999 12.0001 21.4999C12.3511 21.4999 12.696 21.4075 13 21.232C13.3041 21.0565 13.5565 20.804 13.7321 20.5" stroke="#5C5C5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.262 14.826C3.13137 14.9692 3.04516 15.1472 3.01386 15.3385C2.98256 15.5298 3.00752 15.726 3.08571 15.9034C3.1639 16.0807 3.29194 16.2316 3.45426 16.3375C3.61658 16.4434 3.80618 16.4999 4 16.5H20C20.1938 16.5001 20.3834 16.4438 20.5459 16.3381C20.7083 16.2324 20.8365 16.0817 20.9149 15.9045C20.9933 15.7273 21.0185 15.5311 20.9874 15.3398C20.9564 15.1485 20.8704 14.9703 20.74 14.827C19.41 13.456 18 11.999 18 7.5C18 5.9087 17.3679 4.38258 16.2426 3.25736C15.1174 2.13214 13.5913 1.5 12 1.5C10.4087 1.5 8.88258 2.13214 7.75736 3.25736C6.63214 4.38258 6 5.9087 6 7.5C6 11.999 4.589 13.456 3.262 14.826Z" stroke="#5C5C5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {/* Red Dot Badge */}
              <div className="absolute top-[2px] right-[2px]">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect width="12" height="12" rx="6" fill="#FF4C51" fillOpacity="0.2"/>
                  <circle cx="6" cy="6" r="4" fill="#E4203B"/>
                </svg>
              </div>
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-[12px] cursor-pointer py-1 px-2 rounded-md hover:bg-gray-50"
              >
                <div className="w-[32px] h-[32px] rounded-full bg-orange-100 text-[#F06800] flex items-center justify-center font-bold text-sm">
                  {user?.employeeCode?.[0] || 'HQ'}
                </div>
                <span className="text-[14px] font-medium text-[#333333]">
                  {user?.employeeCode || '佐藤 美咲'}
                </span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5.83325 7.91675L9.99992 12.0834L14.1666 7.91675" stroke="#434343" strokeWidth="1.38889" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-30">
                  <div className="px-4 py-2 text-xs text-gray-500 border-b">
                    Role: {user?.role || 'HQ Administrator'}
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                  >
                    ログアウト (Sign out)
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-[24px] pb-[40px] flex flex-col gap-[24px]">
          {/* ================= FILTER CARD (FRAME 25) ================= */}
          <div
            data-layer="Frame 25"
            className="w-full bg-white rounded-[12px] p-[24px] shadow-[0px_0px_20px_3px_rgba(0,0,0,0.10)] flex flex-col gap-[24px]"
          >
            {/* Filter Title */}
            <div className="flex items-center gap-[12px]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M10 20C9.99992 20.1858 10.0516 20.368 10.1493 20.5261C10.247 20.6842 10.3868 20.8119 10.553 20.895L12.553 21.895C12.7055 21.9712 12.8749 22.0072 13.0452 21.9994C13.2156 21.9917 13.3811 21.9406 13.526 21.8509C13.671 21.7613 13.7907 21.636 13.8736 21.4871C13.9566 21.3381 14.0001 21.1705 14 21V14C14.0002 13.5044 14.1845 13.0265 14.517 12.659L21.74 4.67C21.8695 4.52656 21.9546 4.34868 21.9851 4.15788C22.0156 3.96708 21.9902 3.77153 21.9119 3.59487C21.8336 3.41822 21.7058 3.26802 21.544 3.16245C21.3822 3.05688 21.1932 3.00046 21 3H3.00001C2.80661 3.00007 2.61739 3.05622 2.45526 3.16164C2.29312 3.26706 2.16503 3.41723 2.08651 3.59396C2.00799 3.7707 1.98239 3.96641 2.01283 4.15739C2.04327 4.34837 2.12843 4.52643 2.25801 4.67L9.48301 12.659C9.81554 13.0265 9.99978 13.5044 10 14V20Z"
                  stroke="#333333"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h2 className="text-[20px] font-bold text-[#333333]">絞り込み条件</h2>
            </div>

            {/* Filters Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-[24px]">
              {/* 店舗名 */}
              <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] text-[#333333]">店舗名</label>
                <div className="relative h-[48px] px-[16px] bg-white rounded-[6px] border border-[#AEAEB2] flex items-center justify-between">
                  <input
                    type="text"
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    placeholder="店舗名を入力 / 選択"
                    className="w-full text-[14px] text-black outline-none placeholder:text-[#888888]"
                  />
                </div>
              </div>

              {/* 店長 */}
              <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] text-[#333333]">店長</label>
                <div className="relative h-[48px] px-[16px] bg-white rounded-[6px] border border-[#AEAEB2] flex items-center justify-between">
                  <input
                    type="text"
                    value={selectedSm}
                    onChange={(e) => setSelectedSm(e.target.value)}
                    placeholder="店長を選択"
                    className="w-full text-[14px] text-black outline-none placeholder:text-[#888888]"
                  />
                </div>
              </div>

              {/* 副店長 */}
              <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] text-[#333333]">副店長</label>
                <div className="relative h-[48px] px-[16px] bg-white rounded-[6px] border border-[#AEAEB2] flex items-center justify-between">
                  <input
                    type="text"
                    value={selectedSubSm}
                    onChange={(e) => setSelectedSubSm(e.target.value)}
                    placeholder="副店長を選択"
                    className="w-full text-[14px] text-black outline-none placeholder:text-[#888888]"
                  />
                </div>
              </div>

              {/* 掲載ステータ */}
              <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] text-[#333333]">掲載ステータ</label>
                <select
                  value={selectedPublishStatus}
                  onChange={(e) => setSelectedPublishStatus(e.target.value)}
                  className="h-[48px] px-[16px] bg-white rounded-[6px] border border-[#AEAEB2] text-[14px] text-[#333333] outline-none"
                >
                  <option value="">掲載ステータを選択 (すべて)</option>
                  <option value="published">掲載</option>
                  <option value="unpublished">掲載終了</option>
                </select>
              </div>

              {/* 承認状況 */}
              <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] text-[#333333]">承認状況</label>
                <select
                  value={selectedApprovalStatus}
                  onChange={(e) => setSelectedApprovalStatus(e.target.value)}
                  className="h-[48px] px-[16px] bg-white rounded-[6px] border border-[#AEAEB2] text-[14px] text-[#333333] outline-none"
                >
                  <option value="">承認状況を選択 (すべて)</option>
                  <option value="unset">未設定</option>
                  <option value="pending_am">AM承認待ち</option>
                  <option value="approved_am">AM承認済み</option>
                  <option value="rejected_am">AM差し戻し</option>
                  <option value="pending_hq">本部確認待ち</option>
                  <option value="approved_hq">本部確認済み</option>
                  <option value="pending_resubmit">差戻し回答待ち</option>
                </select>
              </div>
            </div>

            {/* Filters Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[24px] max-w-[900px]">
              {/* ブロック */}
              <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] text-[#333333]">ブロック</label>
                <select
                  value={selectedBlock}
                  onChange={(e) => setSelectedBlock(e.target.value)}
                  className="h-[48px] px-[16px] bg-white rounded-[6px] border border-[#AEAEB2] text-[14px] text-[#333333] outline-none"
                >
                  <option value="">ブロックを選択</option>
                  <option value="北海道">北海道ブロック</option>
                  <option value="関東">関東ブロック</option>
                  <option value="関西">関西ブロック</option>
                </select>
              </div>

              {/* エリア */}
              <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] text-[#333333]">エリア</label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="h-[48px] px-[16px] bg-white rounded-[6px] border border-[#AEAEB2] text-[14px] text-[#333333] outline-none"
                >
                  <option value="">エリアを選択</option>
                  <option value="札幌">札幌エリア</option>
                  <option value="東京">東京エリア</option>
                  <option value="新宿">新宿エリア</option>
                </select>
              </div>

              {/* 都道府県 */}
              <div className="flex flex-col gap-[8px]">
                <label className="text-[14px] text-[#333333]">都道府県</label>
                <select
                  value={selectedPrefecture}
                  onChange={(e) => setSelectedPrefecture(e.target.value)}
                  className="h-[48px] px-[16px] bg-white rounded-[6px] border border-[#AEAEB2] text-[14px] text-[#333333] outline-none"
                >
                  <option value="">都道府県を選択</option>
                  <option value="北海道">北海道</option>
                  <option value="東京都">東京都</option>
                  <option value="大阪府">大阪府</option>
                </select>
              </div>
            </div>

            {/* Filter Action Buttons */}
            <div className="flex justify-end items-center gap-[12px] pt-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-[122px] h-[48px] px-[20px] bg-white rounded-[6px] border border-[#AEAEB2] flex items-center justify-center gap-[8px] text-[#333333] text-[16px] font-medium hover:bg-gray-50 cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M2.5 10C2.5 11.4834 2.93987 12.9334 3.76398 14.1668C4.58809 15.4001 5.75943 16.3614 7.12987 16.9291C8.50032 17.4968 10.0083 17.6453 11.4632 17.3559C12.918 17.0665 14.2544 16.3522 15.3033 15.3033C16.3522 14.2544 17.0665 12.918 17.3559 11.4632C17.6453 10.0083 17.4968 8.50032 16.9291 7.12987C16.3614 5.75943 15.4001 4.58809 14.1668 3.76398C12.9334 2.93987 11.4834 2.5 10 2.5C7.90329 2.50789 5.89081 3.32602 4.38333 4.78333L2.5 6.66667" stroke="#333333" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.5 2.5V6.66667H6.66667" stroke="#333333" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>リセット</span>
              </button>

              <button
                type="button"
                className="w-[240px] h-[48px] px-[20px] bg-[#F06800] hover:bg-[#d95d00] transition-colors rounded-[6px] flex items-center justify-center gap-[8px] text-white text-[16px] font-medium cursor-pointer shadow-sm"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M17.5 17.5L13.8833 13.8833" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>絞り込み適用</span>
              </button>
            </div>
          </div>

          {/* ================= TABLE CARD (FRAME 29) ================= */}
          <div
            data-layer="Frame 29"
            className="w-full bg-white rounded-[12px] p-[24px] shadow-[0px_0px_20px_3px_rgba(0,0,0,0.10)] flex flex-col gap-[16px]"
          >
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Left: Title with Database Icon */}
              <div className="flex items-center gap-[12px]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8C16.9706 8 21 6.65685 21 5C21 3.34315 16.9706 2 12 2C7.02944 2 3 3.34315 3 5C3 6.65685 7.02944 8 12 8Z" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 5V19C3 19.7956 3.94821 20.5587 5.63604 21.1213C7.32387 21.6839 9.61305 22 12 22C14.3869 22 16.6761 21.6839 18.364 21.1213C20.0518 20.5587 21 19.7956 21 19V5" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 12C3 12.7956 3.94821 13.5587 5.63604 14.1213C7.32387 14.6839 9.61305 15 12 15C14.3869 15 16.6761 14.6839 18.364 14.1213C20.0518 13.5587 21 12.7956 21 12" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h2 className="text-[20px] font-bold text-[#333333]">採用条件一覧</h2>
                <span className="text-[14px] text-gray-500 font-normal">
                  ({filteredRows.length} 件)
                </span>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-[16px]">
                {/* 進行中のみ表示 Checkbox */}
                <label className="h-[48px] px-[16px] bg-white rounded-[6px] border border-[#E8E8E8] flex items-center gap-[8px] cursor-pointer select-none hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={onlyActive}
                    onChange={(e) => setOnlyActive(e.target.checked)}
                    className="w-[18px] h-[18px] rounded border-[#276CE4] text-[#276CE4] focus:ring-[#276CE4]"
                  />
                  <span className="text-[14px] text-black">進行中のみ表示</span>
                </label>

                {/* エクスポート Button */}
                <button
                  type="button"
                  onClick={handleExport}
                  className="w-[158px] h-[48px] px-[20px] bg-white rounded-[6px] border border-[#F06800] text-[#F06800] text-[16px] font-medium flex items-center justify-center gap-[8px] hover:bg-orange-50 cursor-pointer"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 12.0833V2.08325" stroke="#F06800" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17.5 12.0833V15.4166C17.5 15.8586 17.3244 16.2825 17.0118 16.5951C16.6993 16.9077 16.2754 17.0833 15.8333 17.0833H4.16667C3.72464 17.0833 3.30072 16.9077 2.98816 16.5951C2.67559 16.2825 2.5 15.8586 2.5 15.4166V12.0833" stroke="#F06800" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.83325 7.9165L9.99992 12.0832L14.1666 7.9165" stroke="#F06800" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>エクスポート</span>
                </button>
              </div>
            </div>

            {/* Data Table */}
            <div className="w-full overflow-x-auto">
              <div className="min-w-[1200px]">
                {/* Table Header */}
                <div className="flex items-center gap-[28px] px-[20px] py-[16px] bg-[#F5F6F9] rounded-t-[6px] border-b-2 border-[#E8E8E8] text-[14px] font-medium text-[#333333]">
                  <div className="flex-1 min-w-[120px]">店舗名</div>
                  <div className="flex-1 min-w-[120px]">掲載ステータ</div>
                  <div className="flex-1 min-w-[120px]">承認状況</div>
                  <div className="flex-1 min-w-[120px]">ブロック</div>
                  <div className="flex-1 min-w-[120px]">エリア</div>
                  <div className="flex-1 min-w-[120px]">都道府県</div>
                  <div className="flex-1 min-w-[160px]">店長・副店長</div>
                  <div className="w-[80px] text-center">操作</div>
                </div>

                {/* Table Rows */}
                {isLoading ? (
                  <div className="p-8 text-center text-gray-500">データを読み込み中...</div>
                ) : filteredRows.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">条件に合致するデータがありません</div>
                ) : (
                  <div className="flex flex-col divide-y divide-[#E8E8E8]">
                    {filteredRows.map((row, idx) => (
                      <div
                        key={row.id + idx}
                        className="flex items-center gap-[28px] px-[20px] py-[16px] bg-white hover:bg-gray-50 text-[14px] text-[#333333] transition-colors"
                      >
                        {/* 店舗名 */}
                        <div className="flex-1 min-w-[120px] font-medium">{row.storeName}</div>

                        {/* 掲載ステータ */}
                        <div className="flex-1 min-w-[120px]">{renderPublishBadge(row.publishStatus)}</div>

                        {/* 承認状況 */}
                        <div className="flex-1 min-w-[120px]">{renderApprovalBadge(row.approvalStatus)}</div>

                        {/* ブロック */}
                        <div className="flex-1 min-w-[120px] text-[#333333]">{row.block}</div>

                        {/* エリア */}
                        <div className="flex-1 min-w-[120px] text-[#333333]">{row.area}</div>

                        {/* 都道府県 */}
                        <div className="flex-1 min-w-[120px] text-[#333333]">{row.prefecture}</div>

                        {/* 店長・副店長 */}
                        <div className="flex-1 min-w-[160px] text-[13px] leading-[20px] text-[#333333] whitespace-pre-line">
                          {row.managers}
                        </div>

                        {/* 操作 (Actions) */}
                        <div className="w-[80px] flex items-center justify-center gap-[16px]">
                          {/* Info icon */}
                          <button
                            type="button"
                            title="詳細確認"
                            onClick={() => setDetailItem(row)}
                            className="text-[#5C5C5C] hover:text-[#F06800] cursor-pointer"
                          >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M10.0001 18.3334C14.6025 18.3334 18.3334 14.6025 18.3334 10.0001C18.3334 5.39771 14.6025 1.66675 10.0001 1.66675C5.39771 1.66675 1.66675 5.39771 1.66675 10.0001C1.66675 14.6025 5.39771 18.3334 10.0001 18.3334Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M10 13.3333V10" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M10 6.66675H10.0083" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>

                          {/* Edit icon */}
                          <Link
                            href={`/store/requirements/new`}
                            title="編集"
                            className="text-[#5C5C5C] hover:text-[#F06800] cursor-pointer"
                          >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M17.645 5.67658C18.0856 5.2361 18.3332 4.63863 18.3333 4.01562C18.3333 3.39261 18.0859 2.79508 17.6454 2.35449C17.205 1.9139 16.6075 1.66634 15.9845 1.66626C15.3615 1.66618 14.764 1.9136 14.3234 2.35408L3.20169 13.4782C3.00821 13.6712 2.86512 13.9087 2.78503 14.1699L1.68419 17.7966C1.66266 17.8686 1.66103 17.9452 1.67949 18.0181C1.69794 18.091 1.73579 18.1576 1.78902 18.2107C1.84225 18.2639 1.90888 18.3016 1.98183 18.32C2.05477 18.3383 2.13133 18.3366 2.20336 18.3149L5.83086 17.2149C6.09183 17.1355 6.32934 16.9933 6.52253 16.8007L17.645 5.67658Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12.5 4.16675L15.8333 7.50008" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ================= DETAIL MODAL ================= */}
      {detailItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                {detailItem.storeName} - 採用条件詳細
              </h3>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">掲載ステータス</span>
                <span>{detailItem.publishStatus === 'published' ? '掲載中' : '掲載終了'}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">承認状況</span>
                <span>{renderApprovalBadge(detailItem.approvalStatus)}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">地域区分</span>
                <span>{detailItem.block} / {detailItem.area} ({detailItem.prefecture})</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-gray-500">担当責任者</span>
                <span className="whitespace-pre-line text-right">{detailItem.managers}</span>
              </div>
            </div>
            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium text-sm cursor-pointer"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
