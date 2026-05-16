'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import MobileShell from '../components/MobileShell';
import { mockCategories } from '../data/mock-categories';
import { mockNotes } from '../data/mock-notes';

// 进度环组件
function ProgressRing({
  progress,
  complete,
}: {
  progress: number;
  complete: boolean;
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#F0F0F0"
          strokeWidth="6"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={complete ? '#22C55E' : '#FF2442'}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {complete ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22C55E"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.div>
        ) : (
          <span className="text-2xl font-bold text-[#333333]">
            {Math.round(progress)}%
          </span>
        )}
      </div>
    </div>
  );
}

// 扫描动画 - 笔记缩略图快速闪过
function ScanAnimation() {
  const thumbnails = mockNotes.slice(0, 8);
  return (
    <div className="relative w-48 h-48 overflow-hidden rounded-xl">
      {thumbnails.map((note, i) => (
        <motion.div
          key={note.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [1.1, 1, 1, 0.95],
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.15,
            repeat: 0,
            ease: 'easeInOut',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={note.coverUrl}
            alt=""
            className="w-full h-full object-cover rounded-xl"
          />
        </motion.div>
      ))}
      {/* 扫描线 */}
      <motion.div
        className="absolute left-0 right-0 h-1 rounded-full"
        style={{ background: 'linear-gradient(90deg, transparent, #FF2442, transparent)' }}
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

// 分类标签动画
function CategoryLabels({ animate }: { animate: boolean }) {
  const categories = mockCategories;

  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-[280px]">
      {categories.map((cat, i) => (
        <motion.div
          key={cat.id}
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={
            animate
              ? { opacity: 1, scale: 1, y: 0 }
              : { opacity: 0, scale: 0, y: 20 }
          }
          transition={{
            delay: i * 0.12,
            type: 'spring',
            stiffness: 400,
            damping: 25,
          }}
          className="px-3 py-1.5 rounded-full text-sm font-medium text-[#333333] border border-gray-200"
          style={{ background: '#FFF5F5' }}
        >
          {cat.icon} {cat.name}
        </motion.div>
      ))}
    </div>
  );
}

export default function OrganizePage() {
  const router = useRouter();
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Phase 1: 0-1.5s
    const t1 = setTimeout(() => setPhase(1), 100);

    // Progress animation for phase 1
    const p1 = setInterval(() => {
      setProgress((prev) => {
        if (prev < 30) return prev + 2;
        return prev;
      });
    }, 80);

    // Phase 2: 1.5s
    const t2 = setTimeout(() => {
      setPhase(2);
      clearInterval(p1);
      const p2 = setInterval(() => {
        setProgress((prev) => {
          if (prev < 70) return prev + 2.5;
          clearInterval(p2);
          return prev;
        });
      }, 60);
    }, 1500);

    // Phase 3: 3s
    const t3 = setTimeout(() => {
      setPhase(3);
      const p3 = setInterval(() => {
        setProgress((prev) => {
          if (prev < 100) return prev + 3;
          clearInterval(p3);
          return 100;
        });
      }, 50);
    }, 3000);

    // Phase 4: 4.5s
    const t4 = setTimeout(() => {
      setPhase(4);
      setProgress(100);
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearInterval(p1);
    };
  }, []);

  const statusText = () => {
    switch (phase) {
      case 0:
      case 1:
        return '正在扫描 4486 条收藏...';
      case 2:
        return '识别到 7 个分类...';
      case 3:
        return '整理完成！';
      case 4:
        return '整理完成！';
      default:
        return '';
    }
  };

  return (
    <MobileShell>
      <div className="relative flex flex-col h-full min-h-screen bg-white">
        {/* 顶部导航 */}
        <div className="flex items-center px-4 pt-14 pb-3">
          <button onClick={() => router.back()} className="mr-3">
            <ArrowLeft size={22} className="text-[#333333]" />
          </button>
          <h1 className="text-lg font-semibold text-[#333333]">AI 智能整理</h1>
        </div>

        {/* 中间动画区域 */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
          {/* 进度环 */}
          <ProgressRing progress={progress} complete={phase >= 3} />

          {/* 动画内容区 */}
          <div className="h-56 flex items-center justify-center w-full">
            <AnimatePresence mode="wait">
              {(phase === 0 || phase === 1) && (
                <motion.div
                  key="scan"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-4"
                >
                  <ScanAnimation />
                </motion.div>
              )}

              {phase === 2 && (
                <motion.div
                  key="categorize"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-4"
                >
                  <CategoryLabels animate={true} />
                </motion.div>
              )}

              {(phase === 3 || phase === 4) && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center gap-4"
                >
                  {/* 整齐的分类网格 */}
                  <div className="grid grid-cols-4 gap-2">
                    {mockCategories.map((cat, i) => (
                      <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: i * 0.06,
                          type: 'spring',
                          stiffness: 300,
                        }}
                        className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-[#FFF5F5]"
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <span className="text-[10px] text-[#333333] mt-0.5">
                          {cat.name}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* 统计信息 */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-2"
                  >
                    <p className="text-sm font-medium text-[#333333]">
                      已整理 4486 条收藏 → 7 个智能分类
                    </p>
                    <p className="text-xs text-[#999999] mt-1">
                      发现 12 条可能过期的内容
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 状态文字 */}
          <motion.p
            key={statusText()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-[#999999]"
          >
            {statusText()}
          </motion.p>
        </div>

        {/* 底部按钮 */}
        <div className="px-5 pb-10">
          <AnimatePresence>
            {phase >= 4 && (
              <motion.button
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={() => router.push('/result')}
                className="w-full py-3.5 rounded-full text-white text-base font-semibold shadow-lg"
                style={{
                  background:
                    'linear-gradient(135deg, #FF2442 0%, #FF6634 100%)',
                }}
              >
                查看整理结果
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MobileShell>
  );
}
