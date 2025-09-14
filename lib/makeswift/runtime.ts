import { ReactRuntime } from '@makeswift/runtime/react'
import { lazy } from 'react'
import { TextInput, Checkbox, Style, Select } from '@makeswift/runtime/controls'

export const runtime = new ReactRuntime({
  breakpoints: {
    mobile: { width: 575, viewport: 390, label: 'Mobile' },
    tablet: { width: 768, viewport: 765, label: 'Tablet' },
    laptop: { width: 1024, viewport: 1000, label: 'Laptop' },
    external: { width: 1280, label: 'External' },
  },
})

// Register AI Chat Agent component
runtime.registerComponent(
  lazy(() => import('@/components/AIChatAgent/AIChatAgent')),
  {
    type: 'ai-chat-agent',
    label: 'AI Chat Agent',
    props: {
      title: TextInput({
        label: 'Title',
        defaultValue: 'AI Assistant',
      }),
      placeholder: TextInput({
        label: 'Placeholder Text',
        defaultValue: 'Ask me anything...',
      }),
      sendButtonText: TextInput({
        label: 'Send Button Text',
        defaultValue: 'Send',
      }),
      welcomeMessage: TextInput({
        label: 'Welcome Message',
        defaultValue: 'Hello! I\'m your AI assistant. How can I help you today?',
      }),
      apiEndpoint: TextInput({
        label: 'API Endpoint',
        defaultValue: '/api/chat',
        helpText: 'The API endpoint for handling chat messages',
      }),
      isMinimized: Checkbox({
        label: 'Start Minimized',
        defaultValue: false,
      }),
      llmProvider: Select({
        label: 'LLM Provider',
        options: [
          { label: 'Mock (Testing)', value: 'mock' },
          { label: 'Google Gemini', value: 'gemini' },
          { label: 'OpenAI ChatGPT', value: 'openai' },
          { label: 'Anthropic Claude', value: 'anthropic' },
        ],
        defaultValue: 'mock',
      }),
      apiKey: TextInput({
        label: 'API Key',
        helpText: 'Optional: API key for the selected LLM provider. If not provided, will use environment variables.',
      }),
      className: Style(),
    },
  }
)
