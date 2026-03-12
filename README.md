# Portfolio Chatbot API

A production-grade, RAG-enabled chatbot API for Dharaneeshwar's portfolio. Powered by Google Gemini and built for Vercel Serverless.

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file based on the [Environment Variables Guide](README/environment-variables.md).

3. **Run local development server**:
   ```bash
   npm start
   ```

## 🛠 Tech Stack

- **AI Model**: Google Gemini (`gemini-1.5-flash` / `gemini-3.1-flash-lite-preview`)
- **Framework**: Vercel Serverless (Node.js runtime)
- **Language**: TypeScript
- **AI SDK**: [Vercel AI SDK](https://sdk.vercel.ai/)
- **Alerts**: Resend (email notifications on failure)

## 📁 Project Structure

- `api/`: Vercel Serverless Function entry points.
- `src/utils/`: Core logic for query classification and context building.
- `src/data/`: Structured resume data used for RAG.
- `README/`: Detailed documentation folder.

## 📜 Documentation

For more specific details, please see the following guides in the `README` folder:

- [**Architecture & RAG Flow**](README/architecture.md)
- [**API Specification**](README/api-spec.md)
- [**Environment Variables**](README/environment-variables.md)
- [**Deployment Guide**](README/deployment.md)

## 👤 Author

**Dharaneeshwar Shrisai Kumaraguru**  
[Website](https://dharanee.dev) | [LinkedIn](https://linkedin.com/in/dharaneeshwarsk/) | [GitHub](https://github.com/dharaneesk)
