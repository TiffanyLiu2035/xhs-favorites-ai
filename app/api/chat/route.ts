import { NextRequest } from 'next/server';
import { mockNotes } from '../../data/mock-notes';

const BASE_URL = process.env.ANTHROPIC_BASE_URL!;
const AUTH_TOKEN = process.env.ANTHROPIC_AUTH_TOKEN!;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-6';

// ---------- Tool definitions (only given to React node) ----------

const tools = [
  {
    name: 'organize_favorites',
    description: '整理用户的收藏夹，自动分类所有收藏的笔记',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [] as string[],
    },
  },
  {
    name: 'search_favorites',
    description: '在用户的收藏中搜索特定内容',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string' as const, description: '搜索关键词' },
      },
      required: ['query'],
    },
  },
  {
    name: 'summarize_category',
    description: '为指定分类的收藏内容生成摘要',
    input_schema: {
      type: 'object' as const,
      properties: {
        category_name: { type: 'string' as const, description: '分类名称' },
      },
      required: ['category_name'],
    },
  },
];

// ---------- Real tool execution (from mock data, zero LLM cost) ----------

interface NoteSnippet {
  id: string;
  title: string;
  coverUrl: string;
  author: string;
  likeCount: number;
  type: 'image' | 'video';
  isExpired?: boolean;
  expiredReason?: string;
}

interface ToolResult {
  text: string;
  matchedNotes: NoteSnippet[];
}

function toSnippet(n: typeof mockNotes[number]): NoteSnippet {
  return {
    id: n.id,
    title: n.title,
    coverUrl: n.coverUrl,
    author: n.author.name,
    likeCount: n.likeCount,
    type: n.type,
    isExpired: n.isExpired,
    expiredReason: n.expiredReason,
  };
}

function simulateToolResult(
  toolName: string,
  input: Record<string, string>
): ToolResult {
  switch (toolName) {
    case 'organize_favorites': {
      const categoryMap: Record<string, number> = {};
      for (const note of mockNotes) {
        const cats = note.tags || [];
        const mainCat = cats[0] || '其他';
        categoryMap[mainCat] = (categoryMap[mainCat] || 0) + 1;
      }
      const catList = Object.entries(categoryMap)
        .sort(([, a], [, b]) => b - a)
        .map(([cat, count]) => `${cat}(${count})`)
        .join('、');
      const expiredCount = mockNotes.filter((n) => n.isExpired).length;
      return {
        text: `已将你的 ${mockNotes.length} 条收藏整理为 ${Object.keys(categoryMap).length} 个分类：${catList}。发现 ${expiredCount} 条可能过期的内容。`,
        matchedNotes: [],
      };
    }
    case 'search_favorites': {
      const query = (input.query || '').toLowerCase();
      const keywords = query.split(/\s+/).filter(Boolean);

      const expiryKeywords = ['过期', '失效', '过时', '无效', 'expired', '下架', '关闭', '结束'];
      const isExpiryQuery = expiryKeywords.some((ek) => query.includes(ek));

      if (isExpiryQuery) {
        const expired = mockNotes.filter((n) => n.isExpired);
        if (expired.length > 0) {
          return {
            text: `发现 ${expired.length} 条可能过期的收藏：`,
            matchedNotes: expired.map(toSnippet),
          };
        }
        return { text: '你的收藏内容都还有效，暂未检测到过期内容 ✅', matchedNotes: [] };
      }

      const matched = mockNotes.filter((note) => {
        const searchable = [
          note.title,
          note.content || '',
          ...(note.tags || []),
          ...(note.aiTags || []),
        ].join(' ').toLowerCase();
        return keywords.some((kw) => searchable.includes(kw));
      });
      if (matched.length > 0) {
        const top = matched.slice(0, 8);
        return {
          text: `找到 ${matched.length} 条相关收藏：`,
          matchedNotes: top.map(toSnippet),
        };
      }
      return { text: `没有找到与「${input.query}」相关的收藏内容。试试换个关键词？`, matchedNotes: [] };
    }
    case 'summarize_category': {
      const categoryName = (input.category_name || '').toLowerCase();
      const matched = mockNotes.filter((note) => {
        const searchable = [
          ...(note.tags || []),
          ...(note.aiTags || []),
          note.title,
        ].join(' ').toLowerCase();
        return searchable.includes(categoryName);
      });
      if (matched.length === 0) {
        return { text: `未找到与「${input.category_name}」相关的收藏。`, matchedNotes: [] };
      }
      const sorted = [...matched].sort((a, b) => b.likeCount - a.likeCount);
      const expiredInCat = matched.filter((n) => n.isExpired).length;
      const topNote = sorted[0];
      return {
        text: `你收藏了 ${matched.length} 篇「${input.category_name}」相关笔记。${expiredInCat > 0 ? `其中 ${expiredInCat} 篇可能已过期。` : ''}最受欢迎的是「${topNote.title}」(${topNote.likeCount} 赞)。`,
        matchedNotes: sorted.slice(0, 6).map(toSnippet),
      };
    }
    default:
      return { text: '未知操作', matchedNotes: [] };
  }
}

// ---------- Claude API helper ----------

async function callClaude(
  systemPrompt: string,
  messages: Array<{ role: string; content: unknown }>,
  options: { tools?: typeof tools; maxTokens?: number } = {}
) {
  const body: Record<string, unknown> = {
    model: MODEL,
    max_tokens: options.maxTokens || 1000,
    system: systemPrompt,
    messages,
  };
  if (options.tools) {
    body.tools = options.tools;
  }

  const response = await fetch(`${BASE_URL}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': AUTH_TOKEN,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Claude API error:', response.status, errorText);
    throw new Error(`Claude API error: ${response.status}`);
  }

  return response.json();
}

function extractText(data: { content?: Array<{ type: string; text?: string }> }): string {
  return data.content?.find((b) => b.type === 'text')?.text || '';
}

// ---------- Chain node types ----------

interface ChainStep {
  node: 'intent' | 'react' | 'report' | 'clarify' | 'plan' | 'search' | 'editor';
  result: unknown;
}

interface IntentResult {
  intent: 'organize' | 'search' | 'summarize' | 'chat' | 'deep_research';
  params: Record<string, string>;
  reasoning: string;
}

interface ReactResult {
  toolUsed: string | null;
  toolInput: Record<string, string> | null;
  toolResult: string | null;
  matchedNotes?: NoteSnippet[];
  reasoning: string;
}

// ---------- System Prompts ----------

const INTENT_SYSTEM_PROMPT = `<!-- 薯管家 Intent Agent -->
<current_time>2026-05</current_time>

<role>
薯管家意图分析专家。分析用户对收藏夹的操作意图，判断需要调用的工具类型，提取关键约束条件。
你服务于「薯管家」——小红书收藏夹 AI Agent。用户的所有请求都围绕其小红书收藏内容展开。
</role>

<intent_categories>
| 意图类别 | 触发关键词 | intent_category |
|---------|-----------|---------|
| 整理收藏 | 整理、分类、归类、帮我理一下 | organize |
| 搜索收藏 | 找、搜、查、之前收的那个… | search |
| 总结分类 | 总结、摘要、概括、分类情况 | summarize |
| 深度分析（行程/清单/对比/攻略） | 帮我排行程、做个清单、对比一下、做个攻略、对比分析 | generate |
| 闲聊/简单问答 | 你好、你能做什么、其他非收藏操作 | chat |
</intent_categories>

重要：当用户要求生成行程、做清单、对比产品、深度分析收藏内容时，必须返回 intent_category: "generate"，不要归为 chat 或 search。

<output_format>
{
  "core_intent": "核心意图描述（100字以内）",
  "intent_category": "organize / search / summarize / generate / chat",
  "key_constraints": {
    "category_filter": "美食 / 旅行 / 穿搭 / ... / null",
    "location_filter": "城市名 / null",
    "keyword": "关键实体 / null"
  },
  "confidence": 0.95
}
</output_format>`;

const REACT_CHAT_SYSTEM_PROMPT = `<!-- 薯管家 React Agent (Chat) -->
<current_time>2026-05</current_time>
<role>
薯管家执行引擎。根据上游意图分析结果，调用收藏管理工具完成用户请求。
</role>
<output_format>
{
  "draft_answer": {
    "content_type": "chat",
    "main_content": "回复内容"
  }
}
</output_format>`;

const REACT_TOOL_SYSTEM_PROMPT = `<!-- 薯管家 React Agent (Tool) -->
<current_time>2026-05</current_time>
<role>
薯管家执行引擎。根据上游意图分析结果，调用收藏管理工具完成用户请求。
</role>`;

const REPORT_SYSTEM_PROMPT = `<!-- 薯管家 Report Agent -->
<current_time>2026-05</current_time>

<role>
薯管家回复生成专家。基于工具执行结果，用薯管家的语气生成友好、简洁、实用的回复。
</role>

<character>
- 友好亲切，像朋友聊天
- 简洁实用，结论前置
- 适度 emoji（1-3 个）
- 用"你"不用"您"
- 禁止翻译腔和 AI 模板词
- 禁止"首先/其次/最后"
</character>

直接输出纯文本回复，不要使用任何 XML 标签。可以使用 emoji 和 markdown 加粗。`;

// ---------- Deep Research System Prompts ----------

const DR_CLARIFY_PROMPT = `你是薯管家的收藏分析师。用户发起了一个需要深度分析的请求。

你的任务：
1. 分析用户的请求意图
2. 从提供的收藏数据中识别相关笔记
3. 总结收藏数据概况，为后续分析做准备

输出格式（纯文本）：
- 用户需求理解（1-2句）
- 相关收藏数据概况（数量、涉及的主题、关键信息点）
- 分析方向建议`;

const DR_PLAN_PROMPT = `你是薯管家的分析规划师。根据用户需求和收藏数据概况，制定分析计划。

你的任务：将用户的大需求拆解为 3-5 个可执行的分析子任务。

输出格式（纯文本）：
任务 1: [任务描述]
任务 2: [任务描述]
任务 3: [任务描述]
...

每个任务应聚焦一个明确的分析维度。`;

const DR_SEARCH_PROMPT = `你是薯管家的收藏深度分析师。根据分析计划，从用户的收藏笔记中提取关键信息。

你的任务：
1. 针对每个子任务，从收藏数据中提取关键信息
2. 交叉验证多篇笔记中的信息
3. 标注时效性（过期内容降权）
4. 整理为结构化的分析素材

输出格式（纯文本）：按子任务分段输出关键发现。`;

const DR_REPORT_PROMPT = `你是薯管家的深度报告撰写专家。基于收藏分析素材，生成结构化、可执行的分析报告。

<character>
- 友好亲切，像朋友聊天
- 结论前置，信息密度高
- 适度 emoji（2-4 个）
- 用"你"不用"您"
- 可操作性强：行程具体到每天每个点位，对比给出明确推荐
</character>

<formatting>
- 使用 markdown 格式（标题、加粗、列表）
- 行程类用 "Day 1 / Day 2 / Day 3" 结构
- 对比类用表格或排序推荐
- 引用具体收藏笔记中的信息（店名、价格等）
</formatting>

直接输出纯文本报告，不要使用 XML 标签。`;

const DR_EDITOR_PROMPT = `你是薯管家的质量把关编辑。你的任务是对报告做最终润色。

规则：
1. 只改格式不改内容
2. 确保 markdown 格式正确（标题层级、加粗语法）
3. 确保语气一致（友好、口语化、薯管家风格）
4. 修正明显的错别字或格式错误
5. 确保信息准确、逻辑自洽

直接输出润色后的完整报告。`;

// ---------- Node 1: Intent Agent ----------

async function runIntentNode(message: string): Promise<{ step: ChainStep; intent: IntentResult }> {
  const data = await callClaude(INTENT_SYSTEM_PROMPT, [
    { role: 'user', content: message },
  ], { maxTokens: 300 });

  const text = extractText(data);

  let intent: IntentResult;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    const categoryToIntent: Record<string, string> = {
      organize: 'organize',
      search: 'search',
      summarize: 'summarize',
      generate: 'deep_research',
      cleanup: 'search',
      remind: 'chat',
      chat: 'chat',
    };
    const intentCategory = parsed.intent_category || parsed.intent || 'chat';
    intent = {
      intent: (categoryToIntent[intentCategory] || 'chat') as IntentResult['intent'],
      params: parsed.key_constraints
        ? Object.fromEntries(
            Object.entries(parsed.key_constraints).filter(([, v]) => v !== null && v !== 'null')
          ) as Record<string, string>
        : (parsed.params || {}),
      reasoning: parsed.core_intent || parsed.reasoning || '',
    };
  } catch {
    intent = { intent: 'chat', params: {}, reasoning: 'JSON 解析失败，默认为聊天意图' };
  }

  return {
    step: { node: 'intent', result: intent },
    intent,
  };
}

// ---------- Node 2: React Agent ----------

async function runReactNode(
  message: string,
  intent: IntentResult,
  context: string
): Promise<{ step: ChainStep; reactResult: ReactResult }> {
  const intentToTool: Record<string, string> = {
    organize: 'organize_favorites',
    search: 'search_favorites',
    summarize: 'summarize_category',
  };

  if (intent.intent === 'chat') {
    const systemPrompt = REACT_CHAT_SYSTEM_PROMPT + (context ? `\n\n用户的收藏概况：\n${context}` : '');
    const data = await callClaude(systemPrompt, [
      { role: 'user', content: `用户消息：${message}\n意图分析：${JSON.stringify(intent)}` },
    ], { maxTokens: 500 });

    return {
      step: { node: 'react', result: { toolUsed: null, reasoning: extractText(data) } },
      reactResult: { toolUsed: null, toolInput: null, toolResult: null, reasoning: extractText(data) },
    };
  }

  const toolName = intentToTool[intent.intent];
  const systemPrompt = REACT_TOOL_SYSTEM_PROMPT + `\n\n已识别的意图：${intent.intent}\n参数：${JSON.stringify(intent.params)}\n\n请调用 ${toolName} 工具来执行用户的请求。` + (context ? `\n\n用户的收藏概况：\n${context}` : '');

  const data = await callClaude(
    systemPrompt,
    [{ role: 'user', content: message }],
    { tools, maxTokens: 500 }
  );

  const toolUseBlock = data.content?.find(
    (block: { type: string }) => block.type === 'tool_use'
  );

  let reactResult: ReactResult;

  if (toolUseBlock && data.stop_reason === 'tool_use') {
    const toolInput = toolUseBlock.input || {};
    const toolResultObj = simulateToolResult(toolUseBlock.name, toolInput);
    reactResult = {
      toolUsed: toolUseBlock.name,
      toolInput,
      toolResult: toolResultObj.text,
      matchedNotes: toolResultObj.matchedNotes,
      reasoning: `调用工具 ${toolUseBlock.name}，参数：${JSON.stringify(toolInput)}`,
    };
  } else {
    const toolInput = intent.params;
    const toolResultObj = simulateToolResult(toolName, toolInput);
    reactResult = {
      toolUsed: toolName,
      toolInput,
      toolResult: toolResultObj.text,
      matchedNotes: toolResultObj.matchedNotes,
      reasoning: `根据意图直接执行 ${toolName}`,
    };
  }

  return {
    step: { node: 'react', result: reactResult },
    reactResult,
  };
}

// ---------- Node 3: Report Agent ----------

async function runReportNode(
  message: string,
  intent: IntentResult,
  reactResult: ReactResult
): Promise<{ step: ChainStep; reply: string }> {
  const userContent = [
    `用户消息：${message}`,
    `意图：${intent.intent}（${intent.reasoning}）`,
  ];

  if (reactResult.toolUsed) {
    userContent.push(`执行的工具：${reactResult.toolUsed}`);
    userContent.push(`工具结果：${reactResult.toolResult}`);
  } else {
    userContent.push(`推理要点：${reactResult.reasoning}`);
  }

  const data = await callClaude(REPORT_SYSTEM_PROMPT, [
    { role: 'user', content: userContent.join('\n\n') },
  ], { maxTokens: 800 });

  const reply = extractText(data) || '抱歉，我暂时无法回答，请稍后再试～';

  return {
    step: { node: 'report', result: { reply } },
    reply,
  };
}

// ---------- Deep Research Chain (5 nodes, 5 LLM calls) ----------

function getRelevantNotes(message: string, params: Record<string, string>): string {
  // Extract relevant notes based on user message and intent params
  const keywords = [
    message,
    params.category_filter || '',
    params.location_filter || '',
    params.keyword || '',
  ].join(' ').toLowerCase().split(/\s+/).filter(Boolean);

  const relevant = mockNotes.filter((note) => {
    const searchable = [
      note.title,
      note.content || '',
      ...(note.tags || []),
      ...(note.aiTags || []),
    ].join(' ').toLowerCase();
    return keywords.some((kw) => searchable.includes(kw));
  });

  // If too few matches, include all non-expired notes
  const notes = relevant.length >= 3 ? relevant : mockNotes.filter((n) => !n.isExpired);

  return notes.slice(0, 15).map((n) => (
    `【${n.title}】\n${n.content || '无正文'}\n标签: ${(n.aiTags || n.tags || []).join(', ')}${n.isExpired ? '\n⚠️ 可能已过期: ' + n.expiredReason : ''}`
  )).join('\n\n');
}

async function runDeepResearch(
  message: string,
  intent: IntentResult,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  chain: ChainStep[]
): Promise<string> {
  const noteContext = getRelevantNotes(message, intent.params);

  // Node 1: Clarify — analyze user request + collection data
  const clarifyData = await callClaude(DR_CLARIFY_PROMPT, [
    { role: 'user', content: `用户请求：${message}\n\n用户的相关收藏数据：\n${noteContext}` },
  ], { maxTokens: 400 });
  const clarifyResult = extractText(clarifyData);
  const clarifyStep: ChainStep = { node: 'clarify', result: { summary: clarifyResult } };
  chain.push(clarifyStep);
  controller.enqueue(encoder.encode(sseEncode('chain_step', { node: 'clarify', result: clarifyStep.result })));

  // Node 2: Plan — break down into sub-tasks
  const planData = await callClaude(DR_PLAN_PROMPT, [
    { role: 'user', content: `用户请求：${message}\n\n收藏数据概况：\n${clarifyResult}` },
  ], { maxTokens: 500 });
  const planResult = extractText(planData);
  const planStep: ChainStep = { node: 'plan', result: { plan: planResult } };
  chain.push(planStep);
  controller.enqueue(encoder.encode(sseEncode('chain_step', { node: 'plan', result: planStep.result })));

  // Node 3: Search — deep analysis of collection data
  const searchData = await callClaude(DR_SEARCH_PROMPT, [
    { role: 'user', content: `用户请求：${message}\n\n分析计划：\n${planResult}\n\n收藏笔记详情：\n${noteContext}` },
  ], { maxTokens: 800 });
  const searchResult = extractText(searchData);
  const searchStep: ChainStep = { node: 'search', result: { findings: searchResult } };
  chain.push(searchStep);
  controller.enqueue(encoder.encode(sseEncode('chain_step', { node: 'search', result: searchStep.result })));

  // Node 4: Report — generate structured report
  const reportData = await callClaude(DR_REPORT_PROMPT, [
    { role: 'user', content: `用户请求：${message}\n\n分析素材：\n${searchResult}\n\n收藏原始数据：\n${noteContext}` },
  ], { maxTokens: 1500 });
  const reportResult = extractText(reportData);
  const reportStep: ChainStep = { node: 'report', result: { reply: reportResult, deep: true } };
  chain.push(reportStep);
  controller.enqueue(encoder.encode(sseEncode('chain_step', { node: 'report', result: reportStep.result })));

  // Node 5: Editor — final polish
  const editorData = await callClaude(DR_EDITOR_PROMPT, [
    { role: 'user', content: `请润色以下报告：\n\n${reportResult}` },
  ], { maxTokens: 1500 });
  const finalReport = extractText(editorData) || reportResult;
  const editorStep: ChainStep = { node: 'editor', result: { reply: finalReport } };
  chain.push(editorStep);
  controller.enqueue(encoder.encode(sseEncode('chain_step', { node: 'editor', result: editorStep.result })));

  return finalReport;
}

// ---------- SSE Helper ----------

function sseEncode(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

// ---------- Direct Reply (simple chat, 1 LLM call) ----------

const DIRECT_REPLY_SYSTEM_PROMPT = `你是「薯管家」——小红书收藏夹的贴心管家。用户可能会跟你打招呼、问你能做什么、或者闲聊。

【你能做什么】
- 智能分类：一键整理收藏夹，AI 自动归类
- 搜索收藏：找到收藏过的任何内容
- 生成摘要：总结某个分类的收藏内容
- 制定攻略：从收藏的笔记里帮你排行程、做清单、对比产品（Deep Research 模式）
- 过期检测：识别已失效的收藏内容
- 定期推送：每天推送尘封好内容

【语言风格】
- 友好亲切，像朋友聊天
- 简洁实用，不废话
- 适度 emoji（1-2个）
- 用"你"不用"您"
- 禁止翻译腔（"我理解你的需求"、"让我来帮你"等）
- 禁止"首先/其次/最后"`;

async function runDirectReply(message: string): Promise<string> {
  const data = await callClaude(DIRECT_REPLY_SYSTEM_PROMPT, [
    { role: 'user', content: message },
  ], { maxTokens: 300 });

  return extractText(data) || '你好呀～有什么收藏相关的事情我可以帮你吗？📚';
}

// ---------- Simple chat detection (skip Intent + React chain) ----------

const CHAT_PATTERNS = [
  /^(你好|hi|hello|hey|嗨|哈喽|在吗|在不在)/i,
  /^(你是谁|你叫什么|你能做什么|你会什么|有什么功能)/,
  /^(谢谢|感谢|好的|收到|知道了|明白|ok|好哒|嗯嗯)/i,
  /^(早上好|晚上好|下午好|早安|晚安)/,
  /^.{0,8}(吗|呢|吧|啊|哦|呀)[？?！!。]*$/,
];

function isSimpleChat(msg: string): boolean {
  const trimmed = msg.trim();
  if (trimmed.length <= 15 && CHAT_PATTERNS.some((p) => p.test(trimmed))) return true;
  return false;
}

// ---------- API Route ----------
//
// 三条链路，按意图复杂度分级：
//
// ┌─────────────────────────────────────────────────────────────────────┐
// │ 链路 A：Direct Reply（1 次 LLM）                                    │
// │ 适用：日常闲聊、打招呼、问功能介绍                                     │
// │ 示例："你好" "你能做什么" "谢谢"                                      │
// │ 路径：pattern match → runDirectReply                                │
// │ 不走 Intent 分类，不调用任何工具，响应最快                              │
// ├─────────────────────────────────────────────────────────────────────┤
// │ 链路 B：ReAct Chain（3 次 LLM）                                     │
// │ 适用：需要调用工具的单步操作——搜索、整理、总结                           │
// │ 示例："找一下成都美食" "帮我整理收藏夹" "总结穿搭收藏"                    │
// │ 路径：Intent → React（工具调用）→ Report（生成回复）                    │
// │ React 节点负责选择并执行工具，Report 节点将结果转化为自然语言              │
// ├─────────────────────────────────────────────────────────────────────┤
// │ 链路 C：Deep Research（6 次 LLM）                                   │
// │ 适用：多步推理的复杂分析——行程规划、产品对比、深度攻略                     │
// │ 示例："根据收藏做三天成都行程" "对比这几款粉底液" "帮我做露营清单"          │
// │ 路径：Intent → Clarify → Plan → Search → Report → Editor            │
// │ 5 个 Agent 协作，逐步拆解需求、检索收藏、生成结构化报告                   │
// └─────────────────────────────────────────────────────────────────────┘

export async function POST(request: NextRequest) {
  const { message, context } = await request.json();

  if (!message) {
    return Response.json({ error: 'message is required' }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const chain: ChainStep[] = [];

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // ======== 链路 A: Direct Reply (1 LLM call) ========
        // 日常闲聊、打招呼等无需工具调用的简单对话
        if (isSimpleChat(message)) {
          const chatIntent: IntentResult = { intent: 'chat', params: {}, reasoning: '日常对话' };
          chain.push({ node: 'intent', result: chatIntent });
          controller.enqueue(encoder.encode(sseEncode('chain_step', { node: 'intent', result: chatIntent })));

          const reply = await runDirectReply(message);
          chain.push({ node: 'report', result: { reply, direct: true } });
          controller.enqueue(encoder.encode(sseEncode('done', { reply, chain })));
          controller.close();
          return;
        }

        // 非简单对话 → 先走 Intent Agent 判断意图
        const { step: intentStep, intent } = await runIntentNode(message);
        chain.push(intentStep);
        controller.enqueue(encoder.encode(sseEncode('chain_step', { node: 'intent', result: intentStep.result })));

        // Intent 判定为闲聊 → 仍走 Direct Reply（2 LLM calls: intent + reply）
        if (intent.intent === 'chat') {
          const reply = await runDirectReply(message);
          chain.push({ node: 'report', result: { reply, direct: true } });
          controller.enqueue(encoder.encode(sseEncode('done', { reply, chain })));
          controller.close();
          return;
        }

        // ======== 链路 C: Deep Research (6 LLM calls) ========
        // 复杂分析：行程规划、产品对比、深度攻略
        if (intent.intent === 'deep_research') {
          const reply = await runDeepResearch(message, intent, controller, encoder, chain);
          controller.enqueue(encoder.encode(sseEncode('done', { reply, chain })));
          controller.close();
          return;
        }

        // ======== 链路 B: ReAct Chain (3 LLM calls) ========
        // 单步工具操作：搜索收藏、整理分类、总结摘要
        const { step: reactStep, reactResult } = await runReactNode(message, intent, context || '');
        chain.push(reactStep);
        controller.enqueue(encoder.encode(sseEncode('chain_step', { node: 'react', result: reactStep.result })));

        const { step: reportStep, reply } = await runReportNode(message, intent, reactResult);
        chain.push(reportStep);
        controller.enqueue(encoder.encode(sseEncode('chain_step', { node: 'report', result: reportStep.result })));

        const response: Record<string, unknown> = { reply, chain };
        if (reactResult.toolUsed) {
          response.toolUse = {
            name: reactResult.toolUsed,
            input: reactResult.toolInput || {},
            result: reactResult.toolResult || '',
            matchedNotes: reactResult.matchedNotes || [],
          };
        }

        controller.enqueue(encoder.encode(sseEncode('done', response)));
        controller.close();
      } catch (error) {
        console.error('Chat chain error:', error);
        const errorResponse = {
          error: 'AI service error',
          reply: '抱歉，薯管家遇到了一点问题，请稍后再试～ 🥲',
          chain,
        };
        controller.enqueue(encoder.encode(sseEncode('error', errorResponse)));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
