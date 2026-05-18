import { NextRequest } from 'next/server';

const BASE_URL = process.env.ANTHROPIC_BASE_URL!;
const AUTH_TOKEN = process.env.ANTHROPIC_AUTH_TOKEN!;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-6';

export async function POST(request: NextRequest) {
  const { notes } = await request.json();

  if (!notes || !Array.isArray(notes) || notes.length === 0) {
    return Response.json({ error: 'notes array is required' }, { status: 400 });
  }

  // Build a concise representation of notes for the LLM
  const notesSummary = notes.map((n: { id: string; title: string; content?: string; tags?: string[]; collectTime: string }) => ({
    id: n.id,
    title: n.title,
    content: n.content || '',
    tags: n.tags || [],
    collectTime: n.collectTime,
  }));

  const prompt = `你是小红书收藏夹 AI 整理助手。请分析以下用户收藏的笔记，完成智能分类。

要求：
1. 根据笔记内容自动生成 5-8 个分类（如：穿搭灵感、美食菜谱、旅行攻略、护肤科普、学习效率、家居生活、美妆教程 等）
2. 每个分类配一个 emoji 图标
3. 每个分类生成一段 AI 摘要（30-50 字，概括该分类下笔记的特点）
4. 将每条笔记归入最合适的分类（一条笔记只归一个分类）
5. 识别可能过期的内容（活动类、时效性强的笔记）

用户收藏的笔记：
${JSON.stringify(notesSummary, null, 2)}

请严格按以下 JSON 格式返回（不要有其他文字）：
{
  "categories": [
    {
      "name": "分类名",
      "icon": "emoji",
      "aiSummary": "AI 摘要文本",
      "noteIds": ["1", "2"]
    }
  ],
  "expiredNoteIds": ["id1"],
  "expiredReasons": {"id1": "过期原因"}
}`;

  try {
    const response = await fetch(`${BASE_URL}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AUTH_TOKEN,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLM API error:', response.status, errorText);
      return Response.json({ error: 'AI service error', details: errorText }, { status: 502 });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    // Extract JSON from response (handle potential markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    return Response.json(result);
  } catch (error) {
    console.error('Organize API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
