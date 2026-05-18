#!/usr/bin/env python3
"""
Generate wordcloud from collected XHS user feedback about favorites/bookmarks.
Data source: Web search results from xiaohongshu community posts and comments.
"""

import jieba
from wordcloud import WordCloud
import matplotlib
matplotlib.use('Agg')
from collections import Counter
import random
import os

# All collected text data from web search results about XHS favorites/bookmarks
text_data = """
收藏夹越攒越多 每次想找灵感笔记时都要翻半天 结果还是找不到 收藏就像黑洞 只进不出 时间一长就成了堆满杂物的信息垃圾场
文件夹数量增多 内容种类繁杂 层级混乱 搜索功能不够强大 久而久之 用户常常习惯性地进行收藏 却从未回头查看这些珍贵的灵感
收藏夹内容过多导致查找困难 手动整理耗时耗力 担心喜欢的笔记被删除或隐藏 心血收藏付诸东流 换设备或账号时 收藏内容无法迁移
创建完许多专辑收藏夹之后 笔记就只能显示一个 取消一个收藏的笔记它就会自动顶出来一个 小红书后台的运行bug
收藏夹太多了 能不能帮忙整理所有 总有一天能出个功能 每天推送一篇尘封多年的收藏夹里的帖子总结给我
希望每天某个时间 把最近收藏夹里收藏的东西总结分类分发过去 用户期待定期自动整理推送
收藏的笔记上千条 不见底 找不见 明知吃灰 还继续收藏 信息爆炸的时代 昨天的收藏还没看 今天的信息又挤爆屏
数字囤积 新型囤积行为障碍 心理 错失恐惧症 担心错过重要信息 焦虑 不安 紧迫感
收藏容易消化难 收藏一秒钟 消化十分钟 即时满足感 未来可能达成某种目标的憧憬
按照书单 美食 学习 护肤等领域分好 把收藏的笔记移动到对应的文件夹里 创建新专辑 填写专辑名称
收藏分散 碎片信息堆积 数字囤积行为 认知负荷超出承载能力 自我强迫和焦虑 思维惰性 知识排斥
内容种类杂 生活灵感 工作灵感 艺术创作 装修建议 杂七杂八全混在一起 搜索功能不够强大 找一篇旧收藏要点半天
我只是习惯性收藏 但从来没回头看过它们 收藏了不看 囤积不消化
精简堆积的数据 收藏夹内容关键词自动分类 已储存内容提醒 目标笔记搜寻 长期囤积内容提醒观看 囤积定量提醒 囤积时间提醒
活化推送 活化检索 探索式利用 分享式利用 提醒式利用
收藏夹太乱 一键搬家帮你整理 收藏太多怎么办 一键帮我搬好分类好
一键导出 笔记标题 作者 点赞数 笔记链接 图片链接 批量下载收藏内容 按分类自动归档
原笔记被删除或设为私密 收藏夹内提示内容不可见 网络卡顿 收藏未成功同步 系统显示异常
收藏笔记时 不要直接点红心 点旁边添加到专辑 选择已有专辑或者新建一个 搜索框直接输入关键词进行查找
养成当下即分类的习惯 看到想收藏的笔记 先停顿一秒 想清楚用途后 立刻放进对应分类
每月一次查看收藏列表 及时删除不再需要的内容 定期清理失效链接
收藏夹中信息碎片一般呈现信息分散的特点 用户由于惰性或时间疏于管理信息 导致碎片信息堆积
随着囤积量增加 个体认知负荷一旦超出承载能力 引发自我强迫和焦虑 养成思维惰性 产生知识排斥等潜在危害
不利于平台大数据对用户短期兴趣的挖掘 尽快将数字文件按照类型 使用频率 存储位置 来源 大小进行区分
让数字信息流动起来 激活尘封的知识 让知识流动的同时最大化利用信息
翻半天找不到 收藏越来越多 分类混乱 内容杂乱无章 大海捞针 信息垃圾场
手动整理太麻烦 没有自动分类功能 智能整理 自动归类 一键整理
收藏了就忘了 从来不看 吃灰 沉睡内容 遗忘 过期 失效
找不到之前收藏的内容 搜索不方便 检索效率低 翻不到
收藏夹乱七八糟 混在一起 没有条理 杂乱无章 无序
想用的时候找不到 收藏了用不上 白收藏了 浪费
自动分类 智能标签 一键归档 批量管理
过期内容 失效链接 被删除的笔记 内容不可见
收藏太多 数量庞大 上千条 几千条收藏 越积越多
分类功能 专辑管理 收藏集 文件夹分类
定期推送 回顾提醒 激活沉睡内容 每日回忆
重复收藏 同类内容太多 信息冗余 去重
收藏习惯差 只收不整理 懒得分类 随手收藏
信息焦虑 知识焦虑 错失恐惧 囤积焦虑
搜索功能弱 找旧内容费劲 关键词搜索不精准
笔记整理 内容管理 知识库 灵感管理
电子仓鼠 数字松鼠症 信息囤积 数字囤积
收藏变废墟 信息坟场 垃圾堆 吃灰角落
需要帮忙整理 自动化整理 智能收藏管理
收藏夹太满了 装不下了 容量焦虑
想要导出收藏 备份功能 跨设备同步
收藏笔记消失了 看不到了 不见了
"""

# jieba segmentation
words = jieba.cut(text_data, cut_all=False)

# Stop words
stop_words = set([
    "的", "了", "是", "我", "你", "在", "有", "和", "就", "都", "也", "不", "这", "那",
    "会", "要", "说", "一个", "可以", "没有", "什么", "怎么", "还是", "但是", "因为",
    "所以", "如果", "哈哈", "真的", "觉得", "知道", "想", "看", "到", "来", "去", "做",
    "让", "能", "好", "很", "吧", "啊", "呢", "吗", "哦", "嗯", "太", "被", "把", "给",
    "对", "用", "下", "上", "中", "个", "人", "里", "多", "小红书", "还", "没", "又",
    "或", "而", "等", "从", "与", "及", "它", "他", "她", "们", "这些", "那些", "自己",
    "已经", "一些", "一种", "之后", "其", "为", "以", "不是", "比如", "如", "可能",
    "需要", "进行", "通过", "时", "后", "前", "以后", "出", "点", "一", "每", "按照",
    "按", "其他", "更", "只", "还有", "一下", "直接", "然后", "所", "同时", "当",
    "于", "将", "已", "而且", "并", "才", "过", "起来", "之", "最", "再", "就是",
    "不会", "不够", "不到", "或者", "新建", "选择", "操作", "功能", "用户", "内容",
    "问题", "方式", "时候", "平台", "进入", "提供", "方法", "使用", "支持", "工具",
    "情况", "包括", "利用", "系统", "数据", "建议", "设置", "笔记", "专辑",
    "页面", "一般", "呈现", "特点", "一旦", "不再", "及时",
    "收藏", "收藏夹", "加收藏", "收藏了", "收藏笔记", "文件夹", "管理",
    "帮忙", "整理", "分类", "想要", "添加", "帮我", "一键",
    "信息", "链接", "提醒", "存储", "位置", "来源", "大小",
    "区分", "频率", "类型", "个体", "关键词", "导出", "下载",
])

# Filter words
word_list = []
for word in words:
    word = word.strip()
    if len(word) >= 2 and word not in stop_words and not word.isdigit() and not word.isascii():
        word_list.append(word)

# Count frequencies
word_freq = Counter(word_list)

# Print top 30 for analysis
print("=== Top 30 词频 ===")
for word, count in word_freq.most_common(30):
    print(f"  {word}: {count}")

# Generate wordcloud
font_path = "/System/Library/Fonts/STHeiti Medium.ttc"

# XHS brand color function - red/pink palette
def xhs_color_func(word=None, font_size=None, position=None, orientation=None,
                    font_path=None, random_state=None):
    colors = [
        (255, 45, 85),    # XHS red
        (255, 69, 58),    # coral red
        (255, 100, 100),  # light red
        (230, 57, 70),    # crimson
        (255, 138, 128),  # salmon pink
        (219, 68, 85),    # dark pink
        (255, 82, 119),   # hot pink
        (200, 50, 80),    # deep red
        (255, 120, 140),  # rose pink
        (180, 40, 60),    # burgundy
    ]
    r, g, b = random.choice(colors)
    return f"rgb({r}, {g}, {b})"

wc = WordCloud(
    font_path=font_path,
    width=800,
    height=500,
    background_color="white",
    max_words=100,
    max_font_size=120,
    min_font_size=12,
    color_func=xhs_color_func,
    prefer_horizontal=0.7,
    margin=10,
)

wc.generate_from_frequencies(word_freq)

output_path = "/Users/tiffanyliu/xhs-favorites-ai/public/wordcloud.png"
wc.to_file(output_path)
print(f"\nWordcloud saved to: {output_path}")
print(f"Total unique words: {len(word_freq)}")
print(f"Total word tokens: {len(word_list)}")
