'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import MobileShell from '../components/MobileShell';
import BottomNav from '../components/BottomNav';
import { mockCategories } from '../data/mock-categories';

// 数字滚动组件
function AnimatedNumber({ target, duration = 1.2 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return <>{value}</>;
}

// 汇总卡片
function SummaryCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-4 mt-3 rounded-2xl p-5 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF0F0 50%, #FFE8E8 100%)',
      }}
    >
      <div className="flex items-baseline gap-2 justify-center">
        <span className="text-3xl font-bold text-[#FF2442]">
          <AnimatedNumber target={4486} />
        </span>
        <span className="text-sm text-[#999999]">条收藏</span>
        <span className="text-xl text-[#999999]">→</span>
        <span className="text-3xl font-bold text-[#FF2442]">
          <AnimatedNumber target={7} duration={0.8} />
        </span>
        <span className="text-sm text-[#999999]">个分类</span>
      </div>
      <div className="text-center mt-3">
        <p className="text-xs text-[#999999]">
          发现 12 条可能过期 · 生成 3 份摘要
        </p>
      </div>
    </motion.div>
  );
}

// 分类卡片
function CategoryCard({
  category,
  index,
}: {
  category: (typeof mockCategories)[0];
  index: number;
}) {
  const coverUrls = category.coverUrls.slice(0, 4);
  // Pad to 4 if needed
  while (coverUrls.length < 4) {
    coverUrls.push(coverUrls[0] || '');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.08,
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
    >
      <Link href={`/category/${category.id}`} className="block">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
          {/* 2x2 封面拼图 */}
          <div className="grid grid-cols-2 gap-[1px] bg-gray-100 aspect-square">
            {coverUrls.map((url, i) => (
              <div key={i} className="relative overflow-hidden bg-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          {/* 分类信息 */}
          <div className="p-2.5">
            <div className="flex items-center gap-1">
              <span className="text-base">{category.icon}</span>
              <span className="text-sm font-semibold text-[#333333]">
                {category.name}
              </span>
            </div>
            <p className="text-xs text-[#999999] mt-0.5">
              {category.noteCount} 条笔记
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// 特殊卡片
function SpecialCard({
  emoji,
  title,
  count,
  colorStyle,
  index,
}: {
  emoji: string;
  title: string;
  count: number;
  colorStyle: 'gray' | 'gold';
  index: number;
}) {
  const bgStyle =
    colorStyle === 'gray'
      ? { background: 'linear-gradient(135deg, #F5F5F5 0%, #ECECEC 100%)' }
      : { background: 'linear-gradient(135deg, #FFFDF0 0%, #FFF8E0 100%)' };

  const borderColor =
    colorStyle === 'gray' ? 'border-gray-200' : 'border-amber-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.08,
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
    >
      <div
        className={`rounded-xl overflow-hidden shadow-sm border ${borderColor} aspect-square flex flex-col items-center justify-center gap-2`}
        style={bgStyle}
      >
        <span className="text-3xl">{emoji}</span>
        <span className="text-sm font-semibold text-[#333333]">{title}</span>
        <span className="text-xs text-[#999999]">{count} 条</span>
      </div>
    </motion.div>
  );
}

export default function ResultPage() {
  const router = useRouter();

  return (
    <MobileShell>
      <div className="relative flex flex-col h-full min-h-screen bg-white">
        <div className="flex-1 flex flex-col">
          {/* 顶部导航 */}
          <div className="flex items-center px-4 pt-14 pb-3">
            <button onClick={() => router.back()} className="mr-3">
              <ArrowLeft size={22} className="text-[#333333]" />
            </button>
            <h1 className="text-lg font-semibold text-[#333333]">整理结果</h1>
          </div>

          {/* 汇总卡片 */}
          <SummaryCard />

          {/* 分类卡片网格 */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              {mockCategories.map((cat, i) => (
                <CategoryCard key={cat.id} category={cat} index={i} />
              ))}
              {/* 特殊卡片 */}
              <SpecialCard
                emoji="🕐"
                title="可能过期"
                count={12}
                colorStyle="gray"
                index={mockCategories.length}
              />
              <SpecialCard
                emoji="⭐"
                title="高价值精选"
                count={5}
                colorStyle="gold"
                index={mockCategories.length + 1}
              />
            </div>
          </div>
        </div>

        {/* 底部导航 */}
        <BottomNav />
      </div>
    </MobileShell>
  );
}
