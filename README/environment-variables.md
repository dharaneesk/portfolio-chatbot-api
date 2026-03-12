# Environment Variables

The following environment variables are required for the API to function correctly:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Your Google AI Studio API key. | `AIza...` |
| `RESEND_API_KEY` | API key from Resend for email alerts. | `re_...` |
| `ALLOWED_ORIGIN` | The origin URL allowed to call the API. | `https://dharanee.dev` |
| `ALERT_FROM_EMAIL` | Verified sender email in Resend. | `alerts@dharanee.dev` |
| `ALERT_TO_EMAIL` | Recipient email for failure alerts. | `me@gmail.com` |
| `RATE_LIMIT_MAX` | Max requests per window. | `20` |
| `RATE_LIMIT_WINDOW_MS` | Window duration in milliseconds. | `60000` |
| `AI_MODEL_ID` | (Optional) Override the default Gemini model. | `gemini-1.5-flash` |
