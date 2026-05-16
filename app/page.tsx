'use client';

import React from 'react';
import MobileShell from './components/MobileShell';
import BottomNav from './components/BottomNav';
import { mockNotes } from './data/mock-notes';
import { Note } from './types';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  Settings,
  Share2,
  Heart,
  Lock,
} from 'lucide-react';

// 顶部导航栏
function TopNav() {
  return (
    <div className="flex items-center justify-between px-4 pt-14 pb-2">
      <button>
        <Menu size={22} className="text-xhs-text" />
      </button>
      <div className="w-8 h-8 rounded-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://picsum.photos/seed/myavatar/100/100"
          alt="用户头像"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex items-center gap-4">
        <button>
          <Share2 size={20} className="text-xhs-text" />
        </button>
        <button>
          <Settings size={20} className="text-xhs-text" />
        </button>
      </div>
    </div>
  );
}

// 一级 Tab 栏
function PrimaryTabs() {
  const tabs = [
    { label: '笔记', active: false, locked: false },
    { label: '评论', active: false, locked: true },
    { label: '收藏', active: true, locked: false },
    { label: '赞过', active: false, locked: true },
  ];

  return (
    <div className="flex items-center px-4 border-b border-xhs-divider">
      <div className="flex items-center gap-5 flex-1">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={`relative py-2.5 text-[15px] flex items-center gap-0.5 ${
              tab.active
                ? 'text-xhs-text font-semibold'
                : 'text-xhs-secondary'
            }`}
          >
            {tab.locked && <Lock size={12} className="text-xhs-secondary" />}
            {tab.label}
            {tab.active && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full bg-xhs-red" />
            )}
          </button>
        ))}
      </div>
      <button>
        <Search size={18} className="text-xhs-secondary" />
      </button>
    </div>
  );
}

// 二级 Tab 栏
function SecondaryTabs() {
  const tabs = [
    { label: '笔记', count: 4486, active: true },
    { label: '专辑', count: 1, active: false },
    { label: '评论', count: 6, active: false },
    { label: '话题', count: 1, active: false },
    { label: '文件', count: 2, active: false },
  ];

  return (
    <div className="flex items-center gap-4 px-4 py-2.5 overflow-x-auto hide-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          className={`whitespace-nowrap text-[13px] ${
            tab.active
              ? 'text-xhs-text font-bold'
              : 'text-xhs-secondary'
          }`}
        >
          {tab.label} {tab.count}
        </button>
      ))}
    </div>
  );
}

// 单个笔记卡片
function NoteCard({ note }: { note: Note }) {
  const formatCount = (count: number) => {
    if (count >= 10000) {
      return (count / 10000).toFixed(1) + 'w';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  };

  return (
    <div className="masonry-item">
      <div className="bg-white rounded-md overflow-hidden">
        {/* 封面图 */}
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={note.coverUrl}
            alt={note.title}
            className="w-full block rounded-t-md"
            loading="lazy"
          />
          {note.type === 'video' && (
            <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
              视频
            </div>
          )}
        </div>
        {/* 标题 */}
        <div className="px-2 pt-2">
          <p className="text-[13px] text-xhs-text leading-[1.4] line-clamp-2">
            {note.title}
          </p>
        </div>
        {/* 底部：头像 + 作者 + 点赞 */}
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-1 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={note.author.avatarUrl}
              alt={note.author.name}
              className="w-4 h-4 rounded-full flex-shrink-0"
            />
            <span className="text-[11px] text-xhs-secondary truncate">
              {note.author.name}
            </span>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <Heart size={12} className="text-xhs-secondary" />
            <span className="text-[11px] text-xhs-secondary">
              {formatCount(note.likeCount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 瀑布流笔记列表
function NoteGrid({ notes }: { notes: Note[] }) {
  return (
    <div className="masonry-grid px-2 pt-1 pb-4">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}

// AI 整理悬浮按钮
function AIFloatingButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        router.push('/organize');
      }}
      className="absolute bottom-20 right-4 z-40 flex items-center gap-1 px-5 py-2.5 rounded-full text-white text-[14px] font-medium shadow-lg"
      style={{
        background: 'linear-gradient(135deg, #FF2442 0%, #FF6634 100%)',
      }}
    >
      <span>✨</span>
      <span>AI 整理</span>
    </button>
  );
}

export default function Home() {
  return (
    <MobileShell>
      <div className="relative flex flex-col h-full min-h-screen bg-white">
        {/* 主内容区域 */}
        <div className="flex-1 flex flex-col">
          <TopNav />
          <PrimaryTabs />
          <SecondaryTabs />
          <div className="flex-1 overflow-y-auto bg-xhs-divider">
            <NoteGrid notes={mockNotes} />
          </div>
        </div>
        {/* AI 整理悬浮按钮 */}
        <AIFloatingButton />
        {/* 底部导航 */}
        <BottomNav />
      </div>
    </MobileShell>
  );
}
