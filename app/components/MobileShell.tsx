'use client';

import React from 'react';
import DocumentPanel from './DocumentPanel';

interface MobileShellProps {
  children: React.ReactNode;
}

export default function MobileShell({ children }: MobileShellProps) {
  return (
    <>
      {/* Desktop: split layout — doc on left, phone on right */}
      <div className="hidden md:flex h-screen bg-gray-50">
        {/* Left: Document Panel */}
        <div className="flex-1 border-r border-gray-200 bg-[#FAFAFA] overflow-hidden">
          <DocumentPanel />
        </div>

        {/* Right: Phone mockup */}
        <div className="flex-shrink-0 flex items-center justify-center p-8" style={{ width: 440 }}>
          <div className="relative sticky top-8" style={{ width: 390, height: 844 }}>
            {/* Phone frame */}
            <div className="absolute inset-0 rounded-[50px] border-[6px] border-black bg-white overflow-hidden shadow-2xl">
              {/* Dynamic Island */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50">
                <div className="w-[126px] h-[37px] bg-black rounded-full" />
              </div>
              {/* Content */}
              <div className="w-full h-full overflow-y-auto hide-scrollbar pt-0">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: fullscreen (unchanged) */}
      <div className="md:hidden min-h-screen bg-white">
        {children}
      </div>
    </>
  );
}
