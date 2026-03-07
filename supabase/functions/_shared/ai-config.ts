export type AITaskType =
  | 'chat'
  | 'gameplan'
  | 'text_generation'
  | 'funnel_content'
  | 'color_palette'
  | 'visual_theme';

export type ModelTier = 'fast' | 'balanced' | 'capable';

interface ModelConfig {
  model: string;
  maxTokens: number;
  temperature: number;
}

const MODELS: Record<ModelTier, ModelConfig> = {
  fast: {
    model: 'claude-3-5-haiku-20241022',
    maxTokens: 1500,
    temperature: 0.7,
  },
  balanced: {
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 2000,
    temperature: 0.7,
  },
  capable: {
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 4000,
    temperature: 0.7,
  },
};

const TASK_MODEL_MAPPING: Record<AITaskType, ModelTier> = {
  chat: 'balanced',
  gameplan: 'capable',
  text_generation: 'fast',
  funnel_content: 'balanced',
  color_palette: 'fast',
  visual_theme: 'fast',
};

export function getModelConfig(taskType: AITaskType): ModelConfig {
  const tier = TASK_MODEL_MAPPING[taskType];
  return MODELS[tier];
}

export function getModelForTask(taskType: AITaskType): string {
  return getModelConfig(taskType).model;
}

export function getMaxTokensForTask(taskType: AITaskType): number {
  return getModelConfig(taskType).maxTokens;
}

export function getTemperatureForTask(taskType: AITaskType): number {
  return getModelConfig(taskType).temperature;
}

export async function callAnthropic(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  taskType: AITaskType,
  options: {
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<{
  content: string;
  usage: { input_tokens: number; output_tokens: number; total_tokens: number };
  model: string;
}> {
  const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!anthropicApiKey) {
    throw new Error("Anthropic API key not configured");
  }

  const config = getModelConfig(taskType);
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
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text || "";
  const usage = {
    input_tokens: data.usage?.input_tokens || 0,
    output_tokens: data.usage?.output_tokens || 0,
    total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
  };

  return { content, usage, model: config.model };
}
