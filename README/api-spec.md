# API Specification

## Chat Endpoint

`POST /api/chat`

Handles streaming AI chat responses based on portfolio context.

### Request Body

```json
{
  "messages": [
    {
      "role": "user",
      "content": "What is Dharaneeshwar's experience with Java?"
    }
  ]
}
```

### Responses

- **200 OK**: Streams a text response.
- **429 Too Many Requests**: Rate limit exceeded.
- **500 Internal Server Error**: Configuration error or AI generation failure.

## Preflight Endpoint

`OPTIONS /api/chat`

Handles CORS preflight requests.
