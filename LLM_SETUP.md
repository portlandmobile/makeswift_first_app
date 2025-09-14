# AI Chat Agent - LLM Integration Setup

## Overview
The AI Chat Agent now supports multiple LLM providers including Google Gemini, OpenAI ChatGPT, and Anthropic Claude.

## Environment Variables
Add these to your `.env.local` file:

```bash
# Makeswift Configuration
MAKESWIFT_SITE_API_KEY=your_makeswift_site_api_key_here

# LLM API Keys (choose one or more)
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic Claude API Key
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## Getting API Keys

### Google Gemini
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the API key and add it to your `.env.local` as `GEMINI_API_KEY`
4. Note: Uses the `gemini-1.5-flash` model by default

### OpenAI ChatGPT
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Copy the API key and add it to your `.env.local` as `OPENAI_API_KEY`

### Anthropic Claude
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Navigate to API Keys
3. Create a new API key
4. Copy the API key and add it to your `.env.local` as `ANTHROPIC_API_KEY`

## Usage

### In Makeswift Visual Editor
1. Add the AI Chat Agent component to your page
2. In the component properties panel:
   - Select your preferred LLM Provider (Gemini, OpenAI, Anthropic, or Mock)
   - Optionally provide an API Key (if not using environment variables)
   - Customize other settings as needed

### Programmatically
```typescript
// Example usage with different providers
<AIChatAgent 
  llmProvider="gemini"
  apiKey="your-api-key-here" // optional if using env vars
  title="AI Assistant"
  welcomeMessage="Hello! How can I help you today?"
/>
```

## Features
- **Multi-provider support**: Switch between different LLM providers
- **Environment variable support**: Secure API key management
- **Conversation history**: Maintains context across messages
- **Error handling**: Graceful fallbacks and error messages
- **Customizable**: Full control over UI and behavior

## Testing
- Start with `mock` provider for testing without API costs
- Switch to real providers once you have API keys configured
- All providers maintain conversation context and history
