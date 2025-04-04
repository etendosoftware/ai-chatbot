import { createOpenAI, openai} from '@ai-sdk/openai';
import { RestUtils } from '@/utils/environment';
import { References } from '@/utils/references';
import {
  customProvider,
} from 'ai';

export const DEFAULT_CHAT_MODEL: string = 'chat-model-small';

const copilot = createOpenAI({
  baseURL: process.env.ETENDO_URL_COPILOT + '/openai/v1'
})

export const myProvider = customProvider({
  languageModels: {
    'chat-model-small': copilot('o3-mini'),
    'chat-model-large': copilot('gpt-4o'),
    'chat-model-reasoning': copilot('o3-mini'),
    'title-model': openai('gpt-4-turbo'),
    'block-model': openai('gpt-4o-mini'),
  },
  imageModels: {
    'small-model': openai.image('dall-e-2'),
    'large-model': openai.image('dall-e-3'),
  },
});

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model-small',
    name: 'Etendo Copilot',
    description: 'Etendo declared model'
  },
  {
    id: 'chat-model-large',
    name: 'Large model',
    description: 'Large model for complex, multi-step tasks',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Reasoning model',
    description: 'Uses advanced reasoning',
  },
];

export async function fetchChatModelsFromBackend() {
  const requestOptions = {
    method: 'GET',
  };
  const response = await RestUtils.fetch(References.url.GET_ASSISTANTS, requestOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch models');
  }
  return response.json();
}
