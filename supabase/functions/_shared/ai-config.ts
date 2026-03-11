export type AIProvider = 'anthropic' | 'openai';

export type AITaskType =
  | 'chat_complex'
  | 'chat_simple'
  | 'gameplan'
  | 'email_sequence'
  | 'text_generation'
  | 'funnel_content'
  | 'color_palette'
  | 'visual_theme'
  | 'document_extraction';

export type SubscriptionTier = 'enterprise' | 'pro' | 'growth' | 'starter';

export interface ModelConfig {
  provider: AIProvider;
  model: string;
  maxTokens: number;
  temperature: number;
  costPer1kInput: number;
  costPer1kOutput: number;
}

export interface AIResponse {
  content: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
  model: string;
  provider: AIProvider;
  estimatedCostCents: number;
}

const ANTHROPIC_MODELS: Record<string, ModelConfig> = {
  opus: {
    provider: 'anthropic',
    model: 'claude-opus-4-6',
    maxTokens: 8000,
    temperature: 0.7,
    costPer1kInput: 0.005,
    costPer1kOutput: 0.025,
  },
  sonnet: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    maxTokens: 8000,
    temperature: 0.7,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
  },
  haiku: {
    provider: 'anthropic',
    model: 'claude-haiku-4-5',
    maxTokens: 4000,
    temperature: 0.7,
    costPer1kInput: 0.001,
    costPer1kOutput: 0.005,
  },
};

const OPENAI_MODELS: Record<string, ModelConfig> = {
  gpt54: {
    provider: 'openai',
    model: 'gpt-5.4',
    maxTokens: 4000,
    temperature: 0.7,
    costPer1kInput: 0.0025,
    costPer1kOutput: 0.015,
  },
  gpt5Mini: {
    provider: 'openai',
    model: 'gpt-5-mini',
    maxTokens: 4000,
    temperature: 0.7,
    costPer1kInput: 0.00025,
    costPer1kOutput: 0.002,
  },
  gpt5Nano: {
    provider: 'openai',
    model: 'gpt-5-nano',
    maxTokens: 4000,
    temperature: 0.7,
    costPer1kInput: 0.00005,
    costPer1kOutput: 0.0004,
  },
  gpt4o: {
    provider: 'openai',
    model: 'gpt-4o',
    maxTokens: 4000,
    temperature: 0.7,
    costPer1kInput: 0.0025,
    costPer1kOutput: 0.01,
  },
  gpt4oMini: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    maxTokens: 4000,
    temperature: 0.7,
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
  },
};

type ModelKey = 'opus' | 'sonnet' | 'haiku' | 'gpt54' | 'gpt5Mini' | 'gpt5Nano' | 'gpt4o' | 'gpt4oMini';

const TIER_TASK_MODEL_MAP: Record<SubscriptionTier, Record<AITaskType, ModelKey>> = {
  enterprise: {
    chat_complex: 'opus',
    chat_simple: 'sonnet',
    gameplan: 'opus',
    email_sequence: 'opus',
    text_generation: 'sonnet',
    funnel_content: 'opus',
    color_palette: 'haiku',
    visual_theme: 'haiku',
    document_extraction: 'opus',
  },
  pro: {
    chat_complex: 'sonnet',
    chat_simple: 'haiku',
    gameplan: 'sonnet',
    email_sequence: 'sonnet',
    text_generation: 'haiku',
    funnel_content: 'sonnet',
    color_palette: 'haiku',
    visual_theme: 'haiku',
    document_extraction: 'sonnet',
  },
  growth: {
    chat_complex: 'haiku',
    chat_simple: 'haiku',
    gameplan: 'haiku',
    email_sequence: 'haiku',
    text_generation: 'haiku',
    funnel_content: 'haiku',
    color_palette: 'haiku',
    visual_theme: 'haiku',
    document_extraction: 'haiku',
  },
  starter: {
    chat_complex: 'haiku',
    chat_simple: 'haiku',
    gameplan: 'haiku',
    email_sequence: 'haiku',
    text_generation: 'haiku',
    funnel_content: 'haiku',
    color_palette: 'haiku',
    visual_theme: 'haiku',
    document_extraction: 'haiku',
  },
};

const ALL_MODELS: Record<ModelKey, ModelConfig> = {
  ...ANTHROPIC_MODELS,
  ...OPENAI_MODELS,
} as Record<ModelKey, ModelConfig>;

export function getModelConfigForTask(
  taskType: AITaskType,
  tier: SubscriptionTier = 'starter'
): ModelConfig {
  const modelKey = TIER_TASK_MODEL_MAP[tier][taskType];
  return ALL_MODELS[modelKey];
}

export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  config: ModelConfig
): number {
  const inputCost = (inputTokens / 1000) * config.costPer1kInput;
  const outputCost = (outputTokens / 1000) * config.costPer1kOutput;
  return Math.ceil((inputCost + outputCost) * 100);
}

export function mapPlanNameToTier(planName: string | null | undefined): SubscriptionTier {
  if (!planName) return 'starter';
  const normalized = planName.toLowerCase();
  if (normalized.includes('enterprise')) return 'enterprise';
  if (normalized.includes('pro')) return 'pro';
  if (normalized.includes('growth')) return 'growth';
  return 'starter';
}

async function callAnthropicProvider(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  config: ModelConfig,
  options: { maxTokens?: number; temperature?: number } = {}
): Promise<AIResponse> {
  const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!anthropicApiKey) {
    throw new Error("Anthropic API key not configured");
  }

  const maxTokens = options.maxTokens ?? config.maxTokens;
  const temperature = options.temperature ?? config.temperature;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": anthropicApiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text || "";
  const inputTokens = data.usage?.input_tokens || 0;
  const outputTokens = data.usage?.output_tokens || 0;

  return {
    content,
    usage: {
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens,
    },
    model: config.model,
    provider: 'anthropic',
    estimatedCostCents: calculateCost(inputTokens, outputTokens, config),
  };
}

async function callOpenAIProvider(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  config: ModelConfig,
  options: { maxTokens?: number; temperature?: number } = {}
): Promise<AIResponse> {
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiApiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const maxTokens = options.maxTokens ?? config.maxTokens;
  const temperature = options.temperature ?? config.temperature;

  const openaiMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: maxTokens,
      temperature,
      messages: openaiMessages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  const inputTokens = data.usage?.prompt_tokens || 0;
  const outputTokens = data.usage?.completion_tokens || 0;

  return {
    content,
    usage: {
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens,
    },
    model: config.model,
    provider: 'openai',
    estimatedCostCents: calculateCost(inputTokens, outputTokens, config),
  };
}

export async function callAI(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  taskType: AITaskType,
  tier: SubscriptionTier = 'starter',
  options: {
    maxTokens?: number;
    temperature?: number;
    preferredProvider?: AIProvider;
  } = {}
): Promise<AIResponse> {
  const config = getModelConfigForTask(taskType, tier);

  const effectiveProvider = options.preferredProvider || config.provider;

  if (effectiveProvider === 'openai') {
    try {
      return await callOpenAIProvider(systemPrompt, messages, config, options);
    } catch (error) {
      console.warn(`OpenAI failed, falling back to Anthropic: ${error.message}`);
      const anthropicConfig = ANTHROPIC_MODELS.haiku;
      return await callAnthropicProvider(systemPrompt, messages, anthropicConfig, options);
    }
  }

  try {
    return await callAnthropicProvider(systemPrompt, messages, config, options);
  } catch (error) {
    console.warn(`Anthropic failed, attempting OpenAI fallback: ${error.message}`);
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (openaiKey) {
      const openaiConfig = OPENAI_MODELS.gpt5Nano;
      return await callOpenAIProvider(systemPrompt, messages, openaiConfig, options);
    }
    throw error;
  }
}

export async function callAnthropic(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  taskType: AITaskType | 'chat' | 'gameplan' | 'text_generation' | 'funnel_content' | 'color_palette' | 'visual_theme',
  options: {
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<{
  content: string;
  usage: { input_tokens: number; output_tokens: number; total_tokens: number };
  model: string;
}> {
  let mappedTaskType: AITaskType;
  switch (taskType) {
    case 'chat':
      mappedTaskType = 'chat_complex';
      break;
    case 'gameplan':
      mappedTaskType = 'gameplan';
      break;
    case 'text_generation':
      mappedTaskType = 'text_generation';
      break;
    case 'funnel_content':
      mappedTaskType = 'funnel_content';
      break;
    case 'color_palette':
      mappedTaskType = 'color_palette';
      break;
    case 'visual_theme':
      mappedTaskType = 'visual_theme';
      break;
    default:
      mappedTaskType = taskType as AITaskType;
  }

  const result = await callAI(systemPrompt, messages, mappedTaskType, 'starter', options);
  return {
    content: result.content,
    usage: result.usage,
    model: result.model,
  };
}

export function detectChatComplexity(message: string): 'chat_simple' | 'chat_complex' {
  const complexIndicators = [
    'strategy', 'plan', 'analyze', 'design', 'create a', 'build a',
    'help me with', 'how should i', 'what\'s the best way',
    'funnel', 'sequence', 'campaign', 'launch', 'course',
    'pricing', 'positioning', 'audience', 'niche',
    'step by step', 'detailed', 'comprehensive',
  ];

  const lowerMessage = message.toLowerCase();
  const wordCount = message.split(/\s+/).length;

  if (wordCount > 30) return 'chat_complex';

  for (const indicator of complexIndicators) {
    if (lowerMessage.includes(indicator)) return 'chat_complex';
  }

  return 'chat_simple';
}

export function getAvailableModels(): Record<string, ModelConfig> {
  return { ...ALL_MODELS };
}

export function getTierModelMapping(): Record<SubscriptionTier, Record<AITaskType, ModelKey>> {
  return { ...TIER_TASK_MODEL_MAP };
}
