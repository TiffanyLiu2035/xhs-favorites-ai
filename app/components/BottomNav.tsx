'use client';

import React from 'react';
import { Home, ShoppingBag, Plus, MessageCircle, User } from 'lucide-react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  isCenter?: boolean;
}

export default function BottomNav() {
  const navItems: NavItem[] = [
    {
      icon: <Home size={22} />,
      label: '首页',
    },
    {
      icon: <ShoppingBag size={22} />,
      label: '购物',
    },
    {
      icon: <Plus size={20} color="#fff" />,
      label: '',
      isCenter: true,
    },
    {
      icon: <MessageCircle size={22} />,
      label: '消息',
    },
    {
      icon: <User size={22} />,
      label: '我',
      active: true,
    },
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

        return (
          <button
            key={index}
            className={`flex flex-col items-center gap-0.5 ${
              item.active ? 'text-xhs-text' : 'text-xhs-secondary'
            }`}
          >
            <span className={item.active ? 'text-xhs-text' : 'text-xhs-secondary'}>
              {item.icon}
            </span>
            <span className={`text-[10px] ${item.active ? 'font-semibold' : ''}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
