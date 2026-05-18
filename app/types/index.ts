// 笔记数据类型
export interface Note {
  id: string;
  title: string;
  coverUrl: string;        // 封面图 URL
  author: {
    name: string;
    avatarUrl: string;
  };
  likeCount: number;
  collectTime: string;     // 收藏时间 ISO string
  content?: string;        // 笔记正文摘要
  tags?: string[];         // 原始标签
  type: 'image' | 'video'; // 笔记类型
  // AI 整理后添加的字段
  aiCategory?: string;     // AI 分类
  aiTags?: string[];       // AI 标签
  savedAt?: string;        // 收藏日期
  isExpired?: boolean;     // 是否过期
  expiredReason?: string;  // 过期原因
}

// AI 分类
export interface Category {
  id: string;
  name: string;
  icon: string;            // emoji 图标
  noteCount: number;
  coverUrls: string[];     // 前 4 张封面拼图
  aiSummary: string;       // AI 生成的分类摘要
  notes: Note[];
}

// 整理结果
export interface OrganizeResult {
  totalNotes: number;
  categories: Category[];
  expiredCount: number;
  summaryCount: number;
}
