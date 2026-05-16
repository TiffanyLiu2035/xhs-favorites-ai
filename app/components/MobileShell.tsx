'use client';

import React from 'react';

interface MobileShellProps {
  children: React.ReactNode;
}

export default function MobileShell({ children }: MobileShellProps) {
  return (
    <>
      {/* 桌面端：手机壳包裹 */}
      <div className="hidden md:flex items-center justify-center min-h-screen bg-gray-100">
        <div className="relative" style={{ width: 390, height: 844 }}>
          {/* 手机壳外框 */}
          <div
            className="absolute inset-0 rounded-[50px] border-[6px] border-black bg-white overflow-hidden shadow-2xl"
          >
            {/* 灵动岛 */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50">
              <div className="w-[126px] h-[37px] bg-black rounded-full" />
            </div>
            {/* 内容区域 */}
            <div className="w-full h-full overflow-y-auto hide-scrollbar pt-0">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* 移动端：全屏显示 */}
      <div className="md:hidden min-h-screen bg-white">
        {children}
      </div>
    </>
  );
}
