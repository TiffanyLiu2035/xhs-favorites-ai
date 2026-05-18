'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import MobileShell from './components/MobileShell';
import BottomNav from './components/BottomNav';
import { mockNotes } from './data/mock-notes';
import { mockFeedNotes } from './data/mock-feed';
import { mockCategories } from './data/mock-categories';
import { Note, Category } from './types';
import Markdown from 'react-markdown';
import {
  Menu,
  Search,
  Settings,
  Share2,
  Heart,
  Lock,
  X,
  Send,
  Sparkles,
  Loader2,
  Plus,
  Info,
  Copy,
  RefreshCw,
  MessageCircle,
  Hash,
  FileText,
} from 'lucide-react';

// ---- Note ID matching helper (LLM may return "001" instead of "note-001") ----

function buildNoteMap(notes: Note[]): Map<string, Note> {
  const map = new Map<string, Note>();
  for (const n of notes) {
    map.set(n.id, n);
    // Also index by numeric suffix: "note-001" → "001", "1"
    const num = n.id.replace(/^note-/, '');
    map.set(num, n);
    // Also index without leading zeros: "001" → "1"
    const stripped = num.replace(/^0+/, '');
    if (stripped) map.set(stripped, n);
  }
  return map;
}

function resolveNotes(noteIds: string[], noteMap: Map<string, Note>): Note[] {
  const seen = new Set<string>();
  const result: Note[] = [];
  for (const id of noteIds) {
    const note = noteMap.get(id);
    if (note && !seen.has(note.id)) {
      seen.add(note.id);
      result.push(note);
    }
  }
  return result;
}

// ---- AI Tag color helper ----

function getAiTagStyle(tag: string): string {
  const locationKeywords = ['云南', '东京', '厦门', '北京', '上海', '成都', '大理', '日本'];
  const priceKeywords = ['人均', '省钱', '穷游', '低成本'];
  const sceneKeywords = ['通勤', '约会', '居家', '日常', '探店', '自由行', '早起', '打卡'];

  const tagText = tag.replace('#', '');

  if (locationKeywords.some(k => tagText.includes(k))) {
    return 'bg-blue-50 text-blue-600 border border-blue-100';
  }
  if (priceKeywords.some(k => tagText.includes(k))) {
    return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
  }
  if (sceneKeywords.some(k => tagText.includes(k))) {
    return 'bg-orange-50 text-orange-600 border border-orange-100';
  }
  return 'bg-purple-50 text-purple-600 border border-purple-100';
}

// ---- Mock Messages Data ----

interface AgentMessage {
  id: string;
  icon: string;
  title: string;
  content: string;
  button: string;
  time: string;
  borderColor: string;
}

const mockMessages: AgentMessage[] = [
  {
    id: 'msg-1',
    icon: '\uD83D\uDCC5',
    title: '那年今日',
    content: '去年今天，你收藏了「杭州西湖边这家咖啡馆 窗外就是断桥残雪」。现在正是西湖最美的季节，要回顾一下吗？',
    button: '查看收藏',
    time: '今天',
    borderColor: '#FF8C00',
  },
  {
    id: 'msg-2',
    icon: '\uD83D\uDCCA',
    title: '本周收藏周报',
    content: '本周新增 12 条收藏。美食探店类占比最高（5条），已自动归入对应分类。你的收藏夹现在有 247 条内容，8 个智能分类。',
    button: '查看分类',
    time: '2天前',
    borderColor: '#4A90D9',
  },
  {
    id: 'msg-3',
    icon: '\u26A0\uFE0F',
    title: '过期内容提醒',
    content: '发现 3 条可能过期的收藏：「2024年度必去咖啡店」「春节限定套餐推荐」「双11好物清单」。建议清理以保持收藏夹健康。',
    button: '一键清理',
    time: '3天前',
    borderColor: '#E8A838',
  },
  {
    id: 'msg-4',
    icon: '\uD83C\uDFAF',
    title: '兴趣共振',
    content: '你最近在看很多减脂内容，发现你 3 个月前收藏过「居家健身｜零器械全身燃脂30min」，要回顾一下吗？',
    button: '查看收藏',
    time: '5天前',
    borderColor: '#7C5CFC',
  },
  {
    id: 'msg-5',
    icon: '\u2708\uFE0F',
    title: '旅行准备提醒',
    content: '检测到你收藏了多篇成都攻略，要根据这些收藏生成一份旅行计划吗？',
    button: '生成计划',
    time: '1周前',
    borderColor: '#20B2AA',
  },
];

// ---- Taste Match Data (收藏社交) ----

interface TasteMatch {
  id: string;
  name: string;
  avatar: string;
  matchPercent: number;
  sharedInterests: string[];
  collectionTitle: string;
  collectionCount: number;
  collectionPreview: string[];
}

const mockTasteMatches: TasteMatch[] = [
  {
    id: 'tm-1',
    name: '成都探店小分队',
    avatar: 'https://picsum.photos/seed/taste1/100/100',
    matchPercent: 94,
    sharedInterests: ['成都美食', '火锅', '探店'],
    collectionTitle: '成都必吃 50 家',
    collectionCount: 50,
    collectionPreview: ['https://picsum.photos/seed/tp1a/200/200', 'https://picsum.photos/seed/tp1b/200/200', 'https://picsum.photos/seed/tp1c/200/200'],
  },
  {
    id: 'tm-2',
    name: '旅行穿搭手册',
    avatar: 'https://picsum.photos/seed/taste2/100/100',
    matchPercent: 87,
    sharedInterests: ['旅行攻略', '穿搭', '拍照'],
    collectionTitle: '30 套旅行穿搭模版',
    collectionCount: 30,
    collectionPreview: ['https://picsum.photos/seed/tp2a/200/200', 'https://picsum.photos/seed/tp2b/200/200', 'https://picsum.photos/seed/tp2c/200/200'],
  },
  {
    id: 'tm-3',
    name: '护肤成分党',
    avatar: 'https://picsum.photos/seed/taste3/100/100',
    matchPercent: 82,
    sharedInterests: ['护肤', '美妆', '敏感肌'],
    collectionTitle: '敏感肌护肤红黑榜',
    collectionCount: 42,
    collectionPreview: ['https://picsum.photos/seed/tp3a/200/200', 'https://picsum.photos/seed/tp3b/200/200', 'https://picsum.photos/seed/tp3c/200/200'],
  },
  {
    id: 'tm-4',
    name: '居家改造日记',
    avatar: 'https://picsum.photos/seed/taste4/100/100',
    matchPercent: 76,
    sharedInterests: ['居家', '装修', '收纳'],
    collectionTitle: '小户型改造灵感库',
    collectionCount: 28,
    collectionPreview: ['https://picsum.photos/seed/tp4a/200/200', 'https://picsum.photos/seed/tp4b/200/200', 'https://picsum.photos/seed/tp4c/200/200'],
  },
];

// ---- AI Album Suggestions (收藏推荐) ----

interface AlbumSuggestion {
  id: string;
  name: string;
  icon: string;
  noteCount: number;
  aiReason: string;
  matchScore: number;
  isNew: boolean;
}

// Album library: all possible albums with keywords for matching
const albumLibrary: (AlbumSuggestion & { keywords: string[] })[] = [
  { id: 'album-food', name: '美食探店合集', icon: '🍜', noteCount: 23, aiReason: '', matchScore: 0, isNew: false, keywords: ['美食', '火锅', '串串', '甜品', '咖啡', '餐厅', '探店', '好吃', '吃货', '烘焙', '蛋糕', '料理', '早午餐', '减脂餐', '食谱', '菜谱'] },
  { id: 'album-travel', name: '旅行攻略清单', icon: '✈️', noteCount: 15, aiReason: '', matchScore: 0, isNew: false, keywords: ['旅行', '攻略', '自由行', '出行', '机票', '酒店', '景点', '三亚', '大理', '成都', '北京', '上海', '杭州', '深圳', 'citywalk', '骑行', '环海'] },
  { id: 'album-fashion', name: '穿搭灵感库', icon: '👗', noteCount: 18, aiReason: '', matchScore: 0, isNew: false, keywords: ['穿搭', '搭配', '职场', '通勤', '衣服', '鞋', '包', '时尚', '高级感', '风格'] },
  { id: 'album-skincare', name: '护肤美妆笔记', icon: '✨', noteCount: 12, aiReason: '', matchScore: 0, isNew: false, keywords: ['护肤', '美妆', '粉底', '防晒', '精华', '面霜', '化妆', '痘', '美白', '成分'] },
  { id: 'album-fitness', name: '健身运动打卡', icon: '💪', noteCount: 8, aiReason: '', matchScore: 0, isNew: false, keywords: ['健身', '运动', '减脂', '减肥', '瘦', '燃脂', '跑步', '瑜伽', 'keep'] },
  { id: 'album-home', name: '家居改造灵感', icon: '🏠', noteCount: 10, aiReason: '', matchScore: 0, isNew: false, keywords: ['装修', '家居', '改造', '租房', '收纳', '日式', '小户型', '卧室', '客厅', '绿植', '多肉'] },
  { id: 'album-study', name: '学习效率工具', icon: '📖', noteCount: 9, aiReason: '', matchScore: 0, isNew: false, keywords: ['学习', '考研', '英语', '笔记', '效率', '备考', 'iPad', '方法', '考试', '读书'] },
  { id: 'album-career', name: '职场成长指南', icon: '💼', noteCount: 6, aiReason: '', matchScore: 0, isNew: false, keywords: ['职场', '转行', '面试', '简历', '产品经理', '程序员', '工作', '薪资', '晋升'] },
  { id: 'album-pet', name: '萌宠养护手册', icon: '🐱', noteCount: 5, aiReason: '', matchScore: 0, isNew: false, keywords: ['猫', '狗', '宠物', '养猫', '养狗', '铲屎官', '猫粮', '宠物医院'] },
  { id: 'album-photo', name: '摄影拍照技巧', icon: '📸', noteCount: 7, aiReason: '', matchScore: 0, isNew: false, keywords: ['拍照', '摄影', '出片', '修图', '手机摄影', '构图', '滤镜', '夜景'] },
];

function getAlbumSuggestions(note: Note): AlbumSuggestion[] {
  const text = `${note.title} ${note.content || ''} ${(note.tags || []).join(' ')}`.toLowerCase();

  const scored = albumLibrary.map((album) => {
    const hits = album.keywords.filter((kw) => text.includes(kw));
    const score = Math.min(98, Math.round((hits.length / Math.max(album.keywords.length, 1)) * 100 + (hits.length > 0 ? 55 : 0)));
    return { ...album, matchScore: score, hitCount: hits.length };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);

  const top = scored.filter((s) => s.hitCount > 0).slice(0, 2);

  // Always add the best match with high-confidence reason
  const results: AlbumSuggestion[] = top.map((s, i) => ({
    id: s.id,
    name: s.name,
    icon: s.icon,
    noteCount: s.noteCount,
    matchScore: Math.max(s.matchScore, i === 0 ? 85 : 60),
    aiReason: i === 0 ? `内容高度匹配，已有 ${s.noteCount} 篇同类笔记` : `涉及${s.name.replace(/[合集清单库笔记手册指南打卡灵感工具]/g, '')}相关信息`,
    isNew: false,
  }));

  // If less than 2 matches, add fallback
  if (results.length < 2) {
    const fallback = scored.find((s) => s.hitCount === 0 && !results.some((r) => r.id === s.id));
    if (fallback) {
      results.push({
        id: fallback.id, name: fallback.name, icon: fallback.icon,
        noteCount: fallback.noteCount, matchScore: 45,
        aiReason: '可能相关的收藏分类', isNew: false,
      });
    }
  }

  // Add a "new album" suggestion based on the note's primary tag
  const primaryTag = note.tags?.[0] || note.title.slice(0, 4);
  results.push({
    id: 'album-new',
    name: primaryTag.length > 6 ? primaryTag.slice(0, 6) : primaryTag,
    icon: '🗂️',
    noteCount: 0,
    matchScore: Math.max(30, (results[0]?.matchScore || 70) - 35),
    aiReason: '检测到新兴趣方向，建议新建专辑归类',
    isNew: true,
  });

  return results.slice(0, 3);
}

// ---- Knowledge Base Data (RAG 知识沉淀) ----

interface KnowledgeEntry {
  id: string;
  type: 'restaurant' | 'destination' | 'product' | 'tip';
  title: string;
  fields: { label: string; value: string }[];
  sourceNote: string;
  sourceCount: number;
  tags: string[];
  confidence: number;
}

const knowledgeTypeInfo: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  restaurant: { label: '餐厅', emoji: '\uD83C\uDF7D\uFE0F', color: '#FF4757', bg: '#FFF0F0' },
  destination: { label: '目的地', emoji: '\uD83D\uDDFA\uFE0F', color: '#4A90D9', bg: '#F0F5FF' },
  product: { label: '好物', emoji: '\uD83D\uDCE6', color: '#7C5CFC', bg: '#F5F0FF' },
  tip: { label: '技巧', emoji: '\uD83D\uDCA1', color: '#FF8C00', bg: '#FFF8F0' },
};

const mockKnowledge: KnowledgeEntry[] = [
  {
    id: 'kb-1', type: 'restaurant', title: '蜀九香火锅',
    fields: [
      { label: '位置', value: '成都·春熙路太古里旁' },
      { label: '人均', value: '¥80' },
      { label: '推荐', value: '鲜切毛肚（涮8秒）、鹅肠' },
      { label: '提示', value: '晚6点后排队1h+，推荐红油锅底微辣' },
    ],
    sourceNote: '姐妹们！这家成都火锅太绝了', sourceCount: 3,
    tags: ['火锅', '成都', '春熙路'], confidence: 95,
  },
  {
    id: 'kb-2', type: 'restaurant', title: '马路边边麻辣烫',
    fields: [
      { label: '位置', value: '成都·建设路电子科大旁' },
      { label: '人均', value: '¥50' },
      { label: '推荐', value: '牛肉、掌中宝、脑花、兔头' },
      { label: '交通', value: '地铁建设北路站B口步行5分钟' },
    ],
    sourceNote: '成都串串香天花板找到了', sourceCount: 2,
    tags: ['串串', '成都', '学生党'], confidence: 92,
  },
  {
    id: 'kb-3', type: 'destination', title: '大理·双廊古镇',
    fields: [
      { label: '特点', value: '比大理古城安静，适合住2晚' },
      { label: '玩法', value: '租电动车环洱海' },
      { label: '住宿', value: '双廊海景客栈，均价300-500/晚' },
      { label: '最佳季节', value: '3-5月（避开暑假人流）' },
    ],
    sourceNote: '大理5天4晚超全攻略', sourceCount: 4,
    tags: ['大理', '云南', '洱海'], confidence: 90,
  },
  {
    id: 'kb-4', type: 'destination', title: '成都·宽窄巷子',
    fields: [
      { label: '建议', value: '白天逛+晚上看灯，预留2-3小时' },
      { label: '美食', value: '三大炮、甜水面、龙抄手' },
      { label: '避坑', value: '巷内商铺偏贵，周边小巷更地道' },
    ],
    sourceNote: '成都3天2晚本地人路线', sourceCount: 3,
    tags: ['成都', '古镇', '打卡'], confidence: 88,
  },
  {
    id: 'kb-5', type: 'product', title: '修复面霜（敏感肌）',
    fields: [
      { label: '效果', value: '用1个月泛红明显改善' },
      { label: '肤质', value: '敏感肌友好，无刺激' },
      { label: '用法', value: '洁面后直接涂，不用叠加精华' },
    ],
    sourceNote: '敏感肌护肤红黑榜', sourceCount: 2,
    tags: ['护肤', '敏感肌', '修复'], confidence: 85,
  },
  {
    id: 'kb-6', type: 'tip', title: '小个子显高穿搭法则',
    fields: [
      { label: '核心', value: '高腰线是第一法则' },
      { label: '裤型', value: '选九分裤最显腿长' },
      { label: '配色', value: '上浅下深，同色系显高' },
      { label: '身高参考', value: '155cm 亲测有效' },
    ],
    sourceNote: '155小个子穿出170既视感', sourceCount: 5,
    tags: ['穿搭', '小个子', '显高'], confidence: 93,
  },
  {
    id: 'kb-7', type: 'tip', title: '居家腰腹训练',
    fields: [
      { label: '效果', value: '2周腰围-2cm' },
      { label: '器材', value: '不需要，徒手即可' },
      { label: '时长', value: '每次15-20分钟' },
      { label: '频率', value: '隔天练，配合饮食效果更好' },
    ],
    sourceNote: '跟着练了两周腰围小了', sourceCount: 2,
    tags: ['健身', '居家', '腰腹'], confidence: 87,
  },
  {
    id: 'kb-8', type: 'tip', title: '厨房台面选材',
    fields: [
      { label: '推荐', value: '石英石（耐用）' },
      { label: '避坑', value: '岩板用半年容易裂' },
      { label: '价格', value: '石英石 800-1500/延米' },
    ],
    sourceNote: '装修踩坑实录', sourceCount: 1,
    tags: ['装修', '厨房', '选材'], confidence: 80,
  },
];

// ---- Knowledge Base Tab ----

function KnowledgeBaseTab() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const filters = [
    { key: 'all', label: '全部', count: mockKnowledge.length },
    { key: 'restaurant', label: '\uD83C\uDF7D\uFE0F 餐厅', count: mockKnowledge.filter(k => k.type === 'restaurant').length },
    { key: 'destination', label: '\uD83D\uDDFA\uFE0F 目的地', count: mockKnowledge.filter(k => k.type === 'destination').length },
    { key: 'product', label: '\uD83D\uDCE6 好物', count: mockKnowledge.filter(k => k.type === 'product').length },
    { key: 'tip', label: '\uD83D\uDCA1 技巧', count: mockKnowledge.filter(k => k.type === 'tip').length },
  ];
  const filtered = activeFilter === 'all' ? mockKnowledge : mockKnowledge.filter(k => k.type === activeFilter);

  return (
    <div className="px-3 py-3">
      {/* Header */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm mb-3">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} className="text-[#FF2442]" />
          <span className="text-[14px] font-semibold text-[#333]">AI 知识沉淀</span>
          <span className="ml-auto text-[11px] text-[#999]">从 {mockNotes.length} 篇收藏中提取</span>
        </div>
        <p className="text-[11px] text-[#888] leading-relaxed">
          自动从你的收藏笔记中提取餐厅、目的地、好物、技巧等结构化知识，随时查阅
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto hide-scrollbar">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
              activeFilter === f.key
                ? 'bg-[#FF2442] text-white'
                : 'bg-white text-[#666] border border-[#E8E8E8]'
            }`}
          >
            {f.label} <span className={activeFilter === f.key ? 'text-white/70' : 'text-[#CCC]'}>{f.count}</span>
          </button>
        ))}
      </div>

      {/* Knowledge cards */}
      <div className="space-y-2.5">
        {filtered.map((entry, i) => {
          const meta = knowledgeTypeInfo[entry.type];
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-3.5 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[18px]">{meta.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#333]">{entry.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ color: meta.color, backgroundColor: meta.bg }}>{meta.label}</span>
                    <span className="text-[10px] text-[#CCC]">来自 {entry.sourceCount} 篇笔记</span>
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.confidence >= 90 ? '#2ED573' : entry.confidence >= 80 ? '#FFA502' : '#CCC' }} />
                  <span className="text-[10px] text-[#999]">{entry.confidence}%</span>
                </div>
              </div>

              {/* Structured fields */}
              <div className="bg-[#FAFAFA] rounded-xl p-2.5 space-y-1.5">
                {entry.fields.map((field) => (
                  <div key={field.label} className="flex items-start gap-2">
                    <span className="text-[11px] text-[#999] w-[38px] flex-shrink-0 text-right">{field.label}</span>
                    <span className="text-[12px] text-[#444] leading-snug">{field.value}</span>
                  </div>
                ))}
              </div>

              {/* Tags + source */}
              <div className="flex items-center gap-1.5 mt-2">
                {entry.tags.map((tag) => (
                  <span key={tag} className="text-[10px] text-[#4A90D9] bg-[#F0F5FF] px-1.5 py-0.5 rounded-full">#{tag}</span>
                ))}
                <span className="text-[10px] text-[#CCC] ml-auto truncate max-w-[40%]">
                  {'\uD83D\uDCCE'} {entry.sourceNote.slice(0, 12)}...
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Layout Components ----

function TopNav() {
  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-14 pb-2">
      <button>
        <Menu size={22} className="text-white drop-shadow-sm" />
      </button>
      <div className="flex items-center gap-4">
        <button>
          <Share2 size={20} className="text-white drop-shadow-sm" />
        </button>
      </div>
    </div>
  );
}

function ProfileSection() {
  return (
    <div className="relative">
      {/* Cover photo */}
      <div className="relative h-[200px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://picsum.photos/seed/coverphoto/800/400"
          alt="封面"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
      </div>

      {/* Profile info area */}
      <div className="relative px-4 pb-4 bg-gradient-to-b from-[#F8F4F0] to-white">
        {/* Avatar + Name row */}
        <div className="flex items-end gap-4 -mt-12 mb-2">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden border-[3px] border-white shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://picsum.photos/seed/myavatar/200/200"
                alt="头像"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Yellow plus button */}
            <div className="absolute -bottom-0.5 right-0 w-5 h-5 rounded-full bg-[#FFD700] border-2 border-white flex items-center justify-center">
              <Plus size={10} className="text-white" strokeWidth={3} />
            </div>
          </div>
          <div className="pb-2 flex-1 min-w-0">
            <h1 className="text-[20px] font-bold text-xhs-text leading-tight">Tutuphus 🐰</h1>
            <div className="flex items-center gap-3 text-[11px] text-xhs-secondary mt-1">
              <span className="flex items-center gap-0.5">
                小红书号：123456789
                <Copy size={9} className="text-xhs-secondary" />
              </span>
              <span className="flex items-center gap-0.5">
                IP属地：上海
                <Info size={9} className="text-xhs-secondary" />
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-[13px] text-xhs-text mb-3 leading-relaxed">
          目标：努力工作赚钱，去读心理学二硕 🌈
        </p>

        {/* Tags - semi-transparent */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {['♀ 25 岁', '英国英格兰', '帝国理工学院'].map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full text-[11px] text-[#999] bg-black/[0.04]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stats + Edit button */}
        <div className="flex items-center justify-between mb-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <span className="text-[15px] font-bold text-xhs-text">1516</span>
              <span className="text-[11px] text-xhs-secondary ml-0.5">关注</span>
            </div>
            <div className="text-center">
              <span className="text-[15px] font-bold text-xhs-text">330</span>
              <span className="text-[11px] text-xhs-secondary ml-0.5">粉丝</span>
            </div>
            <div className="text-center">
              <span className="text-[15px] font-bold text-xhs-text">856</span>
              <span className="text-[11px] text-xhs-secondary ml-0.5">获赞与收藏</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <button className="px-3 py-1.5 rounded-full border border-[#E0E0E0] text-[12px] text-xhs-text font-medium">
              编辑资料
            </button>
            <button className="w-8 h-8 rounded-full border border-[#E0E0E0] flex items-center justify-center">
              <Settings size={14} className="text-xhs-text" />
            </button>
          </div>
        </div>

        {/* Quick action cards - horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-1">
          {[
            { icon: '💡', title: '创作灵感', subtitle: '学创作找灵感' },
            { icon: '🎬', title: 'RED创作大赛', subtitle: '为新生代好作品助力' },
            { icon: '🕐', title: '浏览记录', subtitle: '看过的笔记' },
          ].map((card) => (
            <button
              key={card.title}
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#F7F7F7] min-w-[150px]"
            >
              <span className="text-lg">{card.icon}</span>
              <div className="text-left">
                <p className="text-[12px] font-medium text-xhs-text leading-tight">{card.title}</p>
                <p className="text-[10px] text-xhs-secondary leading-tight mt-0.5">{card.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PrimaryTabs() {
  const tabs = [
    { label: '笔记', active: false, locked: false },
    { label: '评论', active: false, locked: true },
    { label: '收藏', active: true, locked: false },
    { label: '赞过', active: false, locked: true },
  ];

  return (
    <div className="sticky top-0 z-20 bg-white flex items-center px-4 border-b border-xhs-divider">
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

function SecondaryTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const tabs = [
    { label: '📮 动态', count: null },
    { label: '📚 知识库', count: null },
    { label: '笔记', count: 286 },
    { label: '收藏', count: 286 },
    { label: '赞过', count: 102 },
  ];

  return (
    <div className="flex items-center gap-4 px-4 py-2.5 overflow-x-auto hide-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          onClick={() => onTabChange(tab.label)}
          className={`whitespace-nowrap text-[13px] ${
            activeTab === tab.label
              ? 'text-xhs-text font-bold'
              : 'text-xhs-secondary'
          }`}
        >
          {tab.label}
          {tab.count !== null && <span className="text-[11px] text-[#999] font-normal ml-1">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}

// ---- Mock data for Comments, Topics, Files tabs ----

interface SavedComment {
  id: string;
  userName: string;
  userAvatar: string;
  postTitle: string;
  content: string;
  savedTime: string;
}

const mockSavedComments: SavedComment[] = [
  {
    id: 'comment-1',
    userName: '爱吃的小花',
    userAvatar: 'https://picsum.photos/seed/user1/100/100',
    postTitle: '成都火锅推荐',
    content: '一定要试试他家的毛肚！鲜切的，涮8秒口感最好，蘸油碟绝了',
    savedTime: '2天前',
  },
  {
    id: 'comment-2',
    userName: '穿搭日记',
    userAvatar: 'https://picsum.photos/seed/user2/100/100',
    postTitle: '小个子穿搭',
    content: '155cm 亲测！高腰线真的是显高第一法则，裤子选九分的最好',
    savedTime: '5天前',
  },
  {
    id: 'comment-3',
    userName: '旅行达人Leo',
    userAvatar: 'https://picsum.photos/seed/user3/100/100',
    postTitle: '大理攻略',
    content: '双廊比大理古城安静很多，建议住两晚，租电动车环洱海',
    savedTime: '1周前',
  },
  {
    id: 'comment-4',
    userName: '护肤课代表',
    userAvatar: 'https://picsum.photos/seed/user4/100/100',
    postTitle: '敏感肌护肤',
    content: '这个修复霜我用了一个月，泛红真的好了很多，敏感肌放心入',
    savedTime: '1周前',
  },
  {
    id: 'comment-5',
    userName: '健身小白',
    userAvatar: 'https://picsum.photos/seed/user5/100/100',
    postTitle: '居家健身',
    content: '跟着练了两周，腰围真的小了2cm！关键是不用器械在家就能做',
    savedTime: '2周前',
  },
  {
    id: 'comment-6',
    userName: '装修避坑',
    userAvatar: 'https://picsum.photos/seed/user6/100/100',
    postTitle: '小户型装修',
    content: '厨房台面一定要选石英石，不要岩板！用了半年就裂了',
    savedTime: '3周前',
  },
];

interface SavedTopic {
  id: string;
  name: string;
  noteCount: string;
  viewCount: string;
  reason: string;
}

const mockSavedTopics: SavedTopic[] = [
  {
    id: 'topic-1',
    name: '#成都美食探店',
    noteCount: '1.2万篇笔记',
    viewCount: '365万浏览',
    reason: '准备去成都旅行，想集中看美食推荐',
  },
];

interface SavedFile {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'xlsx';
  source: string;
  savedTime: string;
}

const mockSavedFiles: SavedFile[] = [
  {
    id: 'file-1',
    fileName: '2025春夏流行色报告.pdf',
    fileType: 'pdf',
    source: '时尚博主分享',
    savedTime: '3个月前',
  },
  {
    id: 'file-2',
    fileName: '居家收纳整理清单.xlsx',
    fileType: 'xlsx',
    source: '收纳达人',
    savedTime: '1个月前',
  },
];

// ---- Tab Content Components ----

function SavedCommentsTab() {
  return (
    <div className="px-3 py-3 space-y-3">
      {mockSavedComments.map((comment) => (
        <div key={comment.id} className="bg-white rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={comment.userAvatar}
              alt={comment.userName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#333]">{comment.userName}</p>
              <p className="text-[11px] text-[#999]">评论于「{comment.postTitle}」</p>
            </div>
            <span className="text-[11px] text-[#CCC] flex-shrink-0">{comment.savedTime}</span>
          </div>
          <div className="bg-[#F8F8F8] rounded-lg px-3 py-2.5">
            <div className="flex items-start gap-1.5">
              <MessageCircle size={13} className="text-[#FF2442] mt-0.5 flex-shrink-0" />
              <p className="text-[13px] text-[#555] leading-relaxed">{comment.content}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SavedTopicsTab() {
  return (
    <div className="px-3 py-3 space-y-3">
      {mockSavedTopics.map((topic) => (
        <div key={topic.id} className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF2442] to-[#FF6634] flex items-center justify-center">
              <Hash size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#333]">{topic.name}</p>
              <p className="text-[12px] text-[#999]">{topic.noteCount} · {topic.viewCount}</p>
            </div>
          </div>
          <div className="bg-[#FFF8F5] rounded-lg px-3 py-2.5 border border-[#FFE8E0]">
            <p className="text-[12px] text-[#888] leading-relaxed">
              <span className="text-[#FF2442] font-medium">收藏原因：</span>{topic.reason}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SavedFilesTab() {
  const getFileIcon = (type: 'pdf' | 'xlsx') => {
    if (type === 'pdf') {
      return (
        <div className="w-10 h-12 rounded-lg bg-[#FF4444] flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">PDF</span>
        </div>
      );
    }
    return (
      <div className="w-10 h-12 rounded-lg bg-[#21A366] flex items-center justify-center">
        <span className="text-white text-[10px] font-bold">XLS</span>
      </div>
    );
  };

  return (
    <div className="px-3 py-3 space-y-3">
      {mockSavedFiles.map((file) => (
        <div key={file.id} className="bg-white rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center gap-3">
            {getFileIcon(file.fileType)}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#333] truncate">{file.fileName}</p>
              <div className="flex items-center gap-1 mt-1">
                <FileText size={11} className="text-[#999]" />
                <span className="text-[11px] text-[#999]">来源：{file.source}</span>
              </div>
              <p className="text-[11px] text-[#CCC] mt-0.5">收藏于 {file.savedTime}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Manager Tab (收藏社交 + 体检 + 时光轴 + 消息) ----

function TasteMatchSection() {
  return (
    <div>
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-[14px] font-semibold text-[#333]">{'\uD83E\uDD1D'} 品味相似的人</h3>
        <span className="text-[11px] text-[#999]">基于你的收藏分析</span>
      </div>
      <div className="flex gap-2.5 overflow-x-auto hide-scrollbar -mx-3 px-3 pb-1">
        {mockTasteMatches.map((match, i) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex-shrink-0 w-[72%] bg-white rounded-2xl p-3.5 shadow-sm border border-gray-50"
          >
            {/* User info row */}
            <div className="flex items-center gap-2.5 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={match.avatar} alt={match.name} className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#333] truncate">{match.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {match.sharedInterests.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-[10px] text-[#FF2442] bg-[#FFF0F0] px-1.5 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
              {/* Match ring */}
              <div className="flex-shrink-0 relative w-11 h-11">
                <svg width="44" height="44" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="#F0F0F0" strokeWidth="3" />
                  <motion.circle
                    cx="22" cy="22" r="18" fill="none" stroke="#FF2442" strokeWidth="3"
                    strokeDasharray={`${match.matchPercent * 1.13} 113`}
                    strokeLinecap="round" transform="rotate(-90 22 22)"
                    initial={{ strokeDasharray: '0 113' }}
                    animate={{ strokeDasharray: `${match.matchPercent * 1.13} 113` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#FF2442]">
                  {match.matchPercent}%
                </span>
              </div>
            </div>
            {/* Collection preview */}
            <div className="bg-[#F8F8F8] rounded-xl p-2.5">
              <p className="text-[12px] font-medium text-[#555] mb-2">{'\uD83D\uDCDA'} {match.collectionTitle}</p>
              <div className="flex gap-1.5">
                {match.collectionPreview.map((url, j) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={j} src={url} alt="" className="w-14 h-14 rounded-lg object-cover" />
                ))}
                <div className="w-14 h-14 rounded-lg bg-[#EEEEEE] flex items-center justify-center">
                  <span className="text-[11px] text-[#999]">+{match.collectionCount - 3}</span>
                </div>
              </div>
            </div>
            <button className="w-full mt-2.5 py-2 rounded-full text-[12px] font-medium text-[#FF2442] bg-[#FFF0F0] border border-[#FFE0E0]">
              查看 TA 的收藏
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function HealthReportSection() {
  const score = 78;
  const metrics = [
    { label: '活跃度', value: 65, desc: '近30天使用分类', color: '#2ED573' },
    { label: '沉睡率', value: 62, desc: '超6个月未看', color: '#FFA502', warn: true },
    { label: '过期率', value: 5, desc: '已过期内容', color: '#FF4757' },
    { label: '多样性', value: 8, desc: '个兴趣领域', color: '#4A90D9', isCount: true },
  ];
  const circumference = 2 * Math.PI * 40;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <h3 className="text-[14px] font-semibold text-[#333] mb-3">{'\uD83D\uDC8A'} 收藏体检报告</h3>
      <div className="flex items-center gap-4">
        {/* Score ring */}
        <div className="relative flex-shrink-0 w-[90px] h-[90px]">
          <svg width="90" height="90" viewBox="0 0 90 90">
            <circle cx="45" cy="45" r="40" fill="none" stroke="#F0F0F0" strokeWidth="6" />
            <motion.circle
              cx="45" cy="45" r="40" fill="none" strokeWidth="6" strokeLinecap="round"
              stroke={score >= 80 ? '#2ED573' : score >= 60 ? '#FFA502' : '#FF4757'}
              strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
              transform="rotate(-90 45 45)"
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${(score / 100) * circumference} ${circumference}` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[22px] font-bold text-[#333]">{score}</span>
            <span className="text-[9px] text-[#999]">健康分</span>
          </div>
        </div>
        {/* Metrics */}
        <div className="flex-1 space-y-2">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-center gap-2">
              <span className="text-[11px] text-[#666] w-[42px] flex-shrink-0">{m.label}</span>
              {m.isCount ? (
                <span className="text-[12px] font-semibold" style={{ color: m.color }}>{m.value} {m.desc}</span>
              ) : (
                <>
                  <div className="flex-1 h-[6px] bg-[#F0F0F0] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: m.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${m.value}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    />
                  </div>
                  <span className="text-[11px] font-medium w-[32px] text-right" style={{ color: m.color }}>{m.value}%</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-[#888] mt-3 bg-[#FFF8F0] rounded-lg px-3 py-2">
        {'\u2728'} 收藏夹整体健康，但有 <span className="font-medium text-[#FFA502]">62%</span> 内容超过半年没看过哦～薯管家会在合适的时刻帮你唤醒它们
      </p>
    </div>
  );
}

function TimelineSection() {
  // Build timeline from mockNotes, tracking interest emergence
  const monthMap = new Map<string, { notes: typeof mockNotes }>();
  for (const note of mockNotes) {
    const date = new Date(note.collectTime);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const entry = monthMap.get(key) || { notes: [] };
    entry.notes.push(note);
    monthMap.set(key, entry);
  }

  const sorted = Array.from(monthMap.entries()).sort(([a], [b]) => a.localeCompare(b));
  const seenInterests = new Set<string>();

  // Generate narrative events per month
  interface TimelineEvent {
    key: string;
    label: string;
    emoji: string;
    color: string;
    narrative: string;
    detail: string;
    isFirst: boolean;
  }

  const catMeta: Record<string, { emoji: string; color: string }> = {
    '成都美食': { emoji: '\uD83C\uDF36\uFE0F', color: '#FF4757' },
    '旅行攻略': { emoji: '\u2708\uFE0F', color: '#4A90D9' },
    '穿搭灵感': { emoji: '\uD83D\uDC57', color: '#FF6B81' },
    '护肤美妆': { emoji: '\u2728', color: '#7C5CFC' },
    '居家装修': { emoji: '\uD83C\uDFE0', color: '#2ED573' },
    '健身运动': { emoji: '\uD83C\uDFCB\uFE0F', color: '#FF6348' },
    '学习成长': { emoji: '\uD83D\uDCDA', color: '#1E90FF' },
    '美食食谱': { emoji: '\uD83C\uDF73', color: '#FF8C00' },
  };

  const events: TimelineEvent[] = [];

  sorted.forEach(([key, data], monthIdx) => {
    const [y, m] = key.split('-');
    const label = `${y}年${parseInt(m)}月`;
    // Count categories this month
    const catCounts = new Map<string, number>();
    for (const note of data.notes) {
      const cat = note.tags?.[0] || '其他';
      catCounts.set(cat, (catCounts.get(cat) || 0) + 1);
    }
    const topCat = Array.from(catCounts.entries()).sort(([, a], [, b]) => b - a)[0];
    if (!topCat) return;

    const [catName, catCount] = topCat;
    const meta = catMeta[catName] || { emoji: '\uD83D\uDCCC', color: '#999' };
    const isNewInterest = !seenInterests.has(catName);
    seenInterests.add(catName);
    // Also track all categories
    for (const [c] of catCounts) seenInterests.add(c);

    // Build a human narrative
    let narrative: string;
    let detail: string;
    const topNote = data.notes.sort((a, b) => b.likeCount - a.likeCount)[0];

    if (monthIdx === 0) {
      narrative = `开始了你的收藏之旅`;
      detail = `第一篇收藏是「${topNote.title.slice(0, 18)}...」`;
    } else if (isNewInterest) {
      narrative = `解锁了新兴趣：${catName}`;
      detail = `「${topNote.title.slice(0, 20)}...」让你种草了`;
    } else if (catCount >= 5) {
      narrative = `疯狂迷上了${catName}`;
      detail = `一口气收藏了 ${catCount} 篇，最爱「${topNote.title.slice(0, 15)}...」`;
    } else if (catCount >= 3) {
      narrative = `${catName}的热情持续升温`;
      detail = `又收了 ${catCount} 篇好内容`;
    } else {
      // Check for secondary new interests
      const newOnes = Array.from(catCounts.keys()).filter((c) => {
        const wasNew = !events.some((e) => e.narrative.includes(c));
        return wasNew && c !== catName;
      });
      if (newOnes.length > 0) {
        narrative = `悄悄关注起了${newOnes[0]}`;
        detail = `从「${topNote.title.slice(0, 20)}...」开始`;
      } else {
        narrative = `继续探索${catName}的世界`;
        detail = `收藏了「${topNote.title.slice(0, 20)}...」`;
      }
    }

    events.push({
      key, label, emoji: meta.emoji, color: meta.color,
      narrative, detail, isFirst: monthIdx === 0,
    });
  });

  // Show newest first
  const reversed = events.reverse();

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <h3 className="text-[14px] font-semibold text-[#333] mb-1">{'\uD83C\uDF31'} 我的兴趣成长</h3>
      <p className="text-[11px] text-[#999] mb-3">你的收藏记录了每一次心动</p>
      <div className="relative pl-5">
        <div className="absolute left-[7px] top-1 bottom-1 w-[2px] bg-[#F0F0F0]" />
        {reversed.map((ev, i) => (
          <motion.div
            key={ev.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative pb-4 last:pb-0"
          >
            <div
              className="absolute -left-5 top-[3px] w-[14px] h-[14px] rounded-full border-2 border-white shadow-sm flex items-center justify-center text-[8px]"
              style={{ backgroundColor: ev.color }}
            />
            <div className="flex items-baseline gap-1.5 mb-0.5">
              <span className="text-[11px] text-[#999]">{ev.label}</span>
            </div>
            <p className="text-[13px] text-[#333] font-medium leading-snug">
              {ev.emoji} {ev.narrative}
            </p>
            <p className="text-[11px] text-[#888] mt-0.5 leading-relaxed">{ev.detail}</p>
            {ev.isFirst && (
              <p className="text-[10px] text-[#FF2442] mt-1 font-medium">{'\u2764\uFE0F'} 你的第一次收藏</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ManagerTab() {
  return (
    <div className="px-3 py-3 space-y-3">
      {/* 1. 薯管家消息 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 pt-3 pb-1">
          <h3 className="text-[14px] font-semibold text-[#333]">{'\uD83D\uDCEC'} 薯管家消息</h3>
        </div>
        {mockMessages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="px-4 py-2.5 border-b border-[#F5F5F5] last:border-b-0"
          >
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-[16px] flex-shrink-0">{msg.icon}</span>
              <span className="text-[13px] font-medium text-[#333] flex-1 truncate">{msg.title}</span>
              <span className="text-[10px] text-[#CCC] flex-shrink-0">{msg.time}</span>
            </div>
            <p className="text-[11px] text-[#888] leading-[1.5] ml-[30px]">{msg.content}</p>
          </motion.div>
        ))}
      </div>

      {/* 2. 收藏社交 — 品味匹配 */}
      <TasteMatchSection />

      {/* 3. 收藏体检报告 */}
      <HealthReportSection />

      {/* 4. 收藏足迹时光轴 */}
      <TimelineSection />
    </div>
  );
}

// ---- Note Detail Modal ----

function CollectModal({ note, onClose }: { note: Note; onClose: () => void }) {
  const suggestions = React.useMemo(() => getAlbumSuggestions(note), [note]);

  const [selected, setSelected] = useState<Set<string>>(() => {
    // Auto-select the top recommendation
    const top = suggestions[0];
    return top ? new Set([top.id]) : new Set();
  });
  const [collected, setCollected] = useState<string[] | null>(null);

  const toggleAlbum = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    const names = suggestions
      .filter((a) => selected.has(a.id))
      .map((a) => a.name);
    if (names.length === 0) names.push('未分类');
    setCollected(names);
    setTimeout(onClose, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[60] bg-black/40 flex flex-col justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white rounded-t-2xl max-h-[60%] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#DDD]" />
        </div>

        <AnimatePresence mode="wait">
          {collected ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="w-14 h-14 rounded-full bg-[#2ED573] flex items-center justify-center mb-3"
              >
                <span className="text-white text-[24px]">{'\u2713'}</span>
              </motion.div>
              <p className="text-[14px] font-medium text-[#333]">
                已收藏到{collected.length === 1
                  ? `「${collected[0]}」`
                  : ` ${collected.length} 个专辑`}
              </p>
              {collected.length > 1 && (
                <p className="text-[11px] text-[#999] mt-1">
                  {collected.map((n) => `「${n}」`).join('、')}
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div key="list" exit={{ opacity: 0 }}>
              <div className="px-4 pt-2 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#FF2442]" />
                  <span className="text-[15px] font-semibold text-[#333]">AI 建议收藏到...</span>
                  <span className="text-[11px] text-[#999] ml-auto">可多选</span>
                </div>
                <p className="text-[11px] text-[#999] mt-1 ml-6">
                  根据「{note.title.slice(0, 15)}...」的内容分析
                </p>
              </div>

              <div className="px-4 pb-2 space-y-1.5">
                {suggestions.map((album, idx) => {
                  const isSelected = selected.has(album.id);
                  return (
                    <motion.button
                      key={album.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      onClick={() => toggleAlbum(album.id)}
                      className={`w-full text-left rounded-xl p-3 border transition-colors ${
                        isSelected
                          ? 'bg-[#FFF5F5] border-[#FF2442]'
                          : 'bg-[#FAFAFA] border-[#F0F0F0] hover:bg-[#F5F5F5]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {/* Checkbox */}
                        <div className={`w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected ? 'bg-[#FF2442] border-[#FF2442]' : 'border-[#DDD] bg-white'
                        }`}>
                          {isSelected && <span className="text-white text-[11px] font-bold">{'\u2713'}</span>}
                        </div>
                        <span className="text-[20px]">{album.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium text-[#333]">
                              {album.isNew ? `+ 新建「${album.name}」` : album.name}
                            </span>
                            {idx === 0 && (
                              <span className="text-[9px] text-white bg-[#FF2442] px-1.5 py-0.5 rounded-full font-medium">推荐</span>
                            )}
                            {!album.isNew && (
                              <span className="text-[10px] text-[#CCC] ml-auto">{album.noteCount} 篇</span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#999] mt-0.5">{album.aiReason}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-[11px] font-medium" style={{ color: album.matchScore >= 90 ? '#FF2442' : album.matchScore >= 70 ? '#FFA502' : '#999' }}>
                            {album.matchScore}%
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div className="px-4 pb-6 pt-2 space-y-2">
                <button
                  onClick={handleConfirm}
                  className="w-full py-2.5 rounded-xl text-white text-[14px] font-medium shadow-sm"
                  style={{
                    background: selected.size > 0
                      ? 'linear-gradient(135deg, #FF2442 0%, #FF6634 100%)'
                      : '#DDD',
                  }}
                >
                  {selected.size > 0 ? `收藏到 ${selected.size} 个专辑` : '请选择专辑'}
                </button>
                <button
                  onClick={() => { setSelected(new Set()); handleConfirm(); }}
                  className="w-full text-center py-2 text-[12px] text-[#999]"
                >
                  直接收藏（不归类）
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function NoteDetailModal({ note, onClose, isCollected, onCollect }: { note: Note; onClose: () => void; isCollected?: boolean; onCollect?: (note: Note) => void }) {
  const [showCollect, setShowCollect] = useState(false);
  const [justCollected, setJustCollected] = useState(false);
  const formatCount = (count: number) => {
    if (count >= 10000) return (count / 10000).toFixed(1) + 'w';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
    return count.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-black/40 flex flex-col justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white rounded-t-2xl max-h-[85%] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-2 pb-1 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="w-10 h-1 rounded-full bg-[#DDD]" />
        </div>

        {/* Cover image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={note.coverUrl} alt={note.title} className="w-full" />

        {/* Content */}
        <div className="px-4 py-3">
          {/* Title */}
          <h2 className="text-[16px] font-semibold text-[#333] leading-[1.4]">{note.title}</h2>

          {/* Author */}
          <div className="flex items-center gap-2 mt-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={note.author.avatarUrl} alt={note.author.name} className="w-8 h-8 rounded-full" />
            <span className="text-[13px] text-[#333] font-medium">{note.author.name}</span>
            <span className="ml-auto text-[12px] text-[#999]">{note.collectTime?.slice(0, 10)}</span>
          </div>

          {/* Body */}
          {note.content && (
            <p className="text-[14px] text-[#555] leading-[1.8] mt-3">{note.content}</p>
          )}

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {note.tags.map((tag, i) => (
                <span key={i} className="text-[12px] text-[#4A90D9]">#{tag}</span>
              ))}
            </div>
          )}

          {/* AI Tags */}
          {note.aiTags && note.aiTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {note.aiTags.map((tag, i) => (
                <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full ${getAiTagStyle(tag)}`}>{tag}</span>
              ))}
            </div>
          )}

          {/* Expired badge */}
          {note.isExpired && (
            <div className="mt-3 bg-[#FFF8F0] border border-[#FFE0B2] rounded-lg px-3 py-2 flex items-start gap-2">
              <span className="text-[14px]">{'\u26A0\uFE0F'}</span>
              <div>
                <span className="text-[12px] text-[#FF8C00] font-medium">可能已过期</span>
                {note.expiredReason && <p className="text-[11px] text-[#999] mt-0.5">{note.expiredReason}</p>}
              </div>
            </div>
          )}

          {/* Stats bar + Collect button */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#F0F0F0]">
            <div className="flex items-center gap-1">
              <Heart size={16} className="text-[#FF2442]" />
              <span className="text-[13px] text-[#666]">{formatCount(note.likeCount)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle size={16} className="text-[#999]" />
              <span className="text-[13px] text-[#666]">{formatCount(Math.floor(note.likeCount * 0.12))}</span>
            </div>
            {(isCollected || justCollected) ? (
              <span className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-medium text-white bg-[#ccc]">
                <Heart size={13} />
                <span>已收藏</span>
              </span>
            ) : (
              <button
                onClick={() => setShowCollect(true)}
                className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-medium text-white shadow-sm"
                style={{ background: 'linear-gradient(135deg, #FF2442 0%, #FF6634 100%)' }}
              >
                <Sparkles size={13} />
                <span>收藏</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom safe area */}
        <div className="h-6" />
      </motion.div>

      {/* AI Collect Modal */}
      <AnimatePresence>
        {showCollect && (
          <CollectModal note={note} onClose={() => { setShowCollect(false); setJustCollected(true); if (onCollect) onCollect(note); }} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---- Note Cards (waterfall grid) ----

// ---- Feed View (首页双瀑布流) ----

function FeedView({ onNoteTap, collectedIds }: { onNoteTap: (note: Note) => void; collectedIds: Set<string> }) {
  const [activeFeedTab, setActiveFeedTab] = useState('推荐');
  const feedTabs = ['关注', '推荐', '附近'];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Top bar */}
      <div className="flex items-center px-3 pt-2 pb-1 gap-2">
        <div className="flex items-center gap-4 flex-1 justify-center">
          {feedTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFeedTab(tab)}
              className={`text-[16px] pb-1 ${
                activeFeedTab === tab
                  ? 'text-[#333] font-bold border-b-2 border-xhs-red'
                  : 'text-[#999]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <Search size={20} className="text-[#333]" />
      </div>

      {/* Feed grid */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <div className="masonry-grid mt-2">
          {mockFeedNotes.map((note) => (
            <div key={note.id} className="masonry-item relative">
              <NoteCard note={note} onTap={onNoteTap} />
              {collectedIds.has(note.id) && (
                <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-0.5 flex items-center gap-1 shadow-sm">
                  <Heart size={10} className="text-xhs-red fill-xhs-red" />
                  <span className="text-[10px] text-xhs-red font-medium">已收藏</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NoteCard({ note, onTap }: { note: Note; onTap: (note: Note) => void }) {
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
    <div className="masonry-item cursor-pointer" onClick={() => onTap(note)}>
      <div className="bg-white rounded-md overflow-hidden">
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
        <div className="px-2 pt-2">
          <p className="text-[13px] text-xhs-text leading-[1.4] line-clamp-2">
            {note.title}
          </p>
        </div>
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

function NoteGrid({ notes, onNoteTap }: { notes: Note[]; onNoteTap: (note: Note) => void }) {
  return (
    <div className="masonry-grid px-2 pt-1 pb-4">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} onTap={onNoteTap} />
      ))}
    </div>
  );
}

// ---- Category Cards (organized view) ----

function CategoryCard({
  category,
  index,
}: {
  category: Category;
  index: number;
}) {
  const coverUrls = (category.coverUrls || []).slice(0, 4);
  while (coverUrls.length < 4) {
    coverUrls.push(coverUrls[0] || 'https://picsum.photos/seed/placeholder/400/400');
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

// ---- Welcome Card (integrated mascot + dialog) ----

const greetingVariants = [
  '嗨～今天想找点什么？',
  '来啦！有什么我能帮你的？',
  '你好呀～收藏夹交给我就行 ✨',
  '嘿！我是你的薯管家～',
];

const contextVariants = [
  { text: '你有 {hl}23 篇美食笔记{/hl} 集中在成都哦，要帮你整理一下吗？' },
  { text: '上个月你收藏了 {hl}8 篇穿搭灵感{/hl}，要帮你归类吗？' },
  { text: '发现 {hl}6 条收藏可能过期了{/hl}，要帮你检查一下吗？' },
  { text: '你最爱收藏 {hl}旅行攻略{/hl}，已经攒了 15 篇了！要整理吗？' },
];

function WelcomeCard({
  showGreeting,
  showContext,
  showInput,
  onDismiss,
  onOrganize,
  onMascotClick,
  onDirectMessage,
}: {
  showGreeting: boolean;
  showContext: boolean;
  showInput: boolean;
  onDismiss: () => void;
  onOrganize: () => void;
  onMascotClick: () => void;
  onDirectMessage: (text: string) => void;
}) {
  const [directInput, setDirectInput] = useState('');
  const [greetingMsg] = useState(() => greetingVariants[Math.floor(Math.random() * greetingVariants.length)]);
  const [contextMsg] = useState(() => contextVariants[Math.floor(Math.random() * contextVariants.length)]);

  const handleDirectSend = () => {
    const text = directInput.trim();
    if (!text) return;
    setDirectInput('');
    onDirectMessage(text);
  };

  const renderContextText = (template: string) => {
    const parts = template.split(/\{hl\}|\{\/hl\}/);
    return parts.map((part, i) =>
      i % 2 === 1
        ? <span key={i} className="font-semibold text-[#FF2442]">{part}</span>
        : <React.Fragment key={i}>{part}</React.Fragment>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative mx-4 my-2 rounded-2xl overflow-hidden"
      style={{ height: '200px' }}
    >
      {/* Background SVG - full bleed */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="absolute inset-0 z-0"
        onClick={onMascotClick}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mascot-bg.svg"
          alt=""
          className="w-full h-full object-cover pointer-events-none"
        />
      </div>

      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-white/70 flex items-center justify-center z-20 hover:bg-white"
      >
        <X size={10} className="text-gray-400" />
      </button>

      {/* Stacked speech bubbles on the left */}
      <div className="absolute inset-0 z-10 flex flex-col gap-1.5 max-w-[58%] py-3 pl-4 overflow-y-auto hide-scrollbar">
        <AnimatePresence>
          {showGreeting && (
            <motion.div
              key="greeting"
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="rounded-xl px-3 py-2.5"
              style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
            >
              <p className="text-[13px] text-[#333333] leading-snug font-medium">
                {greetingMsg}
              </p>
            </motion.div>
          )}

          {showContext && (
            <motion.div
              key="context"
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="rounded-xl px-3 py-2.5"
              style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
            >
              <p className="text-[12px] text-[#333333] leading-snug mb-2">
                {renderContextText(contextMsg.text)}
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); onOrganize(); }}
                className="px-3.5 py-1 rounded-full text-white text-[11px] font-medium shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #FF2442 0%, #FF6634 100%)',
                }}
              >
                帮我整理
              </button>
            </motion.div>
          )}

          {showInput && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="rounded-xl px-3 py-2.5"
              style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
            >
              <p className="text-[11px] text-[#999999] mb-1.5">
                或者直接告诉我你想做什么 👇
              </p>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={directInput}
                  onChange={(e) => setDirectInput(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') handleDirectSend(); }}
                  placeholder="告诉薯管家你想做什么..."
                  className="flex-1 text-[12px] text-[#333333] bg-[#F5F5F5] rounded-full px-3 py-1.5 outline-none placeholder:text-[#CCCCCC] min-w-0"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); handleDirectSend(); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #FF2442 0%, #FF6634 100%)',
                  }}
                >
                  <Send size={13} className="text-white" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ---- Chat Types ----

interface MatchedNote {
  id: string;
  title: string;
  coverUrl: string;
  author: string;
  likeCount: number;
  type: 'image' | 'video';
  isExpired?: boolean;
  expiredReason?: string;
}

interface ToolUseInfo {
  name: string;
  input: Record<string, string>;
  result: string;
  matchedNotes?: MatchedNote[];
}

interface ChainStep {
  node: 'intent' | 'react' | 'report' | 'clarify' | 'plan' | 'search' | 'editor';
  result: {
    intent?: string;
    reasoning?: string;
    toolUsed?: string | null;
    toolInput?: Record<string, string> | null;
    toolResult?: string | null;
    reply?: string;
    direct?: boolean;
    deep?: boolean;
    summary?: string;
    plan?: string;
    findings?: string;
  };
}

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
  toolUse?: ToolUseInfo;
  chain?: ChainStep[];
  organizeAction?: boolean;
  organizeProcessing?: boolean;
  organizeDone?: boolean;
  expiredAction?: boolean;
  expiredProcessing?: boolean;
  expiredDone?: boolean;
  expiredNoteIds?: string[];
}

// ---- Inline Chat View ----

function InlineChatView({
  messages,
  isLoading,
  onSend,
  onClose,
  onNoteTap,
  onOrganize,
  onViewOrganizeResult,
  allNotes,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
  onNoteTap?: (noteId: string) => void;
  onOrganize?: () => void;
  onViewOrganizeResult?: () => void;
  allNotes?: typeof mockNotes;
}) {
  const [inputValue, setInputValue] = useState('');
  const [expandedTools, setExpandedTools] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    setInputValue('');
    onSend(text);
  };

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      {/* Compact mascot header - fixed at top of chat view */}
      <div className="sticky top-0 z-30 flex-shrink-0" style={{ height: '120px' }}>
        <div className="relative w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot-bg.svg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Back button */}
          <button
            onClick={onClose}
            className="absolute top-3 left-3 w-7 h-7 rounded-full bg-white/70 flex items-center justify-center z-10 hover:bg-white"
          >
            <X size={14} className="text-gray-500" />
          </button>
          {/* Title overlay */}
          <div className="absolute bottom-3 left-4 z-10 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mascot.jpg" alt="薯管家" className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm" />
            <span className="text-[14px] font-semibold text-white drop-shadow-sm">薯管家 · 收藏助手</span>
          </div>
        </div>
      </div>

      {/* Chat messages area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        style={{ background: '#FFF8E7' }}
      >
        {messages.map((msg, i) =>
          msg.role === 'assistant' ? (
            <div key={i} className="flex items-start gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mascot.jpg" alt="薯管家" className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5" />
              <div className="max-w-[80%]">
                {/* Chain steps indicator */}
                {msg.chain && msg.chain.length > 0 && (() => {
                  // Check if this is a direct reply (chat intent, no react/report steps shown during streaming)
                  const isDirectReply = msg.chain.some((s) => s.node === 'report' && s.result?.direct);
                  const hasNonChatIntent = msg.chain.some((s) => s.node === 'intent' && s.result?.intent && s.result.intent !== 'chat');
                  // For direct replies, only show a single compact indicator
                  if (isDirectReply || (!hasNonChatIntent && msg.content)) {
                    return (
                      <div className="mb-1.5">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0F0F0] w-fit">
                          <div className="w-1 h-1 rounded-full bg-green-400" />
                          <span className="text-[10px] text-[#888] font-medium">💬 直接回复</span>
                        </div>
                      </div>
                    );
                  }
                  // Full chain display for ReAct / Deep Research
                  return (
                    <div className="mb-1.5 space-y-0.5">
                      {msg.chain.map((step, si) => {
                        const intentLabel = (() => {
                          const r = step.result;
                          if (step.node === 'intent') {
                            const intentMap: Record<string, string> = {
                              organize: '整理收藏夹',
                              search: '搜索收藏',
                              summarize: '总结分类',
                              deep_research: '深度分析',
                              chat: '对话交流',
                            };
                            return `🔍 意图识别: ${intentMap[r.intent || 'chat'] || r.intent}`;
                          }
                          if (step.node === 'clarify') return '🔎 分析收藏数据';
                          if (step.node === 'plan') return '📋 制定分析计划';
                          if (step.node === 'search') return '📖 深度检索收藏';
                          if (step.node === 'react') {
                            if (r.toolUsed) {
                              const toolMap: Record<string, string> = {
                                organize_favorites: '整理收藏夹',
                                search_favorites: '搜索收藏',
                                summarize_category: '总结分类',
                              };
                              return `⚙️ 执行工具: ${toolMap[r.toolUsed] || r.toolUsed}`;
                            }
                            return '⚙️ 推理分析中';
                          }
                          if (step.node === 'report') {
                            return r.deep ? '📝 生成深度报告' : '✍️ 生成回复';
                          }
                          if (step.node === 'editor') return '✏️ 质量润色';
                          return '';
                        })();
                        return (
                          <div
                            key={si}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0F0F0] w-fit"
                          >
                            <div className="w-1 h-1 rounded-full bg-green-400" />
                            <span className="text-[10px] text-[#888] font-medium">
                              {intentLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
                <div className="bg-white rounded-2xl rounded-tl-md px-3.5 py-2.5 shadow-sm">
                  {!msg.content && (!msg.chain || msg.chain.length === 0) && !msg.expiredProcessing && (
                    <div className="flex items-center gap-2">
                      <Loader2 size={14} className="text-[#FF2442] animate-spin" />
                      <span className="text-xs text-[#999999]">薯管家思考中...</span>
                    </div>
                  )}
                  {msg.expiredProcessing && !msg.expiredDone && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Loader2 size={14} className="text-[#FF2442] animate-spin" />
                        <span className="text-[13px] text-[#666]">正在扫描收藏内容时效性...</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#F5F5F5] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#FF2442] to-[#FF6B81] rounded-full animate-pulse" style={{ width: '70%' }} />
                      </div>
                    </div>
                  )}
                  {msg.content && (
                    <div className="text-[13px] text-[#333333] leading-relaxed whitespace-pre-line prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:my-2 prose-strong:text-[#333333]">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  )}
                  {msg.expiredDone && msg.expiredNoteIds && msg.expiredNoteIds.length > 0 && allNotes && (() => {
                    const notes = msg.expiredNoteIds!.map((id) => allNotes.find((n) => n.id === id)).filter(Boolean) as typeof allNotes;
                    const groups: Record<string, typeof allNotes> = {};
                    for (const note of notes) {
                      const reason = note.expiredReason || '其他';
                      let category = '其他';
                      if (/活动|促销|限时|双11|打折|满减/.test(reason)) category = '促销活动已结束';
                      else if (/停业|关闭|下架/.test(reason)) category = '店铺/商品已下架';
                      else if (/季节|趋势|过时|春夏|秋冬/.test(reason)) category = '时效性内容已过时';
                      else if (/春节|圣诞|节日/.test(reason)) category = '节日活动已结束';
                      if (!groups[category]) groups[category] = [];
                      groups[category].push(note);
                    }
                    const icons: Record<string, string> = { '促销活动已结束': '🏷️', '店铺/商品已下架': '🏪', '时效性内容已过时': '📅', '节日活动已结束': '🎉', '其他': '📌' };
                    return (
                      <div className="mt-2">
                        {Object.entries(groups).map(([cat, gNotes]) => (
                          <div key={cat} className="mb-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="text-[12px]">{icons[cat] || '📌'}</span>
                              <span className="text-[12px] font-medium text-[#333]">{cat}</span>
                              <span className="text-[10px] text-[#999]">({gNotes.length})</span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              {gNotes.map((note) => (
                                <div key={note.id} className="flex gap-2.5 bg-[#FFF8F5] rounded-lg p-2 cursor-pointer hover:bg-[#FFF0EA] transition-colors border border-[#FFE8DD]" onClick={() => onNoteTap?.(note.id)}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={note.coverUrl} alt={note.title} className="w-[56px] h-[56px] rounded-md object-cover flex-shrink-0" loading="lazy" />
                                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <p className="text-[12px] text-[#333] leading-tight line-clamp-2 font-medium">{note.title}</p>
                                    <p className="text-[10px] text-[#FF6B81] mt-1">{note.expiredReason || '已失效'}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        <div className="text-[12px] text-[#999] mt-2">建议清理这些内容，保持收藏夹新鲜度 ✨</div>
                      </div>
                    );
                  })()}
                  {msg.organizeAction && onOrganize && !msg.organizeProcessing && !msg.organizeDone && (
                    <button
                      onClick={onOrganize}
                      className="mt-3 w-full py-2.5 rounded-xl text-[14px] font-semibold text-white bg-gradient-to-r from-[#FF2442] to-[#FF6B81] active:scale-[0.98] transition-transform"
                    >
                      ✨ 开始整理收藏夹
                    </button>
                  )}
                  {msg.organizeProcessing && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Loader2 size={14} className="text-[#FF2442] animate-spin" />
                        <span className="text-[13px] text-[#666]">正在分析你的收藏内容...</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#F5F5F5] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#FF2442] to-[#FF6B81] rounded-full animate-pulse" style={{ width: '60%' }} />
                      </div>
                    </div>
                  )}
                  {msg.organizeDone && (
                    <div className="mt-3 space-y-2">
                      <div className="text-[13px] text-[#333]">✅ 整理完成！已将收藏自动归类到不同专辑</div>
                      <button
                        onClick={onViewOrganizeResult}
                        className="w-full py-2.5 rounded-xl text-[14px] font-semibold text-white bg-gradient-to-r from-[#FF2442] to-[#FF6B81] active:scale-[0.98] transition-transform"
                      >
                        📂 查看整理结果
                      </button>
                    </div>
                  )}
                  {msg.toolUse && (
                    <div className="mt-2">
                      {msg.toolUse.matchedNotes && msg.toolUse.matchedNotes.length > 0 ? (
                        <div>
                          {(() => {
                            const notes = msg.toolUse.matchedNotes!;
                            const hasExpired = notes.some((n) => n.isExpired);

                            // Group expired notes by reason category
                            if (hasExpired) {
                              const groups: Record<string, MatchedNote[]> = {};
                              for (const note of notes) {
                                const reason = note.expiredReason || '其他';
                                let category = '其他';
                                if (/活动|促销|限时|双11|打折|满减/.test(reason)) category = '促销活动已结束';
                                else if (/停业|关闭|下架/.test(reason)) category = '店铺/商品已下架';
                                else if (/季节|趋势|过时|春夏|秋冬/.test(reason)) category = '时效性内容已过时';
                                else if (/春节|圣诞|节日/.test(reason)) category = '节日活动已结束';
                                if (!groups[category]) groups[category] = [];
                                groups[category].push(note);
                              }
                              const categoryIcons: Record<string, string> = {
                                '促销活动已结束': '🏷️',
                                '店铺/商品已下架': '🏪',
                                '时效性内容已过时': '📅',
                                '节日活动已结束': '🎉',
                                '其他': '📌',
                              };
                              return Object.entries(groups).map(([category, groupNotes]) => (
                                <div key={category} className="mb-3">
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className="text-[12px]">{categoryIcons[category] || '📌'}</span>
                                    <span className="text-[12px] font-medium text-[#333]">{category}</span>
                                    <span className="text-[10px] text-[#999]">({groupNotes.length})</span>
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    {groupNotes.map((note) => (
                                      <div
                                        key={note.id}
                                        className="flex gap-2.5 bg-[#FFF8F5] rounded-lg p-2 cursor-pointer hover:bg-[#FFF0EA] transition-colors border border-[#FFE8DD]"
                                        onClick={() => onNoteTap?.(note.id)}
                                      >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={note.coverUrl} alt={note.title} className="w-[56px] h-[56px] rounded-md object-cover flex-shrink-0" loading="lazy" />
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                          <p className="text-[12px] text-[#333] leading-tight line-clamp-2 font-medium">{note.title}</p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-[#999] truncate">{note.author}</span>
                                            <div className="flex items-center gap-0.5">
                                              <Heart size={9} className="text-[#ccc]" />
                                              <span className="text-[10px] text-[#999]">{note.likeCount >= 10000 ? (note.likeCount / 10000).toFixed(1) + 'w' : note.likeCount >= 1000 ? (note.likeCount / 1000).toFixed(1) + 'k' : note.likeCount}</span>
                                            </div>
                                          </div>
                                          <p className="text-[10px] text-[#FF6B35] mt-0.5 truncate">
                                            {note.expiredReason || '可能已过期'}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ));
                            }

                            // Non-expired notes: simple list with expand/collapse
                            const isExpanded = expandedTools.has(i);
                            const visible = isExpanded ? notes : notes.slice(0, 3);
                            return (
                              <>
                                <div className="flex flex-col gap-1.5">
                                  {visible.map((note) => (
                                    <div
                                      key={note.id}
                                      className="flex gap-2.5 bg-[#F8F8F8] rounded-lg p-2 cursor-pointer hover:bg-[#F0F0F0] transition-colors"
                                      onClick={() => onNoteTap?.(note.id)}
                                    >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={note.coverUrl} alt={note.title} className="w-[56px] h-[56px] rounded-md object-cover flex-shrink-0" loading="lazy" />
                                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <p className="text-[12px] text-[#333] leading-tight line-clamp-2 font-medium">{note.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[10px] text-[#999] truncate">{note.author}</span>
                                          <div className="flex items-center gap-0.5">
                                            <Heart size={9} className="text-[#ccc]" />
                                            <span className="text-[10px] text-[#999]">{note.likeCount >= 10000 ? (note.likeCount / 10000).toFixed(1) + 'w' : note.likeCount >= 1000 ? (note.likeCount / 1000).toFixed(1) + 'k' : note.likeCount}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {notes.length > 3 && (
                                  <button
                                    onClick={() => setExpandedTools((prev) => {
                                      const next = new Set(prev);
                                      if (next.has(i)) next.delete(i); else next.add(i);
                                      return next;
                                    })}
                                    className="w-full text-center text-[11px] text-[#FF2442] mt-1.5 py-1 hover:bg-white/50 rounded"
                                  >
                                    {isExpanded ? '收起' : `查看全部 ${notes.length} 条 ›`}
                                  </button>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="bg-[#F8F8F8] rounded-lg p-2.5">
                          <p className="text-[11px] text-[#999] leading-relaxed">
                            {msg.toolUse.result}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <div className="bg-[#FF2442] rounded-2xl rounded-tr-md px-3.5 py-2.5 max-w-[80%] shadow-sm">
                <p className="text-[13px] text-white leading-relaxed">
                  {msg.content}
                </p>
              </div>
            </div>
          )
        )}
        {/* Loading indicator is now integrated into the streaming placeholder message */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-white border-t border-[#F0E8D8]">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="跟薯管家说点什么..."
          className="flex-1 text-[13px] text-[#333333] bg-[#F5F5F5] rounded-full px-4 py-2.5 outline-none placeholder:text-[#CCCCCC]"
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #FF2442 0%, #FF6634 100%)',
          }}
        >
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}

// ---- Main Page ----

export default function Home() {
  const [showBubble1, setShowBubble1] = useState(false);
  const [showBubble2, setShowBubble2] = useState(false);
  const [showBubble3, setShowBubble3] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '嗨～我是薯管家，你的收藏助手！我可以帮你：\n📂 智能整理收藏夹\n🏷️ 按主题归类笔记\n🔍 搜索和发现过期内容\n📝 生成收藏摘要\n有什么需要帮忙的吗？😊',
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [isOrganized, setIsOrganized] = useState(false);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [bubblesHandled, setBubblesHandled] = useState(false);
  const [aiCategories, setAiCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [cachedCategories, setCachedCategories] = useState<Category[] | null>(null);
  const [showFloatingMascot, setShowFloatingMascot] = useState(false);
  const [activeSecondaryTab, setActiveSecondaryTab] = useState('笔记');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [activeBottomTab, setActiveBottomTab] = useState('我');
  const [collectedFeedIds, setCollectedFeedIds] = useState<Set<string>>(new Set());
  const welcomeCardRef = useRef<HTMLDivElement>(null);


  const hasAutoOrganized = useRef(false);

  // On mount: load cache or auto-organize. WelcomeCard still shows normally.
  useEffect(() => {
    let shouldAutoOrganize = true;
    try {
      const cached = localStorage.getItem('xhs-favorites-organized');
      if (cached) {
        const categories: Category[] = JSON.parse(cached);
        if (Array.isArray(categories) && categories.length > 0) {
          setCachedCategories(categories);
          // Load organized view immediately, but keep WelcomeCard visible
          setAiCategories(categories);
          setSelectedCategoryId(categories[0].id);
          setIsOrganized(true);
          shouldAutoOrganize = false;
        }
      }
    } catch {
      // Ignore parse errors
    }
    setCacheLoaded(true);

    // No cache on first visit: auto-trigger organize so content below WelcomeCard is organized
    if (shouldAutoOrganize && !hasAutoOrganized.current) {
      hasAutoOrganized.current = true;
      setTimeout(() => {
        const triggerOrganize = async () => {
          setIsOrganizing(true);
          try {
            const res = await fetch('/api/organize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ notes: mockNotes }),
            });
            const data = await res.json();
            if (data.categories) {
              const noteMap = buildNoteMap(mockNotes);
              const fullCategories = data.categories.map((cat: { id: string; name: string; icon: string; noteIds: string[]; aiSummary: string }) => {
                const matched = resolveNotes(cat.noteIds, noteMap);
                return {
                  ...cat,
                  noteCount: matched.length,
                  coverUrls: matched.slice(0, 4).map((n: Note) => n.coverUrl),
                  notes: matched,
                };
              });
              setAiCategories(fullCategories);
              setSelectedCategoryId(fullCategories[0]?.id || null);
              setIsOrganized(true);
              setIsOrganizing(false);
            }
          } catch {
            setIsOrganizing(false);
          }
        };
        triggerOrganize();
      }, 300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage whenever aiCategories changes (and is non-empty)
  useEffect(() => {
    if (aiCategories.length === 0) return;
    try {
      localStorage.setItem('xhs-favorites-organized', JSON.stringify(aiCategories));
    } catch {
      // Ignore storage errors (quota exceeded, etc.)
    }
  }, [aiCategories]);

  // Phase 1: show greeting bubble after mount
  useEffect(() => {
    if (!cacheLoaded || bubblesHandled) return;
    const t1 = setTimeout(() => setShowBubble1(true), 500);
    return () => clearTimeout(t1);
  }, [cacheLoaded, bubblesHandled]);

  // Phase 2: show context-aware bubble 1.5s after bubble 1
  useEffect(() => {
    if (!showBubble1) return;
    const t2 = setTimeout(() => {
      setShowBubble2(true);
    }, 1500);
    return () => clearTimeout(t2);
  }, [showBubble1]);

  // Phase 3: show input bubble 1.5s after bubble 2
  useEffect(() => {
    if (!showBubble2) return;
    const t3 = setTimeout(() => {
      setShowBubble3(true);
    }, 1500);
    return () => clearTimeout(t3);
  }, [showBubble2]);

  // Floating mascot bar: show when WelcomeCard is dismissed or scrolled out of viewport
  const welcomeCardVisible = (showBubble1 || showBubble2 || showBubble3) && !bubblesHandled;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bubblesHandled) {
      setShowFloatingMascot(true);
      return;
    }

    const anchorEl = welcomeCardRef.current;
    if (!anchorEl) return;

    let scrollContainer: HTMLElement | null = anchorEl.parentElement;
    while (scrollContainer) {
      const style = getComputedStyle(scrollContainer);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') break;
      scrollContainer = scrollContainer.parentElement;
    }
    if (!scrollContainer) return;

    const handleScroll = () => {
      if (!welcomeCardVisible) {
        setShowFloatingMascot(false);
        return;
      }
      const containerRect = scrollContainer!.getBoundingClientRect();
      const anchorRect = anchorEl.getBoundingClientRect();
      const isScrolledOut = anchorRect.bottom < containerRect.top + 41;
      setShowFloatingMascot(isScrolledOut);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => scrollContainer!.removeEventListener('scroll', handleScroll);
  }, [bubblesHandled, welcomeCardVisible]);

  // Pattern match for deterministic actions — skip LLM
  const ORGANIZE_PATTERNS = /整理|归类|分类|帮我理一下|收拾一下/;
  const EXPIRED_PATTERNS = /过期|失效|过时|无效|下架|清理/;

  const sendChatMessage = useCallback(async (text: string) => {
    setChatMessages((prev) => [...prev, { role: 'user', content: text }]);

    // ---- 整理收藏夹：确定性操作，不走 LLM ----
    if (ORGANIZE_PATTERNS.test(text)) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '好的！我来帮你整理收藏夹 ✨\n我会分析全部收藏，按内容自动归类到不同专辑，点击下方按钮开始吧👇',
          organizeAction: true,
        },
      ]);
      return;
    }

    // ---- 过期检测：确定性操作，不走 LLM ----
    if (EXPIRED_PATTERNS.test(text)) {
      const expiredNotes = mockNotes.filter((n) => n.isExpired);
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '',
          expiredAction: true,
        },
      ]);
      // Show done with note cards after animation
      setTimeout(() => {
        setChatMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.findLastIndex((m) => m.role === 'assistant' && m.expiredAction);
          if (lastIdx >= 0) {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: expiredNotes.length > 0
                ? `🔍 检测完成！发现 **${expiredNotes.length}** 条可能过期的收藏：`
                : '✅ 你的收藏内容都还有效，暂未检测到过期内容！',
              expiredProcessing: false,
              expiredDone: true,
              expiredNoteIds: expiredNotes.map((n) => n.id),
            };
          }
          return updated;
        });
      }, 2500);
      // Set processing state
      setTimeout(() => {
        setChatMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.findLastIndex((m) => m.role === 'assistant' && m.expiredAction);
          if (lastIdx >= 0) {
            updated[lastIdx] = { ...updated[lastIdx], expiredProcessing: true };
          }
          return updated;
        });
      }, 0);
      return;
    }

    setChatLoading(true);

    setChatMessages((prev) => [
      ...prev,
      { role: 'assistant', content: '', chain: [] },
    ]);

    try {
      const context = mockNotes
        .slice(0, 10)
        .map((n) => `- ${n.title} (${n.tags?.join(', ')})`)
        .join('\n');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, context }),
      });

      if (!res.ok || !res.body) {
        throw new Error('SSE fetch failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const processEvent = (eventType: string, eventData: string) => {
        try {
          const parsed = JSON.parse(eventData);

          if (eventType === 'chain_step') {
            setChatMessages((prev) => {
              const updated = [...prev];
              const lastIdx = updated.length - 1;
              if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                updated[lastIdx] = {
                  ...updated[lastIdx],
                  chain: [...(updated[lastIdx].chain || []), { node: parsed.node, result: parsed.result }],
                };
              }
              return updated;
            });
          } else if (eventType === 'done') {
            setChatMessages((prev) => {
              const updated = [...prev];
              const lastIdx = updated.length - 1;
              if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                updated[lastIdx] = {
                  ...updated[lastIdx],
                  content: parsed.reply || '',
                  toolUse: parsed.toolUse,
                  chain: parsed.chain || updated[lastIdx].chain,
                };
              }
              return updated;
            });
            if (parsed.toolUse) {
              handleToolActionRef.current({ tool: parsed.toolUse.name, input: parsed.toolUse.input, result: parsed.toolUse.result });
            }
          } else if (eventType === 'error') {
            setChatMessages((prev) => {
              const updated = [...prev];
              const lastIdx = updated.length - 1;
              if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                updated[lastIdx] = {
                  ...updated[lastIdx],
                  content: parsed.reply || '抱歉，薯管家遇到了一点问题，请稍后再试～',
                  chain: parsed.chain || updated[lastIdx].chain,
                };
              }
              return updated;
            });
          }
        } catch {
          // JSON parse error, skip
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let boundary;
        while ((boundary = buffer.indexOf('\n\n')) !== -1) {
          const block = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);

          let eventType = '';
          let eventData = '';
          for (const line of block.split('\n')) {
            if (line.startsWith('event: ')) eventType = line.slice(7);
            else if (line.startsWith('data: ')) eventData = line.slice(6);
          }
          if (eventType && eventData) {
            processEvent(eventType, eventData);
          }
        }
      }
    } catch {
      setChatMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: '网络出了点问题，请稍后再试～',
          };
        }
        return updated;
      });
    } finally {
      setChatLoading(false);
    }
  }, []);

  const handleDirectMessage = useCallback((text: string) => {
    setChatMode(true);
    sendChatMessage(text);
  }, [sendChatMessage]);

  const handleOrganize = async () => {
    setShowBubble1(false);
    setShowBubble2(false);
    setShowBubble3(false);
    setBubblesHandled(true);

    if (cachedCategories && cachedCategories.length > 0) {
      setAiCategories(cachedCategories);
      setSelectedCategoryId(cachedCategories[0].id);
      setIsOrganized(true);
      return;
    }

    setIsOrganizing(true);

    try {
      const res = await fetch('/api/organize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: mockNotes }),
      });

      const data = await res.json();

      if (data.categories) {
        const noteMap = buildNoteMap(mockNotes);
        const categories: Category[] = data.categories.map(
          (cat: { name: string; icon: string; aiSummary: string; noteIds: string[] }, idx: number) => {
            const matched = resolveNotes(cat.noteIds, noteMap);
            return {
              id: `ai-cat-${idx}`,
              name: cat.name,
              icon: cat.icon,
              noteCount: matched.length,
              coverUrls: matched.slice(0, 4).map((n) => n.coverUrl),
              aiSummary: cat.aiSummary,
              notes: matched,
            };
          }
        );
        setAiCategories(categories);
        if (categories.length > 0) setSelectedCategoryId(categories[0].id);
      } else {
        setAiCategories(mockCategories);
        if (mockCategories.length > 0) setSelectedCategoryId(mockCategories[0].id);
      }
    } catch {
      setAiCategories(mockCategories);
      if (mockCategories.length > 0) setSelectedCategoryId(mockCategories[0].id);
    } finally {
      setIsOrganizing(false);
      setIsOrganized(true);
    }
  };

  const handleDismissBubbles = () => {
    setShowBubble1(false);
    setShowBubble2(false);
    setShowBubble3(false);
    setBubblesHandled(true);
    setAiCategories(mockCategories);
    if (mockCategories.length > 0) setSelectedCategoryId(mockCategories[0].id);
    setIsOrganized(true);
  };

  const handleReorganize = () => {
    try {
      localStorage.removeItem('xhs-favorites-organized');
    } catch {
      // Ignore
    }
    setCachedCategories(null);
    setAiCategories([]);
    setSelectedCategoryId(null);
    setIsOrganized(false);
    setBubblesHandled(false);
    setShowBubble1(false);
    setShowBubble2(false);
    setShowBubble3(false);
    handleOrganize();
  };

  const handleOrganizeRef = useRef(handleOrganize);
  handleOrganizeRef.current = handleOrganize;

  const handleToolAction = useCallback((action: { tool: string; input: Record<string, unknown>; result: string }) => {
    if (action.tool === 'organize_favorites') {
      // Don't abruptly close chat — show a friendly reply with action button
      setChatMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: '好的！我来帮你整理收藏夹 ✨\n\n我会分析你的全部收藏，按内容自动归类到不同专辑。整理过程大约需要几秒钟，整理完成后你可以查看分类结果。\n\n点击下方按钮开始整理吧👇',
            organizeAction: true,
          };
        }
        return updated;
      });
    }
  }, []);

  const handleToolActionRef = useRef(handleToolAction);
  handleToolActionRef.current = handleToolAction;

  const handleMascotClick = () => {
    setChatMode(true);
  };

  const handleFeedCollect = (note: Note) => {
    setCollectedFeedIds((prev) => new Set(prev).add(note.id));
  };

  // Merge feed-collected notes into the display list
  const allCollectedNotes = React.useMemo(() => {
    const feedCollected = mockFeedNotes.filter((n) => collectedFeedIds.has(n.id));
    return [...feedCollected, ...mockNotes];
  }, [collectedFeedIds]);

  return (
    <MobileShell>
      <div className={`relative bg-white flex flex-col ${(chatMode) ? 'h-full overflow-hidden' : ''}`}>
        {/* Feed view (首页 tab) */}
        {!chatMode && activeBottomTab === '首页' && (
          <div className="flex flex-col h-full pb-16">
            <FeedView
              onNoteTap={(note) => setSelectedNote(note)}
              collectedIds={collectedFeedIds}
            />
          </div>
        )}

        {/* Profile view (我 tab) */}
        {!chatMode && activeBottomTab === '我' && (
          <div ref={scrollContainerRef} className="pb-16">
            <TopNav />
            <ProfileSection />
            <PrimaryTabs />

            {/* Module 2: Sticky mascot bar */}
            {showFloatingMascot && (
              <div className="sticky top-[41px] z-[25] bg-white/95 backdrop-blur-sm border-b border-gray-100">
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="跟薯管家说点什么..."
                      className="w-full text-[13px] text-[#333333] bg-[#F5F5F5] rounded-full px-3.5 py-2 outline-none placeholder:text-[#CCCCCC]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const value = (e.target as HTMLInputElement).value.trim();
                          if (value) {
                            (e.target as HTMLInputElement).value = '';
                            handleDirectMessage(value);
                          }
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={() => setChatMode(true)}
                    className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 shadow-sm"
                    style={{ boxShadow: '0 2px 8px rgba(255, 36, 66, 0.2)' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/mascot.jpg"
                      alt="薯管家"
                      className="w-full h-full object-cover"
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Scroll detection anchor */}
            <div ref={welcomeCardRef}>
              {!bubblesHandled ? (
                <AnimatePresence>
                  {welcomeCardVisible && (
                    <WelcomeCard
                      showGreeting={showBubble1}
                      showContext={showBubble2}
                      showInput={showBubble3}
                      onDismiss={handleDismissBubbles}
                      onOrganize={handleOrganize}
                      onMascotClick={handleMascotClick}
                      onDirectMessage={handleDirectMessage}
                    />
                  )}
                </AnimatePresence>
              ) : null}
            </div>

            <SecondaryTabs activeTab={activeSecondaryTab} onTabChange={setActiveSecondaryTab} />

            {/* Content area */}
            <div className="bg-xhs-divider min-h-[50vh]">
              {activeSecondaryTab === '📮 动态' && <ManagerTab />}
              {activeSecondaryTab === '📚 知识库' && <KnowledgeBaseTab />}
              {activeSecondaryTab === '收藏' && <ManagerTab />}
              {activeSecondaryTab === '赞过' && <SavedCommentsTab />}
              {activeSecondaryTab === '笔记' && (
              <>
                <AnimatePresence>
                {isOrganizing ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-20 gap-4"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles size={32} className="text-[#FF2442]" />
                    </motion.div>
                    <p className="text-sm text-[#999999]">薯队长正在分析你的收藏...</p>
                    <p className="text-xs text-[#CCCCCC]">AI 分类中，请稍候</p>
                  </motion.div>
                ) : !isOrganized ? (
                  <motion.div
                    key="messy"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <NoteGrid notes={allCollectedNotes} onNoteTap={setSelectedNote} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="organized"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col"
                  >
                    {/* Summary banner */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="rounded-2xl p-3 mx-3 mt-3 mb-2"
                      style={{
                        background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF0F0 50%, #FFE8E8 100%)',
                      }}
                    >
                      <div className="flex items-center justify-center gap-2 text-sm text-[#333333]">
                        <Sparkles size={16} className="text-[#FF2442]" />
                        <span>
                          已将 <span className="font-bold text-[#FF2442]">{mockNotes.length}</span> 条收藏整理为{' '}
                          <span className="font-bold text-[#FF2442]">{aiCategories.length}</span> 个分类
                        </span>
                        <button
                          onClick={handleReorganize}
                          className="ml-1 flex items-center gap-1 text-[11px] text-[#999] hover:text-[#FF2442] transition-colors"
                          title="重新整理"
                        >
                          <RefreshCw size={12} />
                          <span>重新整理</span>
                        </button>
                      </div>
                    </motion.div>

                    {/* Left-right split layout */}
                    <div className="flex min-h-[50vh]">
                      {/* Left: category folder list */}
                      <div className="w-[38%] border-r border-gray-100 overflow-y-auto bg-white">
                        {aiCategories.map((cat, i) => {
                          const isSelected = cat.id === selectedCategoryId;
                          return (
                            <motion.button
                              key={cat.id}
                              initial={{ opacity: 0, x: -15 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              onClick={() => setSelectedCategoryId(cat.id)}
                              className={`w-full text-left px-3 py-3 border-b border-gray-50 transition-colors ${
                                isSelected
                                  ? 'bg-[#FFF5F5] border-l-[3px] border-l-[#FF2442]'
                                  : 'border-l-[3px] border-l-transparent hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="text-base">{cat.icon}</span>
                                <span className={`text-[13px] leading-tight ${isSelected ? 'font-semibold text-[#333]' : 'text-[#666]'}`}>
                                  {cat.name}
                                </span>
                              </div>
                              <span className="text-[11px] text-[#999] ml-6">{cat.noteCount} 条笔记</span>
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Right: notes in selected category */}
                      <div className="w-[62%] overflow-y-auto bg-[#F5F5F5]">
                        {(() => {
                          const selectedCat = aiCategories.find((c) => c.id === selectedCategoryId);
                          if (!selectedCat) return null;
                          return (
                            <div className="p-2">
                              {/* AI summary */}
                              {selectedCat.aiSummary && (
                                <div className="bg-white rounded-xl p-3 mb-2">
                                  <div className="flex items-start gap-1.5">
                                    <Sparkles size={13} className="text-[#FF2442] mt-0.5 flex-shrink-0" />
                                    <p className="text-[12px] text-[#666] leading-relaxed">
                                      {selectedCat.aiSummary}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {/* Note cards */}
                              <div className="space-y-2">
                                {selectedCat.notes.map((note) => (
                                  <div key={note.id} className="bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer" onClick={() => setSelectedNote(note)}>
                                    <div className="flex gap-2.5 p-2.5">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={note.coverUrl}
                                        alt={note.title}
                                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                        loading="lazy"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[13px] text-[#333] font-medium leading-snug line-clamp-2">
                                          {note.title}
                                        </p>
                                        <div className="flex items-center gap-1 mt-1.5">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={note.author.avatarUrl}
                                            alt={note.author.name}
                                            className="w-3.5 h-3.5 rounded-full"
                                          />
                                          <span className="text-[11px] text-[#999] truncate">
                                            {note.author.name}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-0.5 mt-1">
                                          <Heart size={11} className="text-[#999]" />
                                          <span className="text-[11px] text-[#999]">
                                            {note.likeCount}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    {/* AI Tags */}
                                    {note.aiTags && note.aiTags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 px-2.5 pb-2.5 -mt-0.5">
                                        {note.aiTags.map((tag) => (
                                          <span
                                            key={tag}
                                            className={`text-[10px] px-1.5 py-0.5 rounded-full ${getAiTagStyle(tag)}`}
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              </>
              )}
            </div>
          </div>
        )}

        {/* Chat mode: replaces all content above, fills the phone shell */}
        {chatMode && (
          <div className="flex flex-col bg-white h-full">
            <PrimaryTabs />
            <InlineChatView
              messages={chatMessages}
              isLoading={chatLoading}
              onSend={sendChatMessage}
              onClose={() => setChatMode(false)}
              onNoteTap={(noteId) => {
                const note = mockNotes.find((n) => n.id === noteId);
                if (note) setSelectedNote(note);
              }}
              onOrganize={() => {
                // Step 1: show processing animation
                setChatMessages((prev) => {
                  const updated = [...prev];
                  const lastAssistantIdx = updated.findLastIndex((m) => m.role === 'assistant' && m.organizeAction);
                  if (lastAssistantIdx >= 0) {
                    updated[lastAssistantIdx] = { ...updated[lastAssistantIdx], organizeProcessing: true };
                  }
                  return updated;
                });
                // Step 2: after animation, show done + jump button
                setTimeout(() => {
                  setChatMessages((prev) => {
                    const updated = [...prev];
                    const lastAssistantIdx = updated.findLastIndex((m) => m.role === 'assistant' && m.organizeAction);
                    if (lastAssistantIdx >= 0) {
                      updated[lastAssistantIdx] = { ...updated[lastAssistantIdx], organizeProcessing: false, organizeDone: true };
                    }
                    return updated;
                  });
                }, 3000);
              }}
              onViewOrganizeResult={() => {
                setChatMode(false);
                setTimeout(() => handleOrganizeRef.current(), 300);
              }}
              allNotes={mockNotes}
            />
            <div className="flex-shrink-0">
              <BottomNav activeTab={activeBottomTab} onTabChange={setActiveBottomTab} />
            </div>
          </div>
        )}

        {/* Bottom nav - sticky at bottom of mobile shell */}
        {!chatMode && (
          <div className="sticky bottom-0 left-0 right-0 z-40">
            <BottomNav activeTab={activeBottomTab} onTabChange={setActiveBottomTab} />
          </div>
        )}
      </div>

      {/* Note Detail Modal */}
      <AnimatePresence>
        {selectedNote && (
          <NoteDetailModal
            note={selectedNote}
            onClose={() => setSelectedNote(null)}
            isCollected={collectedFeedIds.has(selectedNote.id) || mockNotes.some((n) => n.id === selectedNote.id)}
            onCollect={handleFeedCollect}
          />
        )}
      </AnimatePresence>
    </MobileShell>
  );
}
