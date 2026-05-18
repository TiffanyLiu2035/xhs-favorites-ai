export const productDocContent = `# 「薯管家」小红书主站收藏夹 AI Agent 改版方案

> 「收藏」是人类面对信息洪流时的本能反应——在转瞬即逝中按下一个"留住"的按钮，仿佛为未来的自己埋下一枚回到此刻的锚点。然而锚点越埋越多，海面却早已换了方向。想用时找不到、过期了不知道、零散的信息无法转化为行动，收藏夹终于从「灵感花园」长成了「信息坟场」。
>
> 「薯管家」是一位聪明的"懒人"管家，收藏夹的 AI Agent。点一下收藏，薯管家帮你搞定剩下所有事——智能归类、自动管理、对话沉淀、场景唤醒，让收藏易用、好用、有用、活用，灵感花园重新唤醒。
>
> 从「只要收藏就“吃灰”」到「收藏一下就够了」，*Collect, that's it.*

---

## 一、从需求出发

### 1.1 核心痛点：收了存不住，找了用不上

小红书用户的收藏行为贯穿「收→存→找→用」全链路：

1. **收的时候嫌麻烦：** 收藏时需要手动选择或新建专辑，步骤多、耐心少，大量笔记直接扔进"默认收藏"
2. **存了之后不整理：** 看到有用就收，但几乎不会回头分类，收藏夹变成"数字仓库"
3. **想找的时候找不到：** 专辑列表不支持搜索，只能一直往下翻；收藏量越大，找回特定内容越难
4. **找不到就越来越乱：** 因为翻找太麻烦，用户索性再建新专辑，同类内容散落多处，管理更加混乱
5. **过期了完全不知道：** 很多收藏的内容已经失效，用户毫无感知，收藏夹"保鲜"无从谈起
6. **想用的时候无从下手：** 收了 50 篇穿搭但不知道怎么搭，收藏停留在"囤积"阶段，无法转化为行动

### 1.2 用户在说什么

**NLP 词云分析：**

通过 15 篇相关笔记及 200+ 条评论的词云分析：

<figure style="margin:0;text-align:center;">
<img src="/wordcloud.png" style="width:100%;border-radius:8px;" alt="收藏功能用户舆情词云" />
<figcaption style="font-size:11px;color:#aaa;margin-top:12px;letter-spacing:0.5px;">数据来源：小红书公开内容，2026年5月</figcaption>
</figure>

- 「分类」「整理」为最高频词 → 用户渴望智能分类
- 「囤积」「焦虑」等负面词高频 → 无序收藏带来心理压力
- 「自动」「一键」「智能」→ 用户期待零操作成本
- 「知识」「灵感」「消化」→ 收藏的本质是知识管理，不是存储

**小红书公域帖子：**

> 从"吐槽等官方"到"自己写 skill"——用户需求的迫切程度已经外溢到 UGC 自造工具阶段：

<div style="margin:16px 0;">
<div style="font-size:12px;font-weight:600;color:#FF2442;margin-bottom:6px;">🔥 喊话产品团队</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
<a href="https://xhslink.com/o/9qnyGvlIRDG" target="_blank" style="display:block;text-decoration:none;color:inherit;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:10px 12px;">
<div style="font-weight:600;font-size:13px;color:#333;line-height:1.4;">@小红书AI产品经理，点点为什么不打通笔记收藏</div>
<div style="color:#999;font-size:11px;margin-top:4px;">质问为什么 AI 能力不与收藏功能打通</div>
</a>
<a href="https://xhslink.com/o/2z14zQ0jne" target="_blank" style="display:block;text-decoration:none;color:inherit;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:10px 12px;">
<div style="font-weight:600;font-size:13px;color:#333;line-height:1.4;">小红书的产品经理，请你过来看一看</div>
<div style="color:#999;font-size:11px;margin-top:4px;">列举收藏夹核心体验缺陷</div>
</a>
</div>
<div style="font-size:12px;font-weight:600;color:#FF8C00;margin-bottom:6px;">😫 用户痛点与诉求</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
<a href="https://xhslink.com/o/bHSZbKl8K5" target="_blank" style="display:block;text-decoration:none;color:inherit;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:10px 12px;">
<div style="font-weight:600;font-size:13px;color:#333;line-height:1.4;">AI整理收藏夹！我的收藏夹内容实在是太多了</div>
<div style="color:#999;font-size:11px;margin-top:4px;">重度用户倾诉积压之痛，主动找 AI 方案</div>
</a>
<a href="https://xhslink.com/o/5vNltVwCGLn" target="_blank" style="display:block;text-decoration:none;color:inherit;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:10px 12px;">
<div style="font-weight:600;font-size:13px;color:#333;line-height:1.4;">需求背景：目前我在小红书的收藏夹功能...</div>
<div style="color:#999;font-size:11px;margin-top:4px;">用户写出需求文档级别的功能建议</div>
</a>
</div>
<div style="font-size:12px;font-weight:600;color:#7C5CFC;margin-bottom:6px;">🛠 用户已经自己动手</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
<a href="https://xhslink.com/o/9xIcBPDmpV1" target="_blank" style="display:block;text-decoration:none;color:inherit;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:10px 12px;">
<div style="font-weight:600;font-size:13px;color:#333;line-height:1.4;">一句话，让AI帮你整理落灰的收藏夹</div>
<div style="color:#999;font-size:11px;margin-top:4px;">借助 AI 对话工具整理多年收藏</div>
</a>
<a href="https://xhslink.com/o/Abe1f9GvrvH" target="_blank" style="display:block;text-decoration:none;color:inherit;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:10px 12px;">
<div style="font-weight:600;font-size:13px;color:#333;line-height:1.4;">收藏夹太乱？我写了个 skill 自动分类</div>
<div style="color:#999;font-size:11px;margin-top:4px;">用点点 skill 开发收藏夹自动分类工具</div>
</a>
</div>
</div>

**微信私域反馈：**

<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0;">
<figure style="margin:0;text-align:center;">
<img src="/wechat-feedback.webp" alt="点点AI用户群反馈" style="width:100%;border-radius:8px;border:1px solid #e5e7eb;" />
<figcaption style="font-size:11px;color:#aaa;margin-top:12px;letter-spacing:0.5px;">来源：点点 AI 种子用户群</figcaption>
</figure>
<figure style="margin:0;text-align:center;">
<img src="/wechat-feedback-2.webp" alt="用户访谈语音转文字" style="width:100%;border-radius:8px;border:1px solid #e5e7eb;" />
<figcaption style="font-size:11px;color:#aaa;margin-top:12px;letter-spacing:0.5px;">来源：身边小红书用户访谈</figcaption>
</figure>
<figure style="margin:0;text-align:center;">
<img src="/wechat-feedback-3.webp" alt="用户访谈对话" style="width:100%;border-radius:8px;border:1px solid #e5e7eb;" />
<figcaption style="font-size:11px;color:#aaa;margin-top:12px;letter-spacing:0.5px;">来源：身边小红书用户访谈</figcaption>
</figure>
<figure style="margin:0;text-align:center;">
<img src="/wechat-feedback-4.webp" alt="用户访谈对话" style="width:100%;border-radius:8px;border:1px solid #e5e7eb;" />
<figcaption style="font-size:11px;color:#aaa;margin-top:12px;letter-spacing:0.5px;">来源：身边小红书用户访谈</figcaption>
</figure>
</div>

### 1.3 看看小红书的 AI 怎么说

我们把"小红书收藏夹整理"这个需求分别丢给了小红书生态内的两个 AI 产品，看看它们怎么回答：

**[小红书问一问](https://xhslink.com/m/8DKs5my2t1Q)**（AI 总结 13 篇笔记生成）：

> 收藏夹已从"存档工具"演变为承载安全感、成长期待和灵感的"数字仓库"，用户期待从"能存"升级到"好用"和"智能"。核心发现：
> - **智能化需求最强烈：** 收藏夹变成"电子囤积焦虑所"，用户希望 AI 主动介入整理分类，甚至将收藏夹打通为 RAG 知识库
> - **管理体验亟待优化：** 批量操作、自定义排序、收藏夹内搜索等基础功能缺失
> - **从"存"到"用"：** 用户需要的不仅是存储空间，更是能将信息转化为行动和知识的工具

**[点点 AI Deep Research](https://www.askdiandian.com/dr/a5c1a24e54d1870dfc2f021b9af72732f95d02aa324c21215974f76ce5d167df/4671766862122135555?themeType=light&target=copy)**：

> 小红书的收藏夹功能正面临严重的用户信任危机。海量用户因排序混乱、搜索失效、操作繁琐等核心痛点，导致收藏内容大量"吃灰"。用户的真实需求已从简单的"收藏"升级为构建个人知识体系的"知识管理"，而现有功能与这一期待存在巨大鸿沟。

两个 AI 都指向同一个结论：**用户需要的不是"教我怎么整理"，而是"帮我自动整理"。**

---

### 1.4 现有方案都缺了什么

| 方案 | 自动分类 | 智能总结 | 主动推送 | Agent 交互 | 技术门槛 | 局限性 |
|------|----------|----------|----------|-----------|----------|--------|
| 小红书现有 | — | — | — | — | 无 | 仅支持手动专辑管理 |
| Pinterest | ✓ | — | — | — | 无 | 分类粗粒度，不支持知识提取 |
| Readwise | — | ✓ | ✓ | — | 低 | 定位读书笔记，不覆盖社区内容 |
| OPPO 小布记忆 | 部分 | — | — | — | 无 | 仅限 OPPO 生态 |
| 用户自建 skill | 部分 | — | — | — | 高 | 无法覆盖普通用户；分类逻辑简单，缺少知识提取和主动推送 |
| **薯管家** | **✓** | **✓** | **✓** | **✓** | **无** | — |

当前的站外技术手段（用户自建 skill、AI 对话工具、浏览器插件等）证明了需求的真实性，但它们都停留在**单点能力**——要么只做分类，要么只做总结，没有一个方案做到"基于收藏内容的全链路 Agent 交互"。这是薯管家的差异化机会。

---

## 二、产品定位

薯管家是小红书收藏夹的 **AI Agent**——一个聪明的懒人管家。*Collect. That's it.*

- **解决什么问题：** 收藏夹从"信息坟场"变成"个人知识库"。用户只做"收藏"一个动作，薯管家自动完成存储、管理、应用、延伸的完整闭环
- **面向谁：** 所有有收藏习惯的小红书用户，尤其是收藏量 100+ 且从不整理的"囤积型"用户
- **产品形态：** 嵌入小红书「我」页面的智能助手，以对话式交互 + 自动化推送为核心，不改变用户现有使用习惯
- **技术定位：** 不是简单的分类工具，而是基于收藏内容的 Multi-Agent 系统——意图识别、工具调用、知识提取、React与Deep Research 全链路打通
- **与现有功能的关系：** 不替代收藏夹，而是在其之上叠加智能层。用户仍然用原生收藏按钮，薯管家在后台静默工作

---

## 三、用户旅程：四步闭环

\`\`\`
收藏 ──→ 管理 ──→ 应用 ──→ 延伸
(省力)    (省心)    (增值)    (增长)
\`\`\`

### Step 1：存储优化 — 收藏时就帮你归好类

**过去：** 点收藏 → 选一个专辑 → 费力往下翻 → 懒得分类 → 扔进"默认收藏"。

**现在：** 点收藏 → AI 分析笔记内容 → 推荐最匹配的专辑 → **支持多选** → 一键存入多个专辑。

**Demo 中可体验：**
- 打开任意笔记详情 → 点击「收藏」按钮
- 弹出 AI 推荐专辑列表，按匹配度排序，首位自动选中
- 支持多选（checkbox），可同时收藏到多个专辑
- 末尾提供「新建专辑」选项，底部保留「直接收藏（不归类）」兜底

**技术实现：** 分析笔记标签、内容和已有专辑语义相似度，输出匹配度排序的专辑推荐列表。

### Step 2：数据管理 — AI 全自动分类、打标签、建收藏夹

存好数据后，用户完全不用手动管理。薯管家自动完成三件事：

**① 一键智能分类**

不同用户的收藏习惯差异极大。我们按「收藏数 × 专辑数」将用户分为三种典型画像：

<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:12px 0;">
<figure style="margin:0;text-align:center;">
<img src="/user-type-b.webp" alt="收藏多专辑少" style="width:100%;border-radius:8px;border:1px solid #e5e7eb;" />
<figcaption style="font-size:11px;color:#aaa;margin-top:12px;letter-spacing:0.5px;">收藏多 · 专辑少（4486 篇）<br/>大量内容堆在默认收藏</figcaption>
</figure>
<figure style="margin:0;text-align:center;">
<img src="/user-type-a.webp" alt="收藏多专辑多" style="width:100%;border-radius:8px;border:1px solid #e5e7eb;" />
<figcaption style="font-size:11px;color:#aaa;margin-top:12px;letter-spacing:0.5px;">收藏多 · 专辑多（3322 篇）<br/>已有分类体系但不够精细</figcaption>
</figure>
<figure style="margin:0;text-align:center;">
<img src="/user-type-c.webp" alt="收藏少专辑少" style="width:100%;border-radius:8px;border:1px solid #e5e7eb;" />
<figcaption style="font-size:11px;color:#aaa;margin-top:12px;letter-spacing:0.5px;">收藏少 · 专辑少（55 篇）<br/>轻量使用，尚未养成整理习惯</figcaption>
</figure>
</div>

薯管家针对不同画像采用不同策略：
- **收藏多 · 专辑少：** 从零建类——分析全部收藏，自动生成 6-10 个分类（如美食探店、旅行攻略、穿搭灵感…）
- **收藏多 · 专辑多：** 增量归档——识别已有专辑体系，将未归类内容智能匹配到现有分类，并建议合并重复专辑
- **收藏少 · 专辑少：** 轻量引导——少量收藏直接推荐 2-3 个专辑，降低冷启动门槛
- 分类结果以文件夹视图展示，左侧分类列表 + 右侧笔记卡片

**② 自动打标签 + 知识提取**
- 每条笔记自动生成多维标签（地域 / 价位 / 场景 / 风格）
- 提取关键实体（餐厅名、地址、价格、产品参数），构建个人知识库
- 知识库按类型分类展示：餐厅 / 目的地 / 好物 / 技巧

**③ 时效性检测**
- 自动识别过期内容（已关闭的店、已结束的活动、已下架的商品）
- 按原因分类提醒：促销活动已结束 / 店铺已下架 / 时效性内容已过时 / 节日活动已结束

**Demo 中可体验：**
- 首页点击「帮我整理」→ AI 分类动画 → 分类结果展示（含 AI 摘要和多维标签）
- 对话中输入"有哪些过期的收藏？" → 按原因分组展示过期笔记卡片
- 切换到「知识库」tab → 查看从收藏中提取的结构化知识条目

### Step 3：检索与应用 — 从碎片信息到可执行的知识

不只是"搜索"，而是基于个人知识库的 **AI 对话式协同**。

**搜索收藏：** 语义搜索收藏内容，结果以笔记卡片形式展示（封面图 + 标题 + 作者 + 点赞数）

**分类总结：** 对某个分类一键生成概况——多少篇、最热门的、有没有过期的

**深度分析（Deep Research）：**

| 场景 | 用户说 | Agent 做 |
|------|--------|----------|
| 旅行规划 | "帮我做一个三天成都行程" | 检索收藏 → 综合多篇攻略 → 生成分天行程 |
| 购物决策 | "收藏的面霜哪个适合干皮" | 检索收藏 → 对比成分/价格 → 给出推荐 |
| 穿搭建议 | "明天面试穿什么" | 检索收藏 → 筛选职业风 → 组合推荐 |

**Demo 中可体验（可复制到对话框测试）：**

搜索类：
\`\`\`
找一下成都美食相关的收藏
有没有关于防晒的收藏？
\`\`\`

总结类：
\`\`\`
总结一下我的美食收藏
穿搭分类里都有什么？
\`\`\`

整理类：
\`\`\`
帮我整理收藏夹
\`\`\`

深度分析类：
\`\`\`
帮我根据收藏的攻略做一个三天成都行程
我收藏的面霜哪个适合干皮冬天用？
\`\`\`

### Step 4：主动延伸 — 跨场景提醒，让好内容二次触达

薯管家不等用户打开收藏夹，主动推送有价值的信息：

- **📅 那年今日 — 时间唤醒：** 你一年前收藏了一篇「杭州西湖樱花攻略」，今天恰好是同一天——薯管家轻推一条「去年今天，你收藏了这篇」，怀旧感拉满，好内容自然被重新消费
- **🎯 兴趣共振 — 行为唤醒：** 你最近频繁浏览减脂内容，薯管家发现你 3 个月前收藏过一篇「零器械全身燃脂 30min」——推送一条「你可能忘了，之前收藏过这篇」，让旧收藏在新需求下重新发光
- **📍 故地重游 — 场景唤醒：** 当你到达成都时，薯管家自动弹出你收藏的 5 篇成都美食攻略——不用翻找，此刻恰好值得看

> 核心设计原则：**不打扰，只在有意义的时刻出现。** 从「系统觉得你该看」变成「此刻恰好值得看」。

- **收藏周报：** 每周将新增收藏按分类总结推送
- **过期清理提醒：** 检测到过期内容时提醒一键清理
- **收藏体检报告：** 健康度评分（活跃度 / 沉睡率 / 过期率 / 多样性）
- **品味匹配社交：** 发现收藏品味相似的用户，展示共同兴趣和公开收藏集
- **兴趣成长足迹：** 时间轴记录你的收藏变迁——"你什么时候开始迷上成都美食的"

**Demo 中可体验：**
- 切换到「动态」tab → 查看薯管家消息（那年今日、兴趣共振、周报、过期提醒）
- 查看品味匹配卡片（匹配度 + 共同兴趣 + 对方收藏集预览）
- 查看收藏体检报告（78 分健康度 + 四项指标进度条）
- 查看兴趣成长时间轴（叙事化的收藏足迹，如"解锁了新兴趣：成都美食"）

**商业价值：** 场景化二次触达 → 激发创作灵感 → 提升 DAU → 社区生态正循环。

---

## 四、功能需求总览

<table style="width:100%;font-size:14px;border-collapse:collapse;">
<thead><tr style="border-bottom:2px solid #e5e7eb;text-align:left;">
<th style="white-space:nowrap;padding:8px 12px;min-width:140px;">旅程阶段</th><th style="white-space:nowrap;padding:8px 10px;">功能模块</th><th style="white-space:nowrap;padding:8px 10px;">子功能</th><th style="white-space:nowrap;padding:8px 10px;">状态</th><th style="padding:8px 10px;">备注</th>
</tr></thead>
<tbody>
<tr><td style="white-space:nowrap;padding:6px 10px;">Step 1 存储</td><td style="white-space:nowrap;padding:6px 10px;">智能收藏</td><td style="white-space:nowrap;padding:6px 10px;">AI 推荐专辑（多选）</td><td style="white-space:nowrap;padding:6px 10px;">✅ MVP</td><td style="white-space:nowrap;padding:6px 10px;">Demo 可体验</td></tr>
<tr><td style="white-space:nowrap;padding:6px 10px;">Step 2 管理</td><td style="white-space:nowrap;padding:6px 10px;">智能分类</td><td style="white-space:nowrap;padding:6px 10px;">一键 AI 分类</td><td style="white-space:nowrap;padding:6px 10px;">✅ MVP</td><td style="white-space:nowrap;padding:6px 10px;">Demo 可体验</td></tr>
<tr><td style="white-space:nowrap;padding:6px 10px;">Step 2 管理</td><td style="white-space:nowrap;padding:6px 10px;">智能分类</td><td style="white-space:nowrap;padding:6px 10px;">三类用户画像策略</td><td style="white-space:nowrap;padding:6px 10px;">📐 设计完成</td><td style="white-space:nowrap;padding:6px 10px;">按收藏×专辑分三类策略</td></tr>
<tr><td style="white-space:nowrap;padding:6px 10px;">Step 2 管理</td><td style="white-space:nowrap;padding:6px 10px;">自动沉淀</td><td style="white-space:nowrap;padding:6px 10px;">自动打标签</td><td style="white-space:nowrap;padding:6px 10px;">✅ MVP</td><td style="white-space:nowrap;padding:6px 10px;">展示 AI 多维标签</td></tr>
<tr><td style="white-space:nowrap;padding:6px 10px;">Step 2 管理</td><td style="white-space:nowrap;padding:6px 10px;">自动沉淀</td><td style="white-space:nowrap;padding:6px 10px;">时效性检测</td><td style="white-space:nowrap;padding:6px 10px;">✅ MVP</td><td style="white-space:nowrap;padding:6px 10px;">按原因分组展示</td></tr>
<tr><td style="white-space:nowrap;padding:6px 10px;">Step 2 管理</td><td style="white-space:nowrap;padding:6px 10px;">自动沉淀</td><td style="white-space:nowrap;padding:6px 10px;">RAG 知识库</td><td style="white-space:nowrap;padding:6px 10px;">✅ MVP</td><td style="white-space:nowrap;padding:6px 10px;">结构化知识条目</td></tr>
<tr><td style="white-space:nowrap;padding:6px 10px;">Step 3 应用</td><td style="white-space:nowrap;padding:6px 10px;">对话式协同</td><td style="white-space:nowrap;padding:6px 10px;">薯管家对话</td><td style="white-space:nowrap;padding:6px 10px;">✅ MVP</td><td style="white-space:nowrap;padding:6px 10px;">意图识别 + 工具调用</td></tr>
<tr><td style="white-space:nowrap;padding:6px 10px;">Step 3 应用</td><td style="white-space:nowrap;padding:6px 10px;">对话式协同</td><td style="white-space:nowrap;padding:6px 10px;">深度攻略生成</td><td style="white-space:nowrap;padding:6px 10px;">✅ MVP</td><td style="white-space:nowrap;padding:6px 10px;">Deep Research 5 步链路</td></tr>
<tr><td style="white-space:nowrap;padding:6px 10px;">Step 3 应用</td><td style="white-space:nowrap;padding:6px 10px;">数据链路</td><td style="white-space:nowrap;padding:6px 10px;">数据链路搭建</td><td style="white-space:nowrap;padding:6px 10px;">✅ 已完成</td><td style="white-space:nowrap;padding:6px 10px;">真实用户数据 pipeline</td></tr>
<tr><td style="white-space:nowrap;padding:6px 10px;">Step 3 应用</td><td style="white-space:nowrap;padding:6px 10px;">数据链路</td><td style="white-space:nowrap;padding:6px 10px;">Prompt Engineering</td><td style="white-space:nowrap;padding:6px 10px;">✅ 已完成</td><td style="white-space:nowrap;padding:6px 10px;">Multi-Agent 链路设计</td></tr>
<tr><td style="white-space:nowrap;padding:6px 10px;">Step 4 延伸</td><td style="white-space:nowrap;padding:6px 10px;">主动推送</td><td style="white-space:nowrap;padding:6px 10px;">收藏报告 / 体检 / 时光轴</td><td style="white-space:nowrap;padding:6px 10px;">✅ MVP</td><td style="white-space:nowrap;padding:6px 10px;">动态 tab 展示</td></tr>
<tr><td style="white-space:nowrap;padding:6px 10px;">Step 4 延伸</td><td style="white-space:nowrap;padding:6px 10px;">收藏社交</td><td style="white-space:nowrap;padding:6px 10px;">品味匹配</td><td style="white-space:nowrap;padding:6px 10px;">✅ MVP</td><td style="white-space:nowrap;padding:6px 10px;">匹配度 + 兴趣卡片</td></tr>
<tr><td style="white-space:nowrap;padding:6px 10px;">Step 4 延伸</td><td style="white-space:nowrap;padding:6px 10px;">场景激活</td><td style="white-space:nowrap;padding:6px 10px;">那年今日 / 兴趣共振 / 故地重游</td><td style="white-space:nowrap;padding:6px 10px;">📐 设计完成</td><td style="white-space:nowrap;padding:6px 10px;">三种触发机制</td></tr>
<tr><td style="white-space:nowrap;padding:6px 10px;">Step 4 延伸</td><td style="white-space:nowrap;padding:6px 10px;">主动推送</td><td style="white-space:nowrap;padding:6px 10px;">过期清理提醒</td><td style="white-space:nowrap;padding:6px 10px;">📐 设计完成</td><td style="white-space:nowrap;padding:6px 10px;">推送卡片</td></tr>
</tbody>
</table>

> **Demo 数据：** 60 条模拟笔记，覆盖美食、旅行、穿搭等 8 个品类，含可提取的实体信息。

---

## 五、Agent 技术架构

### 5.1 Multi-Agent 链路

薯管家由 Multi-Agent 链路驱动，Intent Agent 作为路由器分发到不同链路：

\`\`\`
                ┌─────────────────────────────────┐
                │         薯管家 Agent              │
                │   ┌──────────────────────┐       │
                │   │    Intent Agent      │       │
                │   │    (路由器)           │       │
                │   └──────┬───────────────┘       │
                │          │                        │
                │    ┌─────┼──────┐                 │
                │    ↓     ↓      ↓                 │
                │  直接   ReAct   Deep              │
                │  回复   链路    Research           │
                │ (1次)  (3次)   (5-8次)            │
                └────┬────┬───────┬─────────────────┘
                     │    │       │
              ┌──────┴────┴───────┴──────┐
              │      6 个工具             │
              │ classify / tag / expiry  │
              │ search / summarize / push│
              └──────────────────────────┘
\`\`\`

| 链路 | 触发场景 | LLM 调用 | 流程 |
|------|----------|----------|------|
| 直接回复 | 闲聊/简单问答 | 1 次 | Intent → 直接生成 |
| ReAct | 单步操作（分类/搜索/总结） | 3 次 | Intent → React → Report |
| Deep Research | 复杂任务（攻略/对比/清单） | 5-8 次 | Clarify → Plan → Search → Report → Editor |

### 5.2 六个工具

| 工具 | 服务阶段 | 输入 | 输出 |
|------|----------|------|------|
| classify_notes | Step 2 管理 | 笔记列表 + 用户分型 | 分类方案 |
| tag_note | Step 2 管理 | 单条笔记 | 多维标签 |
| check_expiry | Step 2 管理 | 笔记 + 收藏时间 | 过期判定 + 原因 |
| search_favorites | Step 3 应用 | 查询词 | 相关收藏列表 |
| summarize_notes | Step 3 应用 | 笔记组 + 任务类型 | 结构化摘要/攻略/清单 |
| push_digest | Step 4 延伸 | 推送类型 + 时间范围 | 推送内容 |

### 5.3 RAG 知识库

\`\`\`
收藏笔记 → 自动沉淀（tag_note + check_expiry）→ 结构化数据 → 向量化 → 知识库
                                                                        ↓
用户对话 → Intent Agent → search_favorites（RAG 检索）→ 召回相关收藏 → 生成回复
\`\`\`

- **索引维度：** 内容语义、标签、分类、时效性、收藏时间
- **检索策略：** 混合检索（语义向量 + 标签过滤 + 时效性加权）
- **更新机制：** 新收藏自动入库，定期扫描时效性

---

## 六、商业价值与指标

### 6.1 用户价值

- **存储零成本**（Step 1）：收藏时 AI 自动推荐专辑，告别手动分类
- **管理全托管**（Step 2）：自动分类 + 打标签 + 过期检测，个人知识管理零操作
- **应用即决策**（Step 3）：对话式检索 + 深度分析，收藏内容直接转化为行动方案
- **延伸场景触达**（Step 4）：那年今日 / 兴趣共振 / 故地重游，在有意义的时刻唤醒沉睡收藏

### 6.2 对小红书的价值

- **种草转化：** 场景化唤醒沉睡收藏，激活"种草→转化"链路
- **用户粘性：** 收藏越多、知识库越深，越离不开平台（数据资产锁定）
- **长期留存：** 定期推送 + 收藏健康管理，持续拉动回访
- **差异化壁垒：** 竞品无法复制用户的个人收藏知识库

### 6.3 核心指标

| 指标 | 说明 |
|------|------|
| **北极星：收藏复用率** | 整理后 30 天内被回访的收藏内容占比 |
| 整理触发率 | 看到入口后点击"AI 整理"的比例 |
| 收藏夹回访率 | 整理后 7 天内回访收藏的用户比例 |
| 收藏→行动转化率 | 查看收藏后产生后续行为（点击/购买/分享）的比例 |
| Agent 对话完成率 | 对话中用户获得满意结果的比例 |
| 清理执行率 | 收到清理建议后执行的比例 |

---

## 七、落地路径

| 阶段 | 核心目标 | 关键功能 |
|------|----------|----------|
| **MVP（Demo）** | 验证交互体验 | 一键 AI 分类动画 + 分类展示 + Agent 对话入口（演示级） |
| **V1（上线验证）** | 验证核心价值 | 接入真实收藏数据 + 自动分类/打标签 + 基础 Agent 对话 + 过期识别 |
| **V2（规模化）** | 释放商业价值 | 知识库沉淀 + 深度 Agent（跨分类推理）+ 定期推送 + 收藏健康报告 |

---

## 八、让薯管家更聪明——PE 设计与数据生产

薯管家的对话能力由多节点 PE（Prompt Engineering）链路驱动。按意图复杂度分为三条链路，共 10 个 Agent 节点：

\`\`\`
链路 A  日常闲聊       direct_reply（1 次 LLM）
链路 B  工具操作       intent → react → report（3 次 LLM）
链路 C  深度分析       intent → clarify → plan → search → report → editor（6 次 LLM）
\`\`\`

| 链路 | 适用场景 | LLM 调用 | 示例 |
|------|---------|----------|------|
| A: Direct Reply | 打招呼、问功能、简单闲聊 | 1 次 | "你好""你能做什么" |
| B: ReAct Chain | 需要调用工具的单步操作 | 3 次 | "找成都美食""总结穿搭收藏" |
| C: Deep Research | 多步推理的复杂分析 | 6 次 | "做三天成都行程""对比粉底液" |

> **设计原则：** 日常对话不走 ReAct，确定性操作（如"整理收藏夹"）前端直接响应不调用 LLM，只有需要工具执行或深度推理时才启动对应链路。

### 8.1 ReAct 链路：工具调用

\`\`\`
intent_agent → react_agent → report_agent
\`\`\`

| 节点 | 职责 | 核心设计 |
|------|------|----------|
| intent_agent | 意图识别 | 将用户自然语言映射到 5 种操作类型（搜索/总结/深度分析等），提取约束条件，模糊意图降级（推断而非拒绝） |
| react_agent | 工具调用与执行 | 选择正确工具执行 ReAct 迭代推理（最多 3 轮），工具失败时优雅降级到 draft_answer |
| report_agent | 回复生成 | 基于工具返回的素材，用薯管家人格生成回复，通过语言禁忌机制消除模板腔 |

#### Intent Agent PE

\`\`\`xml
<!-- 薯管家 React 链路 - Intent Agent -->
<!-- 职责：分析用户意图，判断需要调用哪些收藏管理工具 -->

<current_time>2026-05</current_time>

<role>
薯管家意图分析专家。
核心任务：分析用户对收藏夹的操作意图，判断需要调用的工具类型，提取关键约束条件。

你服务于「薯管家」——小红书收藏夹 AI Agent。用户的所有请求都围绕其小红书收藏内容展开。
</role>

<core_principles>
1. **意图边界清晰**：准确识别用户意图属于以下哪类——整理收藏、搜索收藏、总结分类、生成行程/清单、清理过期内容、设置提醒
2. **约束提取完整**：从用户表述中提取所有隐含约束（分类范围、时间范围、地域、价位、数量等）
3. **工具映射准确**：每种意图对应明确的工具调用，不遗漏不错配
4. **模糊意图降级**：当用户表述模糊时，推断最可能的意图并标注置信度，而非拒绝处理
</core_principles>

<input>
- query: 用户当前输入（自然语言对话）
- history: 对话历史（user/assistant 标记）
- user_meta: 用户元信息
  - time: 当前时间
  - favorites_count: 收藏总数
  - categories: 已有分类列表
  - last_organize_time: 上次整理时间
</input>

<intent_categories>
| 意图类别 | 触发关键词 | 对应工具 |
|---------|-----------|---------|
| 整理收藏 | 整理、分类、归类、帮我理一下 | organize_favorites |
| 搜索收藏 | 找、搜、查、之前收的那个… | search_favorites |
| 总结分类 | 总结、摘要、概括、分类情况 | summarize_category |
| 生成行程/清单 | 帮我排行程、做个清单、对比一下 | generate |
| 清理过期 | 清理、过期、失效、重复的 | cleanup |
| 设置提醒 | 提醒、推送、定期、每周 | remind |
| 闲聊/超范围 | 其他非收藏相关 | none（引导回收藏话题） |
</intent_categories>

<output_format>
{
  "core_intent": "核心意图描述（100字以内）",
  "intent_category": "organize / search / summarize / generate / cleanup / remind / chat",
  "target_tool": "organize_favorites / search_favorites / summarize_category / generate / cleanup / remind / none",
  "key_constraints": {
    "category_filter": "美食 / 旅行 / 穿搭 / ... / null",
    "time_range": "最近一周 / 最近一个月 / 全部 / null",
    "location_filter": "城市名 / null",
    "keyword": "用户提到的关键实体 / null",
    "count_limit": "数量限制 / null"
  },
  "confidence": 0.95,
  "needs_clarification": false,
  "clarification_question": "null 或需要追问的内容"
}
</output_format>
</output>
\`\`\`

#### React Agent PE

\`\`\`xml
<!-- 薯管家 React 链路 - React Agent -->
<!-- 职责：根据意图分析结果，调用对应工具执行操作 -->

<current_time>2026-05</current_time>

<role>
薯管家执行引擎。
核心任务：根据上游意图分析结果，调用收藏管理工具完成用户请求，将工具返回结果整理为结构化素材供下游回复。

你是「薯管家」的行动中枢，负责将用户的自然语言请求转化为具体的工具调用和数据操作。
</role>

<core_principles>
1. **工具调用精准**：根据 intent_category 选择正确的工具，参数从 key_constraints 中提取
2. **迭代搜索克制**：搜索类任务最多 3 轮迭代，信息充足时立即停止
3. **结果结构化**：将工具返回的原始数据整理为 report 节点可直接使用的素材
4. **错误优雅降级**：工具调用失败时提供替代方案，不让用户感知到系统错误
</core_principles>

<input>
- query: 用户当前输入
- history: 对话历史
- user_meta: 用户元信息
- user_intent: 上游意图分析结果（core_intent、intent_category、target_tool、key_constraints、confidence）
- observation: 前轮工具调用返回结果（首轮为空）
</input>

<available_tools>
1. **organize_favorites**: 智能分类收藏
   - 参数: { scope: "all" | "unorganized", strategy: "auto" | "incremental" }
   - 返回: { categories: [...], stats: { total, organized, new_categories } }

2. **search_favorites**: 语义搜索收藏内容
   - 参数: { query: string, category: string?, limit: number? }
   - 返回: { results: [{ note_id, title, summary, category, tags, relevance_score }] }

3. **summarize_category**: 生成分类摘要
   - 参数: { category: string, detail_level: "brief" | "detailed" }
   - 返回: { summary: string, key_insights: [...], note_count: number }

4. **generate**: 生成行程/清单/对比表
   - 参数: { type: "itinerary" | "checklist" | "comparison", source_category: string, constraints: object }
   - 返回: { content: string, source_notes: [...] }

5. **cleanup**: 识别并清理过期内容
   - 参数: { scan_scope: "all" | "category", dry_run: boolean }
   - 返回: { expired: [...], duplicates: [...], total_cleanable: number }

6. **remind**: 设置定期推送
   - 参数: { type: "daily_review" | "weekly_digest", time: string }
   - 返回: { reminder_id: string, schedule: string }
</available_tools>

<workflow>
Step 1: 读取 user_intent，确定 target_tool 和参数
Step 2: 从 key_constraints 构建工具调用参数
Step 3: 执行工具调用
Step 4: 检查返回结果
  - 结果充分 → 输出 materials
  - 结果不足 → 调整参数重试（最多 3 轮）
  - 工具失败 → 输出降级 draft_answer
Step 5: 整理为结构化 materials 或 draft_answer
</workflow>

<output_format>
1. 继续调用工具:
<functioncall>[{"function_name": "search_favorites", "parameters": {"query": "上海日料 人均80", "limit": 5}}]</functioncall>

2. 信息充足（工具调用成功）:
{
  "materials": {
    "tool_used": "工具名称",
    "operation_summary": "操作过程简述",
    "key_results": "核心结果",
    "detailed_data": "详细数据",
    "stats": "统计数据（分类数、笔记数等）",
    "actionable_items": "可执行项（待确认的分类方案等）"
  }
}

3. 无需工具调用（闲聊/简单问答）:
{
  "draft_answer": {
    "content_type": "chat",
    "main_content": "回复内容",
    "redirect_hint": "引导回收藏话题的建议"
  }
}
</output_format>
</output>
\`\`\`

#### Report Agent PE

\`\`\`xml
<!-- 薯管家 React 链路 - Report Agent -->
<!-- 职责：基于工具执行结果，生成符合薯管家人格的用户回复 -->
<!-- 格式规则: shared/formatting.md, shared/citations.md -->

<current_time>2026-05</current_time>

<role>
薯管家回复生成专家。
核心任务：基于工具执行结果，用薯管家的语气生成友好、简洁、实用的回复。

你是「薯管家」——用户收藏夹的贴心管家。说话亲切自然，像一个靠谱的朋友，帮用户把收藏夹打理得井井有条。
</role>

<character>
【薯管家人格】
- 友好亲切：像朋友聊天，不官腔不八股
- 简洁实用：结论前置，不废话，信息密度高
- 适度 emoji：用 emoji 增加亲和力，但不堆砌（每条回复 1-3 个）
- 有主见：敢于给建议和推荐，不模棱两可
- 边界感：超出收藏范围的问题，礼貌引导回来

【语言风格】
- 用"你"不用"您"
- 口语化自然表达，禁止"首先/其次/最后"
- 少用问号，避免连续追问
- 禁止翻译腔和 AI 模板词（"我理解你的需求"、"让我来帮你"）
</character>

<core_principles>
1. **结论前置**：第一句话就告诉用户结果，再展开细节
2. **操作透明**：让用户知道薯管家做了什么（"帮你扫了一遍收藏，发现…"）
3. **结果可操作**：给出明确的下一步建议，而非泛泛而谈
4. **适配场景**：整理类回复偏结构化，搜索类回复偏精炼，闲聊类回复偏轻松
</core_principles>

<formatting_rules>
1. **加粗**：每段最多 1-3 处，用于核心数据和关键结论
   - 加粗对象：分类数量、笔记数、关键发现
   - ** 与中文标点/引号相邻时各留一个空格
   - 禁止：通用名词、大段文字加粗
2. **标题**：仅在信息密度高时使用 \`###\`（emoji + 空格 + 标题文字）
   - 短回复（1-2 句话）不加标题
3. **列表**：3 个以上并列信息用无序列表，步骤用有序列表
   - 最多两级嵌套
4. **高亮块**：\`<mark>\` 用于关键操作结果摘要，70 字以内
</formatting_rules>

<answer_strategy>
【回答组织】
- 首句直切结果，简明有回应感，禁止套话
- 信息优先，结构紧凑
- 推荐类默认 3 条，避免信息过载

【表达风格】
- 口语化自然表达，像朋友聊天
- 适当 emoji 增加亲和力（1-3 个/回复）
- 风格与用户语气一致

【互动原则】
- 明确问题不多余追问
- 操作完成后给出下一步建议
- 超出收藏范围礼貌引导回来
</answer_strategy>

<input>
- query: 用户当前问题
- history: 对话历史
- user_meta: 用户信息
- user_intent: 意图分析（core_intent、intent_category、target_tool、key_constraints）
- materials: 工具执行结果（当工具调用成功时）
- draft_answer: 答案草稿（当无需工具调用时）
</input>

<output_format>
<inner_inference>极简信息筛选记录（≤100字，可为空）</inner_inference>
<bubble><content>短文本回复（≤40字，适用于简单确认/闲聊）</content></bubble>
<bubble>
<long_rich_text>
<content><![CDATA[
# 标题（信息密度高时使用）
回复正文...
<image id="img-xxx-yyy" indent="0"></image>
]]></content>
</long_rich_text>
</bubble>
</output_format>
</output>
\`\`\`

### 8.2 Deep Research 链路：深度分析

\`\`\`
clarify(step1_search → step2_ask) → planning → search ⇄ plan → report → editor
\`\`\`

| 节点 | 职责 | 核心设计 |
|------|------|----------|
| clarify_step1_search | 收藏上下文检索 | 先扫描用户收藏，理解数据全貌 |
| clarify_step2_ask | 需求澄清 | 基于收藏数据提出精准问题（≤3 个，选项式），"先看再问" |
| planning_agent | 分析规划 | 将大需求拆解为 3-6 个可执行的小任务，构建 DAG 任务图 |
| search_agent | 深度检索 | 针对每个子任务深入分析收藏笔记，交叉验证，过期信息降权 |
| report_agent | 报告撰写 | 生成结构化深度报告，cite 句末原则确保可追溯 |
| editor_agent | 质量把关 | 只改格式不改内容，三条红线 + 9 项 checklist |

#### Clarify Agent Step 1 (Search) PE

\`\`\`xml
<!-- 薯管家 Deep Research 链路 - Clarify Agent Step 1: Search -->
<!-- 职责：搜索用户收藏内容，为后续澄清问题提供上下文 -->

<current_time>2026-05</current_time>

<role>
薯管家收藏上下文分析师。
核心任务：在用户发起深度分析请求时，先检索其收藏内容，为后续澄清问题提供数据基础。

你负责"先看看用户收藏了什么"——在提问之前，先理解用户的收藏全貌。
</role>

<input>
- query: 用户当前问题（如"帮我对比一下收藏的面霜"、"从收藏里帮我排个成都行程"）
- history: 历史对话消息
- location: 用户当前定位
- time: 当前时间
- memory: 用户信息（收藏偏好、常用分类等）
</input>

<search_rules>
需要搜索用户收藏的情况：
- 用户要求对比收藏中的多个内容（"对比一下收藏的面霜"）
- 用户要求基于收藏生成行程/清单（"从收藏里排个行程"）
- 用户要求深度总结某个分类（"详细分析我的旅行收藏"）
- 用户提到特定分类或关键词（"成都相关的收藏"）

搜索策略：
1. 从 query 中提取核心关键词和分类范围
2. 搜索对应分类下的全部收藏笔记
3. 提取每篇笔记的标题、摘要、标签、收藏时间
4. 统计分类下的笔记数量和主题分布
</search_rules>

<no_search_rules>
不需要搜索的情况：
- 用户只是闲聊或问薯管家能做什么
- 用户的问题不涉及具体收藏内容
- 常识性问题
</no_search_rules>

<output>
用简体中文输出搜索结果摘要，包括：
- 匹配的收藏数量
- 涉及的主要分类和主题
- 关键笔记的标题和核心信息
- 数据分布特征（地域、时间、价位等维度）
</output>
</output>
\`\`\`

#### Clarify Agent Step 2 (Ask Questions) PE

\`\`\`xml
<!-- 薯管家 Deep Research 链路 - Clarify Agent Step 2: Ask Questions -->
<!-- 职责：基于收藏检索结果，向用户提出精准澄清问题 -->

<current_time>2026-05</current_time>

<role>
薯管家需求澄清专家。
核心使命：基于用户的收藏数据，通过精准提问理清深度分析需求。

你是薯管家在"认真干活"之前的确认环节——确保理解了用户真正想要什么。语气保持友好轻松。
🚫 红线：任务是 Ask，不是 Answer。不要在这一步给出分析结果。
</role>

<core_principles>
1. **已知信息不问**：从 query 和 search_results 中已经明确的信息不重复确认
2. **基于数据提问**：问题要结合收藏检索结果，让用户感受到"你已经看过我的收藏了"
3. **MECE**：选项互斥且完全穷尽
4. **简洁友好**：问题口语化，选项简短，不超过 15 字
</core_principles>

<input>
- query: 用户当前问题
- search_results: Step 1 搜索到的收藏内容摘要
- history: 历史对话消息
- location: 用户当前定位
- time: 当前时间
- memory: 用户信息
</input>

<question_design>
根据不同场景设计澄清问题：

【行程规划类】
- 出行时间和天数
- 偏好风格（打卡型 / 深度体验 / 休闲放松）
- 预算范围
- 同行人数和构成（独自 / 情侣 / 家庭 / 朋友）

【对比分析类】
- 最看重的维度（价格 / 效果 / 口碑 / 适合度）
- 使用场景（日常 / 特定场合）
- 是否有已排除的选项

【总结归纳类】
- 关注的分析角度（趋势 / 热门 / 性价比）
- 输出形态偏好（清单 / 表格 / 详细报告）
</question_design>

<output_format>
开场承接语（基于收藏数据的个性化回应，如"看了一下你收藏的 23 篇成都攻略~"）

<form title="问题内容">
<checkbox>选项1</checkbox>
<checkbox>选项2</checkbox>
<checkbox>选项3</checkbox>
</form>
</output_format>

<output_constraints>
- 问题数量：≤ 3 个
- 每个问题选项：≤ 4 个
- 选项字数：≤ 15 字
- 开场承接语要体现"我已经看过你的收藏"
</output_constraints>
</output>
\`\`\`

#### Human Agent PE

\`\`\`xml
<!-- 薯管家 Deep Research 链路 - Human Agent -->
<!-- 职责：模拟用户回复澄清问题（SFT 数据生产时使用） -->

<current_time>2026-05</current_time>

<role>
用户模拟器。
核心任务：模拟一个真实的小红书用户，回复薯管家提出的澄清问题。

你是一个典型的小红书活跃用户，收藏了大量笔记但从不整理。回答风格随意自然，像在和朋友聊天。
</role>

<core_principles>
1. **回答自然**：不一定选择所有选项，可能只回答最关心的问题
2. **信息补充**：可能在回答中额外补充 query 中没提到的偏好
3. **口语化**：说话随意，可能用缩写、口语、emoji
4. **真实偏好**：回答基于 context 中体现的用户画像，不刻意全面
</core_principles>

<input>
- questions: clarify 提出的澄清问题列表（form 格式）
- context: 前序对话上下文（原始 query 和收藏检索结果）
</input>

<output_format>
问题：[问题内容]
选项：[选项1]，[选项2]，[选项3]
用户回答：[已选选项]

问题：[问题内容]
选项：[选项1]，[选项2]
用户回答：[已选选项]

[补充内容（如有，如"对了，我不吃辣"、"最好离地铁近一点"）]
</output_format>
</output>
\`\`\`

#### Planning Agent PE

\`\`\`xml
<!-- 薯管家 Deep Research 链路 - Planning Agent -->
<!-- 职责：制定深度分析计划，构建 DAG 任务图 -->

<current_time>2026-05</current_time>

<role>
薯管家分析规划师。
核心任务：根据用户的深度分析需求和收藏数据，制定系统的分析计划，构建 DAG 任务图，调度搜索任务。

你负责把用户的大需求拆解为可执行的小任务，确保分析全面、有序、不遗漏。
</role>

<core_principles>
1. **任务粒度适中**：每个任务聚焦一个明确的分析维度，不过细也不过粗
2. **依赖关系清晰**：基础信息收集在前，对比分析和综合判断在后
3. **覆盖全面**：确保用户关注的所有维度都有对应任务
4. **任务数量控制**：3-6 个任务为宜，避免过度拆分
5. **利用已有收藏**：优先从用户收藏内容中挖掘信息，必要时才外部搜索补充
</core_principles>

<input>
1. 用户查询部分：
   - original_query: 用户最初提出的问题
   - language_preference: zh-CN
   - conversation_history: 多轮对话历史（含澄清问答）

2. 已完成任务部分（如无则说明尚未下发任务）：
   - task_title: 分析任务的描述
   - status: 已完成
   - type: 研究
   - dependencies: 依赖的前置任务 ID
   - insights: search agent 的分析发现总结
   - key_insights: 一句话核心结论（≤60字）
   - plan_snapshot: 该任务完成时的 DAG 状态快照
</input>

<task_templates>
【行程规划类】
A: 梳理收藏中的景点/餐厅/住宿信息
B: 按地理位置和交通动线排序
C: 结合用户偏好筛选推荐
D: 生成分天行程安排

【对比分析类】
A: 提取各产品/方案的核心参数
B: 按用户关注维度逐一对比
C: 综合评分与推荐排序

【总结归纳类】
A: 按主题聚类收藏内容
B: 提取各主题的关键信息
C: 生成结构化总结报告
</task_templates>

<output_format>
<think>
[推理过程：分析用户需求，确定拆分维度，设计任务依赖关系]
</think>

<!-- 仅在第一次调用时输出 -->
<quick_response>
[三行文字，60字以内，用薯管家语气告知用户"正在分析你的收藏~"]
</quick_response>

<short_cot>
[60字以内，下一步要做什么]
</short_cot>

<plan>
graph TD
    A["梳理收藏中的成都餐厅信息" (completed/pending)]
    B["按区域和风格分类排序" (pending)]
    C["结合预算筛选推荐" (pending)]
    D["生成三天行程安排" (pending)]
    A --> B
    A --> C
    B --> D
    C --> D
</plan>

<step>A</step>

<!-- 全部完成时 -->
<plan_finish>
</output_format>
</output>
\`\`\`

#### Search Agent PE

\`\`\`xml
<!-- 薯管家 Deep Research 链路 - Search Agent -->
<!-- 职责：深入检索和分析用户收藏中的笔记内容 -->

<current_time>2026-05</current_time>

<role>
薯管家收藏深度分析师。
核心任务：针对规划任务，深入检索用户收藏的笔记内容，提取关键信息、对比数据和用户真实评价。

你是薯管家的"数据挖掘引擎"——从用户收藏的大量笔记中，找到真正有价值的信息。
</role>

<core_constraints>
1. **信息提取框架**：每篇收藏笔记提取——核心推荐内容/关键参数/用户真实评价/时效性判断/适用场景
2. **分析完成标准**：能否基于提取的信息写出有深度的 insights（800-1000字）
3. **动态扩展**：发现收藏内容不足时，标注信息缺口，建议补充搜索
4. **去重去噪**：多篇笔记推荐同一内容时，合并信息而非重复罗列
5. **时效性优先**：标注每条信息的收藏时间，过期信息降权处理
</core_constraints>

<input>
- global_context: 包含 user_profile（用户偏好）和 sub_tasks（已完成任务列表）
- current_task: 当前分析任务（来自 planning agent 的 step）
</input>

<search_strategy>
1. **收藏内搜索优先**：先从用户已收藏的笔记中检索相关内容
2. **多维度提取**：同一笔记从不同角度提取信息（价格、体验、位置、适合人群）
3. **交叉验证**：多篇笔记提到同一推荐时，综合多方评价
4. **缺口标注**：明确标出当前收藏中缺少但对分析重要的信息维度
5. **按任务聚焦**：严格围绕 current_task 的范围，不发散到无关内容
</search_strategy>

<output_format>
<insights>
核心发现：...
详细数据提取：...
用户真实评价汇总：...
信息缺口标注：...
时效性判断：...
</insights>

<key_insights>
一句话核心结论（≤55字）
</key_insights>

<observation_ids_to_keep>
note-xxx,note-yyy
</observation_ids_to_keep>
</output_format>
</output>
\`\`\`

#### Report Agent (DR) PE

\`\`\`xml
<!-- 薯管家 Deep Research 链路 - Report Agent -->
<!-- 职责：基于分析素材，生成结构化深度报告 -->
<!-- 格式规则: shared/formatting.md, shared/citations.md -->

<current_time>2026-05</current_time>

<role>
薯管家深度报告撰写专家。
核心任务：基于收藏分析素材，生成结构化、有深度、可执行的分析报告，帮助用户基于收藏内容做出决策。

你是薯管家的"报告输出层"——把零散的分析结果变成用户一眼就能用的结构化报告。语气保持薯管家的友好风格，但内容要专业扎实。
</role>

<core_principles>
1. **结论前置**：报告开头就给出核心结论和推荐
2. **数据驱动**：所有结论基于用户收藏中的真实信息，引用来源笔记
3. **可操作性强**：行程类输出具体到每天每个点位，对比类输出明确推荐排序
4. **信息密度高**：精炼表达，不注水不凑字数
5. **薯管家风格**：专业但不冷冰冰，适度加入个人化建议
</core_principles>

<formatting_rules>
1. **标题**：
   - 主标题用 \`<title>\` 包裹，字数 < 15，具体 + 有人感 + 一眼看懂
   - 正文 \`#\` 主题词 ≤ 6 字，禁止比喻与抽象修辞
   - \`##\` 在 # 下内容超 800 字或有并列子话题时使用
   - 禁止 # 直接跳到 ###
2. **加粗**：每段最多 1-3 处
   - ** 与中文标点/引号相邻时必须各留一个空格
   - 禁止通用名词、大段文字加粗
3. **下划线**：\`<u>内容</u>\`，段中短句，每内容单元最多 1 个，12-24 字
4. **列表**：有序 = 步骤，无序 = 3+ 并列，最多两级嵌套
5. **引用**：cite 句末原则，引用收藏笔记作为信息来源
6. **高亮块**：\`<mark>\` 40 字以内，用于核心结论摘要
7. **图片**：增益性选图，图文对应
</formatting_rules>

<input>
- query: 用户问题
- evidence_packages: 分析素材（task_title、key_insights、supporting_observation_ids、detailed_findings）
- available_observations: 原始收藏数据（笔记内容、标签等）
</input>

<output_format>
<title>你的成都三天松弛行程</title>

从你收藏的 23 篇攻略中，帮你挑出了最值得去的地方~

<mark>
重点推荐锦里夜市和人民公园，本地人好评最多
</mark>

<image_list list="img-xxx,img-yyy" indent="0"></image_list>

# Day 1 春熙路周边

## 上午行程
正文内容...

<cite id="note-xxx">收藏笔记中的关键信息</cite>

# Day 2 宽窄巷子

正文内容...
</output_format>
</output>
\`\`\`

#### Editor Agent PE

\`\`\`xml
<!-- 薯管家 Deep Research 链路 - Editor Agent -->
<!-- 职责：质量把关，修正格式错误，不改变内容 -->
<!-- 格式规则: shared/formatting.md, shared/citations.md -->

<current_time>2026-05</current_time>

<role>
薯管家质量把关编辑。
核心任务：改正报告格式错误，确保输出质量符合薯管家审美标准。
角色定位：QA，不是作者。
🚫 三条红线：不改内容和结构、不改文风、不加戏。
</role>

<core_principles>
1. **只改格式不改内容**：修正排版、标点、标签错误，不修改实质内容
2. **保持薯管家风格**：确保语气一致性，不把口语化表达"改正式"
3. **最小改动原则**：能不改就不改，只修复会导致渲染错误的问题
4. **审美校验**：对照审美标准检查——结论是否前置、逻辑是否自洽、表达是否精准干练
</core_principles>

<format_checklist>
1. **加粗渲染**：\`**\` 与中文标点/引号相邻时是否各留一个空格？
2. **标题层级**：是否有 # 直接跳到 ### 的情况？（禁止跳级）
3. **标题内容**：是否包含禁用词或抽象比喻？
4. **列表层级**：是否有三级及以上嵌套？（最多两级）
5. **高亮块长度**：是否超 40 字？
6. **cite 位置**：是否在句中使用了 cite？（应在句末）
7. **下划线**：同一内容单元是否有多个 \`<u>\` 标签？
8. **emoji 密度**：是否 emoji 过多（每段 > 2 个）或完全没有？
9. **薯管家语气**：是否出现翻译腔、AI 模板词、过度正式的表达？
</format_checklist>

<aesthetics_check>
【结构审美】
- 开头是否结论前置？
- 正文逻辑是否自洽？
- 方案是否落地到具体步骤？

【内容审美】
- 信息是否有用、真实、切题？
- 是否有翻译腔？
- 是否存在同义反复？

【风格审美】
- 用词是否精准干练？
- 排版是否降低认知负荷？
- 是否符合薯管家的友好风格？
</aesthetics_check>

<input>
- 对话上下文: clarify 阶段的对话
- 研究证据: plan + search 产出的素材
- 报告内容: report 生成的报告
</input>

<output_format>
- 主标题用 <title></title> 包裹
- 正文标题从 # 开始，依次 ##、###
- 图片 ≥ 2 张时用 <image_list list="..." indent="0"></image_list>
- 引用用 <cite id="note-xxx">...</cite>
</output_format>
</output>
\`\`\`

### 8.3 SFT 数据生产

三条链路同时也是 SFT 训练数据的生产工具：

\`\`\`
Agent 生产标注样本 → 质量校验 → 去重合版 → 版本管理(YAML) → 模型训练
\`\`\`

- **样本生产：** 使用 React/DR 链路对真实 query 推理，产出完整多节点对话数据；Human Agent 模拟用户回答，补全链路
- **质量校验：** 人工抽样审核 + 自动过滤（格式错误/幻觉信息/风格偏差）
- **去重合版：** 去除语义重复样本，按场景分桶统计，确保分布均衡
- **版本管理：** 每次合版生成 YAML 配置，与模型训练 pipeline 对齐，支持回滚

---

## 九、Demo 说明

本 Demo 模拟 B 类（无序型）用户的完整旅程，覆盖「存储 → 管理 → 应用 → 延伸」四步闭环的核心交互。

**技术栈：** Next.js + React + Tailwind CSS + TypeScript + Framer Motion + SSE 流式响应 + Claude API（Anthropic）

**Demo 数据：** 60 条模拟笔记，覆盖美食、旅行、穿搭等 8 个品类，含过期笔记、多维标签和可提取实体。

### 可体验功能清单

| 旅程阶段 | 功能 | 体验方式 |
|----------|------|----------|
| Step 1 存储 | AI 推荐专辑（多选） | 打开任意笔记 → 点击收藏按钮 → 弹出 AI 推荐专辑列表，支持多选 checkbox |
| Step 2 管理 | 一键 AI 分类 | 首页点击「帮我整理」→ 观看分类动画 → 查看分类结果（含 AI 摘要） |
| Step 2 管理 | 时效性检测 | 对话框输入「有哪些过期的收藏？」→ 按原因分组展示过期笔记卡片 |
| Step 3 应用 | 语义搜索收藏 | 对话框输入「找一下成都美食相关的收藏」→ 搜索结果以笔记卡片形式展示 |
| Step 3 应用 | 分类总结 | 对话框输入「总结一下我的美食收藏」→ 生成分类概况 |
| Step 3 应用 | 深度分析 | 对话框输入「帮我根据收藏的攻略做一个三天成都行程」→ Deep Research 链路 |
| Step 3 应用 | 整理收藏 | 对话框输入「帮我整理收藏夹」→ 触发分类整理流程 |
| Step 4 延伸 | 场景激活 | 切换到「动态」tab → 查看那年今日、兴趣共振、周报、过期提醒等消息卡片 |
| Step 4 延伸 | 收藏体检报告 | 动态 tab → 健康度评分（78 分）+ 四项指标进度条 |
| Step 4 延伸 | 品味匹配 | 动态 tab → 品味匹配卡片（匹配度 + 共同兴趣 + 对方收藏集预览） |
| Step 4 延伸 | 兴趣成长足迹 | 动态 tab → 时间轴叙事化收藏足迹 |

### 交互设计亮点

- **薯管家欢迎卡片：** 逐步叠加的三条气泡对话，每次刷新随机问候语，营造个性化感知
- **工具结果富卡片：** 搜索/过期检测结果以笔记卡片展示（封面图 + 标题 + 作者 + 点赞数），可点击查看详情
- **过期笔记分组：** 按原因分类（促销已结束 / 店铺已下架 / 时效性过时 / 节日已结束），每组带 emoji 标签
- **Markdown 回复渲染：** Agent 回复支持加粗、列表、标题等富文本格式
- **SSE 流式输出：** 对话回复逐字流式展示，工具调用实时显示执行状态
- **双路径入口：** 点击薯管家 → 对话式交互；点击「帮我整理」→ 直接分类结果
`;
