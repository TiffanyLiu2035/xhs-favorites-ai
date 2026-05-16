'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
  Send,
  MessageCircle,
} from 'lucide-react';
import MobileShell from '../../components/MobileShell';
import BottomNav from '../../components/BottomNav';
import { mockCategories } from '../../data/mock-categories';
import { Note } from '../../types';

// AI 摘要卡片
function AISummaryCard({
  summary,
  categoryName,
}: {
  summary: string;
  categoryName: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-4 mt-3 rounded-2xl p-4 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #F0F4FF 0%, #F5F0FF 50%, #EEF0FF 100%)',
      }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles size={16} className="text-purple-500" />
        <span className="text-sm font-semibold text-[#333333]">AI 摘要</span>
      </div>
      <p
        className={`text-sm text-[#333333] leading-relaxed ${
          !expanded ? 'line-clamp-2' : ''
        }`}
      >
        {summary}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-0.5 mt-2 text-xs text-purple-500"
      >
        {expanded ? (
          <>
            收起 <ChevronUp size={14} />
          </>
        ) : (
          <>
            展开 <ChevronDown size={14} />
          </>
        )}
      </button>
    </motion.div>
  );
}

// 笔记列表项
function NoteItem({ note, index }: { note: Note; index: number }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className={`flex gap-3 px-4 py-3 border-b border-[#F5F5F5] ${
        note.isExpired ? 'opacity-50' : ''
      }`}
    >
      {/* 封面缩略图 */}
      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={note.coverUrl}
          alt={note.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {note.isExpired && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="text-[10px] text-white bg-black/50 px-1.5 py-0.5 rounded">
              已过期
            </span>
          </div>
        )}
      </div>

      {/* 笔记信息 */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <h3 className="text-[13px] text-[#333333] font-medium leading-tight line-clamp-2">
          {note.title}
        </h3>
        <div className="flex flex-col gap-0.5">
          {note.tags && note.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {note.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-[#FF2442] bg-red-50 px-1.5 py-0.5 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 text-[11px] text-[#999999]">
            <span>{note.author.name}</span>
            <span>·</span>
            <span>{formatDate(note.collectTime)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// AI 助手对话模态框
function AgentModal({
  visible,
  onClose,
  categoryName,
}: {
  visible: boolean;
  onClose: () => void;
  categoryName: string;
}) {
  const [inputValue, setInputValue] = useState('');

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* 遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 z-50"
            onClick={onClose}
          />
          {/* 对话框 */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[70%] flex flex-col"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#F5F5F5]">
              <h3 className="text-sm font-semibold text-[#333333]">
                收藏助手 · {categoryName}
              </h3>
              <button onClick={onClose}>
                <X size={20} className="text-[#999999]" />
              </button>
            </div>

            {/* 消息区域 */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-[#F5F5FF] rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles size={14} className="text-purple-500" />
                  <span className="text-xs font-semibold text-purple-600">
                    AI 助手
                  </span>
                </div>
                <p className="text-sm text-[#333333] leading-relaxed whitespace-pre-line">
                  {`我是你的收藏助手，可以帮你：\n- 总结这个分类的核心内容\n- 制定行动计划\n- 对比和推荐\n\n试试问我点什么吧~`}
                </p>
              </div>
            </div>

            {/* 输入框 */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-[#F5F5F5]">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="输入你的问题..."
                className="flex-1 text-sm text-[#333333] bg-[#F5F5F5] rounded-full px-4 py-2.5 outline-none placeholder:text-[#CCCCCC]"
              />
              <button
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                }}
              >
                <Send size={16} className="text-white" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [showAgent, setShowAgent] = useState(false);

  const category = mockCategories.find((c) => c.id === params.id);

  if (!category) {
    return (
      <MobileShell>
        <div className="flex flex-col items-center justify-center h-screen bg-white">
          <p className="text-lg text-[#999999]">未找到该分类</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-sm text-[#FF2442]"
          >
            返回上一页
          </button>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="relative flex flex-col h-full min-h-screen bg-white">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 顶部导航 */}
          <div className="flex items-center px-4 pt-14 pb-3 flex-shrink-0">
            <button onClick={() => router.back()} className="mr-3">
              <ArrowLeft size={22} className="text-[#333333]" />
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-xl">{category.icon}</span>
              <h1 className="text-lg font-semibold text-[#333333]">
                {category.name}
              </h1>
            </div>
            <span className="ml-auto text-xs text-[#999999]">
              {category.noteCount} 条
            </span>
          </div>

          {/* AI 摘要 */}
          <AISummaryCard
            summary={category.aiSummary}
            categoryName={category.name}
          />

          {/* 笔记列表 */}
          <div className="flex-1 overflow-y-auto mt-3">
            {category.notes.map((note, i) => (
              <NoteItem key={note.id} note={note} index={i} />
            ))}
          </div>
        </div>

        {/* Agent 浮动按钮 */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
          onClick={() => setShowAgent(true)}
          className="absolute bottom-24 right-4 z-40 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-white text-sm font-medium shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
          }}
        >
          <MessageCircle size={16} />
          <span>AI 助手</span>
        </motion.button>

        {/* Agent 模态框 */}
        <AgentModal
          visible={showAgent}
          onClose={() => setShowAgent(false)}
          categoryName={category.name}
        />

        {/* 底部导航 */}
        <BottomNav />
      </div>
    </MobileShell>
  );
}
