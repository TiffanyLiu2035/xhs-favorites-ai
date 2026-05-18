'use client';

import React from 'react';
import { Home, ShoppingBag, Plus, MessageCircle, User } from 'lucide-react';

interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function BottomNav({ activeTab = '我', onTabChange }: BottomNavProps) {
  const navItems = [
    { icon: <Home size={22} />, label: '首页' },
    { icon: <ShoppingBag size={22} />, label: '购物' },
    { icon: <Plus size={20} color="#fff" />, label: '', isCenter: true },
    { icon: <MessageCircle size={22} />, label: '消息' },
    { icon: <User size={22} />, label: '我' },
  ];

  return (
    <div className="flex items-center justify-around bg-white border-t border-xhs-divider py-1.5 pb-5">
      {navItems.map((item, index) => {
        if (item.isCenter) {
          return (
            <button
              key={index}
              className="flex items-center justify-center w-[42px] h-[42px] rounded-full bg-xhs-red -mt-1"
            >
              {item.icon}
            </button>
          );
        }

        const isActive = item.label === activeTab;
        const isClickable = item.label === '首页' || item.label === '我';

        return (
          <button
            key={index}
            onClick={() => isClickable && onTabChange?.(item.label)}
            className={`relative flex flex-col items-center gap-0.5 ${
              isActive ? 'text-xhs-text' : 'text-xhs-secondary'
            }`}
          >
            <span className={`relative ${isActive ? 'text-xhs-text' : 'text-xhs-secondary'}`}>
              {item.icon}
            </span>
            <span className={`text-[10px] ${isActive ? 'font-semibold' : ''}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
