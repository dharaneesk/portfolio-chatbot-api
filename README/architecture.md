# System Architecture

The Portfolio Chatbot API uses a Retrieval-Augmented Generation (RAG) architecture to provide accurate answers about Dharaneeshwar's career.

## Data Flow

1. **Request Reception**: The `api/chat.ts` endpoint receives a user message.
2. **Rate Limiting & Security**: Requests are validated for origin (CORS) and rate-limited by IP.
3. **Query Classification**: The `classifyUserQuery` utility analyzes the user's intent using regex patterns.
4. **Context Retrieval**: Based on the classification, relevant snippets from the pre-computed resume data are retrieved.
5. **Prompt Construction**: A system prompt is built, injecting the retrieved context and conversation history.
6. **Streaming Completion**: The Vercel AI SDK streams the response from Google Gemini to the client.
7. **Error Reporting**: Failures at any stage trigger an email alert via Resend to the administrator.

## Core Utilities

- **`chatHelpers.ts`**: Contains the logic for categorizing queries and building the markdown context.
- **`utils.ts`**: Shared API utilities for CORS, IP detection, and email alerts.
