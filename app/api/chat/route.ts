import { NextRequest, NextResponse } from 'next/server'

// LLM Provider Types
type LLMProvider = 'gemini' | 'openai' | 'anthropic' | 'mock'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  message: string
  conversation: ChatMessage[]
  provider?: LLMProvider
  apiKey?: string
}

// Gemini API Integration
async function callGeminiAPI(message: string, conversation: ChatMessage[], apiKey: string) {
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`
  
  // Convert conversation to Gemini format
  const contents = []
  
  // Add conversation history (only user and assistant messages)
  for (const msg of conversation) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      contents.push({
        parts: [{ text: msg.content }],
        role: msg.role === 'user' ? 'user' : 'model'
      })
    }
  }
  
  // Add current message
  contents.push({
    parts: [{ text: message }],
    role: 'user'
  })

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Gemini API Error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
      url: url.replace(apiKey, 'API_KEY_HIDDEN')
    })
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  console.log('Gemini API Response:', JSON.stringify(data, null, 2))
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response format from Gemini API')
  }
  
  return data.candidates[0].content.parts[0].text
}

// OpenAI API Integration
async function callOpenAIAPI(message: string, conversation: ChatMessage[], apiKey: string) {
  const url = 'https://api.openai.com/v1/chat/completions'
  
  // Convert conversation to OpenAI format
  const messages = [
    { role: 'system', content: 'You are a helpful AI assistant.' },
    ...conversation.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user', content: message }
  ]

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// Anthropic Claude API Integration
async function callAnthropicAPI(message: string, conversation: ChatMessage[], apiKey: string) {
  const url = 'https://api.anthropic.com/v1/messages'
  
  // Convert conversation to Anthropic format
  const systemMessage = conversation.find(msg => msg.role === 'system')?.content || 'You are a helpful AI assistant.'
  const conversationMessages = conversation.filter(msg => msg.role !== 'system')
  
  const messages = [
    ...conversationMessages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    })),
    { role: 'user' as const, content: message }
  ]

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      system: systemMessage,
      messages,
    })
  })

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`)
  }

  const data = await response.json()
  return data.content[0].text
}

// Mock responses for testing
async function getMockResponse(message: string) {
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
  
  const responses = [
    "That's an interesting question! Let me help you with that.",
    "I understand what you're asking. Here's what I think...",
    "Great question! Based on what you've shared, I'd suggest...",
    "I'd be happy to help you with that. Here's my perspective...",
    "That's a good point. Let me provide some insights on that topic.",
  ]

  let contextualResponse = responses[Math.floor(Math.random() * responses.length)]
  
  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
    contextualResponse = "Hello! It's great to meet you. How can I assist you today?"
  } else if (message.toLowerCase().includes('help')) {
    contextualResponse = "I'm here to help! What specific topic or question would you like to explore?"
  } else if (message.toLowerCase().includes('thank')) {
    contextualResponse = "You're very welcome! I'm glad I could help. Is there anything else you'd like to know?"
  }

  return contextualResponse
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversation, provider = 'mock', apiKey }: ChatRequest = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    let response: string

    try {
      switch (provider) {
        case 'gemini':
          if (!apiKey) {
            const geminiKey = process.env.GEMINI_API_KEY
            if (!geminiKey) {
              throw new Error('Gemini API key not provided. Please add GEMINI_API_KEY to your environment variables or pass apiKey in the request.')
            }
            response = await callGeminiAPI(message, conversation || [], geminiKey)
          } else {
            response = await callGeminiAPI(message, conversation || [], apiKey)
          }
          break

        case 'openai':
          if (!apiKey) {
            const openaiKey = process.env.OPENAI_API_KEY
            if (!openaiKey) {
              throw new Error('OpenAI API key not provided. Please add OPENAI_API_KEY to your environment variables or pass apiKey in the request.')
            }
            response = await callOpenAIAPI(message, conversation || [], openaiKey)
          } else {
            response = await callOpenAIAPI(message, conversation || [], apiKey)
          }
          break

        case 'anthropic':
          if (!apiKey) {
            const anthropicKey = process.env.ANTHROPIC_API_KEY
            if (!anthropicKey) {
              throw new Error('Anthropic API key not provided. Please add ANTHROPIC_API_KEY to your environment variables or pass apiKey in the request.')
            }
            response = await callAnthropicAPI(message, conversation || [], anthropicKey)
          } else {
            response = await callAnthropicAPI(message, conversation || [], apiKey)
          }
          break

        case 'mock':
        default:
          response = await getMockResponse(message)
          break
      }

      return NextResponse.json({
        response,
        timestamp: new Date().toISOString(),
        provider
      })

    } catch (llmError) {
      console.error('LLM API error:', llmError)
      return NextResponse.json(
        { 
          error: `LLM API error: ${llmError instanceof Error ? llmError.message : 'Unknown error'}`,
          provider,
          fallback: true
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
