import { Category } from '../types';
import { mockNotes } from './mock-notes';

// 按分类筛选笔记的辅助函数
function getNotesByIds(ids: string[]) {
  return mockNotes.filter((note) => ids.includes(note.id));
}

export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: '穿搭灵感',
    icon: '👗',
    noteCount: 4,
    coverUrls: [
      'https://picsum.photos/seed/note1/400/530',
      'https://picsum.photos/seed/note10/400/580',
      'https://picsum.photos/seed/note17/400/550',
      'https://picsum.photos/seed/note7/400/470',
    ],
    aiSummary: '主要收藏了秋冬穿搭、韩系小香风、约会裙装和叠穿技巧，风格偏韩系法式，适合日常和约会场景。',
    notes: getNotesByIds(['1', '10', '17']),
  },
  {
    id: 'cat-2',
    name: '美食菜谱',
    icon: '🍰',
    noteCount: 3,
    coverUrls: [
      'https://picsum.photos/seed/note2/400/500',
      'https://picsum.photos/seed/note8/400/560',
      'https://picsum.photos/seed/note12/400/540',
    ],
    aiSummary: '收藏了甜品制作、减脂餐食谱和韩式料理教程，兼顾美味和健康，适合在家跟做。',
    notes: getNotesByIds(['2', '8', '12']),
  },
  {
    id: 'cat-3',
    name: '旅行攻略',
    icon: '✈️',
    noteCount: 3,
    coverUrls: [
      'https://picsum.photos/seed/note3/400/600',
      'https://picsum.photos/seed/note9/400/510',
      'https://picsum.photos/seed/note16/400/530',
    ],
    aiSummary: '国内外旅行攻略合集，包含大理、东京和厦门，预算从穷游到中等消费都有覆盖。',
    notes: getNotesByIds(['3', '9', '16']),
  },
  {
    id: 'cat-4',
    name: '护肤科普',
    icon: '🧴',
    noteCount: 2,
    coverUrls: [
      'https://picsum.photos/seed/note4/400/480',
      'https://picsum.photos/seed/note11/400/490',
    ],
    aiSummary: '护肤知识科普和产品推荐，关注早C晚A和敏感肌护理，注重科学护肤理念。',
    notes: getNotesByIds(['4', '11']),
  },
  {
    id: 'cat-5',
    name: '学习效率',
    icon: '📚',
    noteCount: 3,
    coverUrls: [
      'https://picsum.photos/seed/note5/400/550',
      'https://picsum.photos/seed/note13/400/500',
      'https://picsum.photos/seed/note18/400/500',
    ],
    aiSummary: '涵盖考研备考、效率工具和自律习惯养成，适合学生党和想提升自我的人群。',
    notes: getNotesByIds(['5', '13', '18']),
  },
  {
    id: 'cat-6',
    name: '家居生活',
    icon: '🏠',
    noteCount: 2,
    coverUrls: [
      'https://picsum.photos/seed/note6/400/520',
      'https://picsum.photos/seed/note14/400/460',
    ],
    aiSummary: '租房改造和收纳技巧，低成本打造高品质居住空间，实用性强。',
    notes: getNotesByIds(['6', '14']),
  },
  {
    id: 'cat-7',
    name: '美妆教程',
    icon: '💄',
    noteCount: 2,
    coverUrls: [
      'https://picsum.photos/seed/note7/400/470',
      'https://picsum.photos/seed/note15/400/570',
    ],
    aiSummary: '从底妆到眼妆的完整化妆教程，适合新手入门和进阶学习。',
    notes: getNotesByIds(['7', '15']),
  },
];
